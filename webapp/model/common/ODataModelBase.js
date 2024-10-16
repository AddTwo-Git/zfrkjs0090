sap.ui.define(
  [
    "sap/ui/base/Object",
    "readians/zfrkjs0090/model/Validator",
    "readians/zfrkjs0090/model/Constants",
  ],
  function (Object, Validator, Constants) {
    "use strict";

    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".ODataModelBase";

    const odataModelBase = Object.extend(moduleName, {
      constructor: function (i18n) {
        var vReturn = Object.prototype.constructor.apply(this, arguments);

        this.odata = {};
        this.i18n = i18n.getResourceBundle();
        this.constants = new Constants(this.i18n);
        this.constants.setI18n(this.i18n);
        this.constants.setConstant();
        this.validator = new Validator(i18n);

        return vReturn;
      },

      /**
       * 모델명으로 등록되어 있는 OData 모델을 검색해서 리턴한다
       * 없는 경우에는 에러를 리턴한다
       * @param {string} modelName OData Model Name
       */
      getModel: function (modelName) {
        if (!_.get(this.odata, modelName)) {
          throw Error(this.i18n.getText("errNotRegisteredModel", [modelName]));
        }

        return _.get(this.odata, modelName);
      },

      /**
       * OData 서비스를 등록한다
       * @param {string} modelName 등록할 모델 명
       * @param {Object} model 등록할 OData 모델 객체
       */
      setModel: function (modelName, model) {
        if (_.get(this.odata, modelName)) {
          throw Error(
            this.i18n.getText("errAlreadyRegisteredModel", [modelName])
          );
        } else {
          this.odata = {};
        }

        this.odata[modelName] = model;
      },

      /**
       * Read 또는 파라미터가 있는 OData 호출에 사용
       * @param {sap.ui.model.odata.v2.ODataMode} oModel OData Model Object
       * @param {string} sEntity Entityset Name or Entity Type Name
       * @param {Object} oKeys Key List
       * @param {Boolean} bSet if true add /Set string to url
       * @returns Promise 객체 - 호출 하는 곳에서 처리 후 로직 추가 필요
       */
      read: function (oModel, sEntity, oKeys, bSet) {
        let sUrl = sEntity;

        if (!oModel || _.isEmpty(sUrl)) {
          return null;
        }

        if (oKeys) {
          sUrl = oModel.createKey(sEntity, oKeys);
        }

        if (bSet) {
          sUrl = sUrl + "/Set";
        }

        let deferred = Q.defer();

        sUrl = "/" + sUrl;
        oModel.read(sUrl, {
          success: function (oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function (oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
        });

        return deferred.promise;
      },

      /**
       * Query 호출시 사용
       * @param {Object} oModel OData 서비스 모델 오브젝트
       * @param {String} sEntity EntitySet 명
       * @param {Array} aFilters Filter 오브젝트 배열
       * @param {Array} aSorters Sorter 오브젝트 배열
       * @param {Object} oParams 추가 파라미터 오브젝트
       * {
       *  '$top': 1
       * }
       * @returns
       */
      query: function (oModel, sEntity, aFilters, aSorters, oParams) {
        let sUrl = sEntity;

        if (!oModel || _.isEmpty(sUrl)) {
          return null;
        }

        aFilters = _.isArray(aFilters) ? aFilters : [];
        aSorters = _.isArray(aSorters) ? aSorters : [];
        oParams = _.isObject(oParams) ? oParams : {};

        let deferred = Q.defer();

        sUrl = "/" + sUrl;
        oModel.read(sUrl, {
          success: function (oData, oResponse) {
            if (_.isObject(oData)) {
              oData.sUrl = sUrl;
              oData.oResponse = oResponse;
              deferred.resolve(oData);
            } else {
              deferred.resolve(oData);
            }
          },
          error: function (oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
          filters: aFilters,
          sorters: aSorters,
          urlParameters: oParams,
        });

        return deferred.promise;
      },

      /**
       * 단일항목 생성 또는 Deep Insert 처리시에 사용한다
       * @param {Object} oModel OData 서비스 모델 오브젝트
       * @param {String} sEntity EntitySet 명
       * @param {Object} oData 생성 데이터
       * @returns Promise 객체 - 호출 하는 곳에서 처리 후 로직 추가 필요
       */
      create: function (oModel, sEntity, oData) {
        let sUrl = sEntity;

        if (!oModel || _.isEmpty(sUrl)) return null;

        oData = _.isObject(oData) ? oData : {};

        let deferred = Q.defer();

        sUrl = "/" + sUrl;
        oModel.create(sUrl, oData, {
          success: function (oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function (oError) {
            oData.sUrl = sUrl;
            deferred.reject(oError);
          },
        });

        return deferred.promise;
      },

      /**
       * 단일항목을 업데이트한다. 해당 항목의 Read 호출이 활성화 되어 있어야 한다
       * @param {Object} oModel OData 서비스 모델 오브젝트
       * @param {String} sEntity EntitySet 명
       * @param {Object} oKeys 키값 오브젝트
       * @param {Object} oData 업데이트할 오브젝트 정보
       * @returns Promise 객체 - 호출 하는 곳에서 처리 후 로직 추가 필요
       */
      update: function (oModel, sEntity, oKeys, oData) {
        let sUrl = sEntity;
        if (!oModel || _.isEmpty(sUrl)) return null;

        oData = _.isObject(oData) ? oData : {};

        if (oKeys) {
          sUrl = oModel.createKey(sEntity, oKeys);
        }

        var deferred = Q.defer();

        sUrl = "/" + sUrl;
        oModel.update(sUrl, oData, {
          success: function (oData, oResponse) {
            if (!oData) {
              oData = {};
            }
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function (oError) {
            oData.sUrl = sUrl;
            deferred.reject(oError);
          },
        });

        return deferred.promise;
      },

      /**
       * 단일 항목을 삭제한다
       * @param {Object} oModel OData 서비스 모델 오브젝트
       * @param {string} sEntity EntitySet 명
       * @param {Object} oKeys 삭제할 키값 오브젝트
       * @returns Promise 객체 - 호출 하는 곳에서 처리 후 로직 추가 필요
       */
      delete: function (oModel, sEntity, oKeys) {
        let sUrl = sEntity;
        if (!oModel || _.isEmpty(sUrl)) return null;

        if (oKeys) {
          sUrl = oModel.createKey(sEntity, oKeys);
        }

        var deferred = Q.defer();

        sUrl = "/" + sUrl;
        oModel.remove(sUrl, {
          success: function (oData, oResponse) {
            if (!oData) {
              oData = {};
            }
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function (oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
        });

        return deferred.promise;
      },

      executeAction: function (oModel, sEntity, oParams, bPost) {
        let sUrl = sEntity;

        if (!oModel || _.isEmpty(sUrl)) return null;

        oParams = _.isObject(oParams) ? oParams : {};

        var sMethod = bPost ? "POST" : "GET";

        var deferred = Q.defer();

        sUrl = "/" + sUrl;
        oModel.callFunction(sUrl, {
          method: sMethod,
          success: function (oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function (oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
          urlParameters: oParams,
        });

        return deferred.promise;
      },

      getXCsrfToken: function (modelName) {
        this.getModel("").refreshSecurityToken();

        return this.getModel("").oHeaders["x-csrf-token"];
      },

      getValidator: function () {
        return validator;
      },
    });

    return odataModelBase;
  }
);
