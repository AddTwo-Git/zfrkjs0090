sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/core/routing/History",
    "sap/ui/core/message/Message",
    "sap/m/MessageToast",
    "readians/zfrkjs0090/model/Validator",
    "sap/ui/core/Fragment",
    "sap/ui/unified/FileUploaderParameter",
    "readians/zfrkjs0090/model/Constants",
    "sap/ui/core/Item",
    "readians/zfrkjs0090/model/ValueHelp",
    "sap/m/MessageBox",
    "../../model/Formatter",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    Sorter,
    History,
    Message,
    MessageToast,
    Validator,
    Fragment,
    FileUploaderParameter,
    Constants,
    Item,
    ValueHelp,
    MessageBox,
    Formatter
  ) {
    "use strict";
    const namespace = "readians.zfrkjs0090";
    const moduleName = namespace + ".common.BaseController";

    return Controller.extend(moduleName, {
      formatter: Formatter,

      /**
       * @override
       * @param {any} sName
       * @returns {sap.ui.core.mvc.Controller}
       */
      constructor: function (sName) {
        var vReturn = Controller.prototype.constructor.apply(this, arguments);

        return vReturn;
      },

      initController: function () {
        this.constants = new Constants(
          this.getModel("i18n").getResourceBundle()
        );
        this.valueHelp = new ValueHelp(
          this.getOwnerComponent().getModel("i18n").getResourceBundle()
        );
        this.validator = new Validator(
          this.getModel("i18n").getResourceBundle()
        );

        this.constants.setConstant();
        this.popupFragment = ".view.popup.";
        this.f4Fragmenet = ".view.f4";
        this.operator = this.constants.operator;
        this.messageAction = this.constants.messageAction;
        this.messageType = this.constants.messageType;
        this.fragments = [];
        this.modelMessageType = this.constants.modelMessageType;
      },

      getValidator: function () {
        return this.validator;
      },

      /**
       * Return JSON Model Object
       * @param {Object} initData
       * data to set JSONModel
       * @returns {sap.ui.model.json.JSONModel}
       * JSON Model Object
       */
      createJSONModel: function (initData) {
        let JSONmodel = new JSONModel();

        if (initData) {
          JSONmodel.setData(initData);
        }

        return JSONmodel;
      },

      /**
       * Return model object assigned Component or view
       * @param {string} sName
       * Model Name
       * @returns {T extends sap.ui.model.Model}
       * Model Object
       */
      getModel: function (sName) {
        var oModel = this.getView().getModel(sName);

        if (oModel) {
          // 뷰모델
          return oModel;
        } else {
          // 컴포넌트모델
          return this.getOwnerComponent().getModel(sName);
        }
      },

      /**
       * Set named model to view
       * @param {T extends sap.ui.model.Model} oModel
       * Model Object
       * @param {string} sName
       * Model Name
       */
      setModel: function (oModel, sName) {
        this.getView().setModel(oModel, sName);
      },

      /**
       * Get i18n text data
       * @param {string} sKey
       * i18n key
       * @param {Array<string>} aParams
       * i18n parameters replace placeholder
       * @returns
       */
      getI18nText: function (sKey, aParams) {
        if (!aParams) {
          aParams = [];
        }

        return this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sKey, aParams);
      },

      /***************************************************************
       * ■ 필터
       ***************************************************************/
      // 필터생성
      makeFilter: function (aFields, sOperator, vValue, bAnd) {
        if (
          !_.isArray(aFields) ||
          !aFields.length ||
          _.indexOf(_.toArray(this.OP), sOperator) < 0
        ) {
          return null;
        }

        return new Filter({
          filters: _.map(aFields, function (sField) {
            return new Filter(sField, sOperator, vValue);
          }),
          and: !!bAnd,
        });
      },

      /**
       *
       * @param {Array} aSettings
       * [
       *  {
       *    field: 'fieldName',
       *    op: 'EQ',
       *    from: 'FromValue',
       *    to: 'ToValue'
       *  },
       *  ...
       * ]
       * @param {Boolean} bAnd
       * @returns Filter Object
       */
      makeMultiFilter: function (aSettings, bAnd) {
        var self = this;
        var aFilters = [];
        var oFilter = null;
        var aSummary = [];

        aFilters = _.reduce(
          aSettings,
          function (memo01, oSetting) {
            aSummary = [];
            if (_.isArray(oSetting.from)) {
              // 배열인 경우 처리
              aSummary = _.reduce(
                oSetting.from,
                function (memo02, sValue) {
                  if (!_.isUndefined(sValue) && !_.isNull(sValue)) {
                    oFilter = null;

                    if (oSetting.blank) {
                      oFilter = self.makeFilter(
                        [oSetting.field],
                        oSetting.op,
                        sValue,
                        false
                      );
                    } else if (!oSetting.blank && sValue) {
                      oFilter = self.makeFilter(
                        [oSetting.field],
                        oSetting.op,
                        sValue,
                        false
                      );
                    }

                    if (oFilter) {
                      memo02.push(oFilter);
                    }

                    return memo02;
                  }
                },
                []
              );

              if (aSummary.length) {
                memo01.push(
                  new Filter({
                    filters: aSummary,
                    and: false,
                  })
                );
              }
            } else {
              //배열이 아닌 단일값
              if (!_.isUndefined(oSetting.to) && !_.isNull(oSetting.to)) {
                memo01.push(
                  new Filter(
                    oSetting.field,
                    oSetting.op,
                    oSetting.from,
                    oSetting.to
                  )
                );
              } else {
                if (!_.isUndefined(oSetting.from) && !_.isNull(oSetting.from)) {
                  if (_.isString(oSetting.from)) {
                    if (oSetting.from.length) {
                      memo01.push(
                        new Filter(oSetting.field, oSetting.op, oSetting.from)
                      );
                    } else if (oSetting.blank) {
                      memo01.push(
                        new Filter(oSetting.field, oSetting.op, oSetting.from)
                      );
                    }
                  } else if (_.isNumber(oSetting.from)) {
                    if (oSetting.from) {
                      memo01.push(
                        new Filter(oSetting.field, oSetting.op, oSetting.from)
                      );
                    } else if (oSetting.blank) {
                      memo01.push(
                        new Filter(oSetting.field, oSetting.op, oSetting.from)
                      );
                    }
                  } else if (_.isDate(oSetting.from)) {
                    if (oSetting.from.getMilliseconds()) {
                      memo01.push(
                        new Filter(oSetting.field, oSetting.op, oSetting.from)
                      );
                    } else if (oSetting.blank) {
                      memo01.push(
                        new Filter(oSetting.field, oSetting.op, oSetting.from)
                      );
                    }
                  } else if (_.isBoolean(oSetting.from)) {
                    memo01.push(
                      new Filter(oSetting.field, oSetting.op, oSetting.from)
                    );
                  }
                }
              }
            }

            return memo01;
          },
          []
        );

        return new Filter({
          filters: aFilters,
          and: bAnd,
        });
      },

      /**
       * 정렬 객체를 생성한다 - 단일
       * @param {string} sField 정렬 필드 명
       * @param {Boolean} bDescending false: 오름차순, true: 내림차순
       * @param {Boolean} bGrouping   true: 그룹핑, false: 그룹핑 안함
       * @param {Function} fnComparator true/false를 리턴하는 함수
       * @returns
       */
      makeSorter: function (sField, bDescending, bGrouping, fnComparator) {
        if (!_.isString(sField) || !sField.length) {
          return null;
        }

        bDescending = bDescending ? true : false;
        bGrouping = bGrouping ? true : false;

        return new Sorter(sField, bDescending, bGrouping, fnComparator);
      },

      /**
       * 정렬 객체를 생성한다 - 멀티
       * @param {Array} aSorterInfo
       * [
       *  {
       *    field: 'fieldName',
       *    descending: true/false,
       *    grouping: true/false,
       *    comparator: Function return true/false
       *  }
       * ]
       * @returns
       */
      makeSorters: function (aSorterInfo) {
        var self = this;

        if (!_.isArray(aSorterInfo) || !aSorterInfo.length) {
          return [];
        }

        return _.map(aSorterInfo, function (oSorterInfo) {
          return self.makeSorter(
            oSorterInfo.field,
            oSorterInfo.descending,
            oSorterInfo.grouping,
            oSorterInfo.comparator
          );
        });
      },

      /**
       * 컨트롤에 설정되어 있는 커스텀데이터를 키 값을 가지고 찾아온다
       * @param {Object} event 이벤트 객체
       * @param {string}} key 커스텀데이터 키 값
       * @returns
       */
      getCustomData: function (control, key) {
        let aCustomData = control ? control.getCustomData() : [];

        let oCustomData = _.find(aCustomData, function (oCustomData) {
          return oCustomData.getProperty("key") === key; 
        });
        return oCustomData && oCustomData.getProperty("value");
      },

      /**
       * Back Button을 누르는 경우 이전 페이지로 이동
       * @param {string} sRoute 돌아가고자 하는 manifest.json에 등록된 route 이름
       * @param {Object} oParams 파라미터 값 리스트
       * {
       *  parameterName1: "parameterValue1",
       *  parameterName2: "parameterValue2",
       *  "?queryParameterName": {
       *    queryParameterName1: "queryParameterValue1"
       *  }
       * }
       */
      navBack: function (sRoute, oParams) {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo(sRoute, oParams, true);
        }
      },

      /**
       * 에러메세지 Popup을 생성한다
       * @param {string} msg 메세지
       * @param {string} tit 제목
       * @param {Function} fnClose close 버튼에 대한 callback
       */
      showError: function (msg, tit, fnClose) {
        let title = tit ? tit : "Error";
        let message = msg
          ? msg
          : "Error text is not configured. Please contact administrator";
        let onClose = fnClose ? fnClose : null;

        sap.m.MessageBox.error(message, {
          title: title,
          onClose: onClose,
          styleClass: "",
          actions: sap.m.MessageBox.Action.CLOSE,
          emphasizedAction: null,
          initialFocus: null,
          textDirection: sap.ui.core.TextDirection.Inherit,
        });
      },

      showErrorDetail: function (fnCallback) {
        this.callPopupFragment("ErrorDetail", fnCallback);
      },

      /**
       * Message Toast를 보여준다
       * @param {String} message 메세지
       * @param {String} width MessageToast 너비
       * @param {Integer} duration 표시시간 (ms)
       */
      showMessageToast: function (message, width, duration) {
        message = message ? message : "No message assigned!!";
        width = width ? width : "20em";
        duration = duration ? duration : 1000;

        MessageToast.show(message, {
          duration: duration,
          width: width,
          my: "center bottom",
          at: "center bottom",
          of: window,
          offset: "0 0",
          collision: "fit fit",
          onClose: null,
          autoClose: true,
          animationTimingFunction: "ease",
          animationDuration: 1000,
          closeOnBrowserNavigation: true,
        });
      },

      callPopup: function (i18n, sType, sIcon) {
        if (_.isEmpty(sType)) {
          sType = "success";
        }

        if (_.isEmpty(sIcon)) {
          sIcon = this.constants.messageIcon.NONE;
        }

        let sMessage = this.getI18nText(i18n);

        MessageBox[sType](sMessage, {
          icon: sIcon,
          actions: [this.constants.messageAction.OK],
        });
      },

      callPopupConfirm: function (sI18n, sType, sIcon) {
        var deferred = Q.defer();
        var sMessage = this.getI18nText(sI18n);

        if (_.isEmpty(sType)) {
          sType = "success";
        }

        if (_.isEmpty(sIcon)) {
          sIcon = this.constants.messageIcon.NONE;
        }

        MessageBox[sType](sMessage, {
          icon: sIcon,
          actions: [
            this.constants.messageAction.YES,
            this.constants.messageAction.NO,
          ],
          onClose: function (oAction) {
            if (oAction === this.constants.messageAction.YES) {
              deferred.resolve("OK");
            } else {
              deferred.resolve("NO");
            }
          }.bind(this),
        });

        return deferred.promise;
      },

      /**
       * 메세지모델을 초기화하고 등록한다
       * @param {string} modelName 뷰에서 사용할 모델 이름
       * @param {Function} fnAttachChange 변경 이벤트 발생시에 호출할 callback
       */
      initMessageModel: function (modelName, fnAttachChange) {
        this.messageManager = sap.ui.getCore().getMessageManager();
        this.messageModel = this.messageManager.getMessageModel();
        this.messageModelBinding = this.messageModel.bindList(
          "/",
          undefined,
          []
        );
        if (!_.isEmpty(fnAttachChange)) {
          this.messageModelBinding.attachChange(fnAttachChange, this);
        }
        this.getView().setModel(this.messageModel, modelName);
        this.messageManager.registerObject(this.getView(), true);
      },

      /**
       * 메세지모델에 메세지를 추가한다
       * @param {Object} messageInfo 추가할 메세지 정보
       * {
       *  message : '메세지', ==> {string}
       *  type: '메세지타입', ==> this.modelMessageType 에서 선택
       *  target: '메세지대상데이터 경로', ==> {string}
       *  processor: '메세지대상데이터의 모델' ==> {Object}
       * }
       */
      addError: function (messageInfo) {
        var oMessage = new Message({
          message: messageInfo.message,
          type: messageInfo.type,
          target: messageInfo.target,
          processor: messageInfo.processor,
        });

        this.messageManager.addMessages(oMessage);
      },

      /**
       * 메세지 모델의 모든 메세지를 삭제한다
       */
      removeAllMessage: function () {
        this.messageManager.removeAllMessages();
      },

      /**
       * 메세지 객체 검색
       * @param {string} target 패스에 해당하는 모든 메세지를 가져온다
       * @returns
       */
      getMessageByTarget: function (target) {
        let messages = this.messageModel.getProperty("/");

        return _.filter(messages, function (message) {
          return message.getTarget() === target;
        });
      },

      /**
       * 경로의 메세지 삭제
       * @param {string}} target 패스에 해당하는 모든 메세지를 삭제한다
       */
      removeMessageByTarget: function (target) {
        let messages = this.getMessageByTarget(target);

        if (!_.isEmpty(messages)) {
          this.messageManager.removeMessages(messages);
        }
      },

      /**
       * Popup Fragment를 생성한다
       * @param {string} sFragmentName Fragment 파일 이름
       * @param {Object} oEvent 이벤트 객체
       */
      callPopupFragment: function (sFragmentName, fnCallback) {
        let sFragmentFile = namespace + ".view.popup." + sFragmentName;

        if (!this.fragments[sFragmentName]) {
          Fragment.load({
            name: sFragmentFile,
            controller: this,
            id: this.getView().getId(),
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              this.fragments[sFragmentName] = oDialog;

              if (fnCallback) {
                fnCallback();
              }

              oDialog.open();
            }.bind(this)
          );
        } else {
          if (fnCallback) {
            fnCallback();
          }
          this.fragments[sFragmentName].open();
        }
      },

      /**
       * Popup Fragment를 닫는다
       * @param {string}} sFragmentName Fragment 파일 이름
       */
      closePopupFragment: function (sFragmentName) {
        this.fragments[sFragmentName].close();
      },

      /**
       * FileUploader 컨트롤 기본 설정
       * @param {Object} fileUploader FileUploader 컨트롤
       * @param {*} csrfToken x-csrf-token 헤더 값
       * @param {*} fileName 파일 이름
       */
      setFileUploader: function (fileUploader, csrfToken, fileName) {
        _.forEach(
          fileUploader.getHeaderParameters(),
          function (headerParameter) {
            fileUploader.removeHeaderParameter(headerParameter);
          }
        );

        fileUploader.insertHeaderParameter(
          new FileUploaderParameter({
            name: "x-csrf-token",
            value: csrfToken,
          })
        );

        fileUploader.insertHeaderParameter(
          new FileUploaderParameter({
            name: "slug",
            value: encodeURI(fileName),
          })
        );
      },

      /**
       * Popup Fragment를 닫는다
       * @param {string}} sFragmentName Fragment 파일 이름
       */
      closePopupFragment: function (sFragmentName) {
        this.fragments[sFragmentName].close();
      },

      callPopoverFragment: function (sFragmentName, oSource, fnCallback) {
        let sFragmentFile = namespace + ".view.popup." + sFragmentName;

        if (!this.fragments[sFragmentName]) {
          Fragment.load({
            name: sFragmentFile,
            controller: this,
            id: this.getView().getId(),
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              this.fragments[sFragmentName] = oDialog;

              if (fnCallback) {
                fnCallback();
              }

              oDialog.openBy(oSource);
            }.bind(this)
          );
        } else {
          if (fnCallback) {
            fnCallback();
          }
          this.fragments[sFragmentName].openBy(oSource);
        }
      },

      /**
       * uploadComplete 이벤트의 event 객체에 대해서 에러 메세지를 추출한다
       * @param {Event Object} event
       * @returns 에러가 없는 경우에는 null 있으면 에러 메세지
       */
      extractErrorFileUploader: function (event) {
        if (
          _.startsWith(event.getParameters().status, "2") &&
          event.getParameters().response
        ) {
          return null;
        }

        if (event.getParameters().response) {
          return event.getParameters().response;
        } else {
          return this.getI18nText("msgErr__007");
        }
      },

      /**
       *
       * @param {Object} uploadset Uploadset 컨트롤
       * @param {Object} headers HTTP Header 추가 정보
       * {
       *  slug : 'slug 설정값',
       *  csrfToken : 'x-csrf-token 설정값',
       *  ...
       *  추가 Header 필드값
       * }
       */
      setUploadset: function (uploadset, headers) {
        _.forEach(uploadset.getHeaderFields(), function (headerField) {
          uploadset.removeHeaderField(headerField);
        });

        _.forEach(headers, function (headerValue, headerKey) {
          headerValue = encodeURI(headerValue);

          if (headerKey === "csrfToken") {
            headerKey = "x-csrf-token";
          }

          uploadset.insertHeaderField(
            new Item({
              key: headerKey,
              text: headerValue,
            })
          );
        });
      },

      getContentType: function (contentType) {
        let contentTypeLower = v.lowerCase(contentType);

        if (v.includes(contentTypeLower, "json")) {
          return "json";
        } else if (v.includes(contentTypeLower, "xml")) {
          return "xml";
        } else {
          return "";
        }
      },

      initUploadset: function (uploadsetId) {
        this.getView().byId(uploadsetId).destroyItems();
        this.getView().byId(uploadsetId).destroyIncompleteItems();
      },

      handleErrorCommon: function (error, viewModel) {
        let message = _.get(error, "message", "");
        let responseText = _.get(error, "responseText", "");
        let contentType = _.get(error, "headers.Content-Type", "");

        let contentTypeCode = this.getContentType(contentType);

        if (message && !responseText) {
          this.showError(message);
        } else if (message && responseText) {
          if (contentTypeCode === "xml" || contentTypeCode === "json") {
            viewModel.setErrorData(message, responseText, contentTypeCode);
            this.showErrorDetail();
          } else {
            let convMessage = message + " : " + responseText;
            this.showMessage(convMessage);
          }
        } else {
          this.showError(this.getI18nText("errUnknownError"));
        }
      },

      createUUID: function () {
        function _s4() {
          return (((1 + Math.random()) * 0x10000) | 0)
            .toString(16)
            .substring(1);
        }
        return (
          _s4() +
          _s4() +
          "-" +
          _s4() +
          "-" +
          _s4() +
          "-" +
          _s4() +
          "-" +
          _s4() +
          _s4() +
          _s4()
        );
      },

      /**
       * Value Help를 호출
       * @param {String} valueHelpName Value Fragment File Name
       * @param {Object} dataModel Value Help data model
       * @param {Object} initCondition Value Help filter의 초기 값
       * @param {Array} searchFields target search field with search field
       * @param {Boolean} isLazyLoadingData true 설정 시 ValueHelp Table이 Open 시점 말고, Search 시점에 binding 되도록 설정
       * @param {Array} aFilters dataModel 경로에 설정할 필터 배열
       * @param {Array} aSorters dataModel 경로에 설정할 Sort 배열
       * {
       *  [fieldName] : [초기값]
       * }
       * {
       *  Company : '1000'
       * }
       */
      callValueHelp: function (
        valueHelpName, //ValueHelp 이름
        dataModel, // OData 모델 전달 -> Value Help Dialog에서 표시할 데이터를 가져오는데 사용
        callback, // 사용자가 ValueHelp에서 선택한 값을 처리하기 위한 함수 -> 클릭 같은 이벤트를 할 때 (저장같은)
        initCondition, // 초기 조건을 설정하는 객체
        searchFields, // 검색할 필드를 정의하는 배열
        isLazyLoadingData, // 데이터 지연 로딩 설정 (True로 하면 사용자가 검색하기 전에 데이터 표시 안됨)
        aFilters, // 추가적인 필터 조건 정의
        aSorters  // 데이터 정렬 기준 정의
      ) {
        if (isLazyLoadingData === undefined) {
          isLazyLoadingData = false;
        }

        if (_.isEmpty(aFilters)) {
          aFilters = []; // aFilter가 빈 값이거나 정의되지 않은 경우 빈 배열로 초기화
        }

        if (_.isEmpty(aSorters)) {
          aSorters = []; // aSorters가 빈 값이거나 정의되지 않은 경우 빈 배열로 초기화
        }

        this.valueHelp.setI18n(this.getOwnerComponent().getModel("i18n").getResourceBundle());

        const vh = this.valueHelp.getValueHelp(valueHelpName);
        
        // vh가 true면 Dialog Open
        // 이미 생성된 Dialog를 열어 사용자에게 빠르게 반응해 사용자 편의성 증가
        if (vh) {
          vh.dialog.open();
          return; // 기존의 Dialog가 있으면 초기화 건너뛰기
        }

        // 특정 네임스페이스와 이름에 따라 xmlfragment를 로드하고 valueHelpDialog 변수에 저장
        let valueHelpDialog = sap.ui.xmlfragment(
          namespace + ".view.f4." + valueHelpName,
          this // 현재 Context
        );

        if (!valueHelpDialog) {
          throw Error(this.getI18nText("errorInvalidF4", [valueHelpName]));
        }

        this.getView().addDependent(valueHelpDialog); // addDependent 메서드는 valueHelpDialog를 현재 view의 종속성으로 추가
        this.valueHelp.initScreen( // initScreen으로 Dialog의 설정 구성 (ValueHelp.js)
          valueHelpName,
          valueHelpDialog,
          dataModel,
          callback,
          initCondition,
          searchFields,
          isLazyLoadingData,
          aFilters,
          aSorters
        );
      },

      onValueHelp: function (event) {
        let valueHelpName = "";

        switch (event.sId) {
           // valueHelp에서 검색
          case "search":
            valueHelpName = this.getCustomData(
              event.getSource().getParent().getParent().getParent().getParent(), // ValueHelpDialog
              "valueHelp" // ValueHelpDialog의 valueHelp 
            );

            this.valueHelp.search(event, valueHelpName); 
            break;
          case "ok":
            valueHelpName = this.getCustomData(event.getSource(), "valueHelp");
            this.valueHelp.ok(event, valueHelpName);
            break;
          case "cancel":
            valueHelpName = this.getCustomData(event.getSource(), "valueHelp");
            this.valueHelp.cancel(event, valueHelpName);
            break;
          case "afterClose": // Dialog가 닫힌 발생하는 이벤트
            valueHelpName = this.getCustomData(event.getSource(), "valueHelp");
            this.valueHelp.afterClose(event, valueHelpName);
            break;
          default:
            throw new Error(this.getI18nText("errorInvalidSearchHelpEvent"));
        }
      },

      getPromiseError: function (promiseResults) {
        let errorInfo = null;

        _.forEach(promiseResults, function (result) {
          if (result.state !== "fulfilled" && _.isEmpty(errorInfo)) {
            errorInfo = result.value;
          }
        });

        return errorInfo;
      },

      /**
       * Filterbar의 입력값으로 필터를 생성한다
       * @param {Array} selectionSet
       * @param {Array} operationSet
       * [
       *  {
       *    name: '[FieldName],
       *    op: '[this.constants.operator]'
       *  }
       * ]
       * @returns
       */
      makeFilterBarFilter: function (selectionSet, operationSet) {
        if (_.isEmpty(selectionSet)) {
          return;
        }

        let filters = [];
        _.forEach(
          selectionSet,
          function (selection) {
            const operator = _.find(operationSet, {
              name: selection.getName(),
            });

            switch (selection.getMetadata().getName()) {
              case "sap.m.Input":
                let inputValue = selection.getValue();

                if (!_.isEmpty(inputValue)) {
                  if (_.isEmpty(operator)) {
                    filters.push(
                      this.makeMultiFilter([
                        {
                          field: selection.getName(),
                          op: this.constants.operator.EQ,
                          from: inputValue,
                        },
                      ])
                    );
                  }
                }
                break;
              case "sap.m.ComboBox":
                let comboBoxKey = selection.getSelectedKey();

                if (!_.isEmpty(comboBoxKey)) {
                  filters.push(
                    this.makeMultiFilter([
                      {
                        field: selection.getName(),
                        op: this.constants.operator.EQ,
                        from: comboBoxKey,
                      },
                    ])
                  );
                }
                break;
              case "sap.m.Select":
                let selectKey = selection.getSelectedKey();

                if (!_.isEmpty(selectKey)) {
                  filters.push(
                    this.makeMultiFilter([
                      {
                        field: selection.getName(),
                        op: this.constants.operator.EQ,
                        from: selectKey,
                      },
                    ])
                  );
                }
                break;
              case "sap.m.MultiComboBox":
                let selectKeys = selection.getSelectedKeys();

                if (!_.isEmpty(selectKeys)) {
                  let filterInputs = _.map(
                    selectKeys,
                    function (selectKey) {
                      return {
                        field: selection.getName(),
                        op: this.constants.operator.EQ,
                        from: selectKey,
                      };
                    }.bind(this)
                  );

                  filters.push(this.makeMultiFilter(filterInputs, false));
                }

                break;
              case "sap.m.MultiInput":
                let tokens = selection.getTokens();

                if (!_.isEmpty(tokens)) {
                  let multiInputFilter = _.map(
                    tokens,
                    function (token) {
                      let tokenData = token.data();

                      if (_.get(token.data(), "range", "")) {
                        let operation = "";
                        if (tokenData.range.exclude) {
                          switch (tokenData.range.operation) {
                            case this.constants.operator.EQ:
                              operation = this.constants.operator.NE;
                              break;
                            case "Empty":
                              operation = this.constants.operator.NE;
                              break;
                            default:
                              throw new Error(
                                "Not Registered Operator for exclude"
                              );
                          }
                        } else {
                          if (tokenData.range.operation === "Empty") {
                            operation = this.constants.operator.EQ;
                          } else {
                            operation = tokenData.range.operation;
                          }
                        }

                        return {
                          field: selection.getName(),
                          op: operation,
                          from: tokenData.range.value1,
                          to: tokenData.range.value2,
                        };
                      } else {
                        return {
                          field: selection.getName(),
                          op: this.constants.operator.EQ,
                          from: token.getKey(),
                        };
                      }
                    }.bind(this)
                  );

                  filters.push(this.makeMultiFilter(multiInputFilter, false));
                }

                break;
              case "sap.m.DateRangeSelection":
                if (selection.getFrom() && selection.getTo()) {
                  filters.push(
                    this.makeMultiFilter(
                      [
                        {
                          field: selection.getName(),
                          op: this.constants.operator.BT,
                          from: selection.getFrom(),
                          to: selection.getTo(),
                        },
                      ],
                      false
                    )
                  );
                }
                break;
              default:
                throw new Error("filter control not registered");
            }
          }.bind(this)
        );

        if (!_.isEmpty(filters)) {
          return new Filter({
            filters: filters,
            and: true,
          });
        } else {
          return null;
        }
      },

      resetFilterBar: function (selectionSet) {
        if (_.isEmpty(selectionSet)) {
          return;
        }

        _.forEach(
          selectionSet,
          function (selection) {
            switch (selection.getMetadata().getName()) {
              case "sap.m.Input":
                selection.setValue("");
                break;
              case "sap.m.ComboBox":
                selection.setValue("");
                break;
              case "sap.m.Select":
                selection.setValue("");
                break;
              case "sap.m.MultiComboBox":
                selection.clearSelection();
                break;
              case "sap.m.MultiInput":
                selection.removeAllTokens();
                break;
              case "sap.m.DateRangeSelection":
                selection.setValue(null);
                break;
              default:
                throw new Error("filter control not registered");
            }
          }.bind(this)
        );
      },

      setMultiInput: function (multiInputcontrol, validator, updator) {
        if (validator) {
          multiInputcontrol.addValidator(validator);
        }

        if (updator) {
          multiInputcontrol.attachTokenUpdate(updator);
        }
      },

      filterNewToken: function (newTokens, oldTokens) {
        let filteredToken = [];

        _.forEach(newTokens, function (newToken) {
          if (
            !_.find(oldTokens, function (oldToken) {
              return (
                oldToken.getKey() === newToken.getKey() &&
                oldToken.getText() === newToken.getText()
              );
            })
          ) {
            filteredToken.push(newToken);
          }
        });

        return filteredToken;
      },

      closeErrorDetail: function () {
        this.closePopupFragment("ErrorDetail");
      },
    });
  }
);
