sap.ui.define(
  [
    "readians/zfrkjs0090/controller/common/BaseController",
    "readians/zfrkjs0090/model/Main",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/m/Token",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    ViewModel,
    Spreadsheet,
    exportLibrary,
    Token,
    MessageBox,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend("readians.zfrkjs0090.controller.Main", {
      ControlID: {
        Button: {
          B_MainSearch: "B_MainSearch",
        },
        Table: {
          T_MainTable: "T_MainTable",
          T_DetailTable: "T_DetailTable",
        },
        FilterBar: {
          FB_Main: "FB_Main",
        },
        Plugin: {
          PI_MainSelection: "PI_MainSelection",
        },
      },

      /*******************************************************************
       * Controller Lifecycle Event Handler
       *******************************************************************/
      onInit: function () {
        this.initController();
        this.dh = this.getOwnerComponent().dh;
        this.viewModel = new ViewModel(this.dh.getI18n().getResourceBundle());
        this.setModel(this.viewModel.getModel(), "viewModel");
        this._fcMultiComboBoxItems();
        this.initMessageModel("message");

        this.dh.router
          .getRoute("RouteMain")
          .attachPatternMatched(this._onPatternMatched, this);

        // Screen
        this.getView().addStyleClass(
          this.getOwnerComponent().getContentDensityClass()
        );
      },

      /*******************************************************************
       * Event Handler
       *******************************************************************/
      onPAI: function (event) {
        let sCode = this.getCustomData(event.getSource(), "fcCode");

        try {
          switch (sCode) {
            // Table / p13n control
            case "fcTableControl":
              this._fcTableControl(event);
              break;
            case "fcNavigate":
              this._fcNavigate(event);
              break;

            // Filter Bar / Value Help control
            case "fcFilterControlCM":
              this._fcFilterControlCM(event);
              break;
            case "fcGender":
              this._fcGender(event);
              break;
            case "f4UserName":
              this._f4UserName(event);
              break;

            // Export Spread Sheet
            case "fcExcelExport":
              this._fcExcelExport(event);
              break;

            //Button Control
            case "fcOpenFriend":
              this._fcOpenFriend(event);
              break;
            case "fcCreate":
              this._fcCreate(event);
              break;
            case "fcDelete":
              this._fcDelete(event);
              break;
            case "fcRefresh":
              this._fcRefresh(event);
              break;
          }
        } catch (error) {
          this._handleError(error);
        }
      },

      /*******************************************************************
       * Filter Bar / Value Help
       *******************************************************************/
      _f4UserName: function (event) {
        let sEventId = event.getId(); // Event ID Get
        switch (sEventId) {
          case "tokenUpdate":
            // Token Update 처리
            const removeTokens = event.getParameter("removedTokens");
            const vUserName = this.viewModel.getFilterUserName();
            this.viewModel.setTabShowOverlay(true);

            if (!_.isEmpty(removeTokens)) {
              _.remove(vUserName, function (item) {
                const iIndex = _.findIndex(removeTokens, function (token) {
                  return item.UserName === token.getKey();
                });
                return iIndex >= 0 ? true : false;
              });

              this.viewModel.setFilterUserName(vUserName);
            }
            break;

          case "valueHelpRequest":
            // Call Search Help
            const callback = (tokens) => {
              const token = _.map(tokens, (item) => {
                return {
                  UserName: item.getKey(),
                };
              });

              this.viewModel.setFilterUserName(token);
              let oTable = this.getView().byId(
                this.ControlID.Table.T_MainTable
              );
              this.viewModel.setTabShowOverlay(true);
            };

            // Call Search Help
            //ValueHelp 호출 -> BaseController에 정의된 callValueHelp 호출
            this.callValueHelp(
              "UserName", // ValueHelp 이름
              this.dh.odata.getModel(""),
              callback, // callBack 함수 호출
              {}, // 초기 조건
              ["UserName"], // 검색 필드
              false, //데이터 지연 로딩 여부 (false로 하면 사용자가 검색하기 전에 데이터 표시)
              [], // 추가 필터 조건 -> ComponyCode 필터
              [] // 정렬 조건
            );

            const f4UserName = _.find(_.get(this.valueHelp, "valueHelpList"), {
              name: "UserName",
            }).dialog; // UserName에 대한 Value Help Dialog 가져오기

            //사용자가 이전  에 선택한 UserName Token load
            const oldTokens = _.map(
              this.viewModel.getFilterUserName(), //현재 필터에 설정된 UserName를 로드
              (item) => {
                //lodash 라이브러리의 map 함수를 사용해 tokens 배열의 각 요소를 item으로 받아들여 변환
                return new Token({
                  key: item.UserName,
                  text: item.UserName,
                });
              }
            );

            if (!_.isEmpty(oldTokens)) {
              //oldTokens에 값이 있으면
              f4UserName.setTokens(oldTokens); //Value Help에 oldToken 표시
            }
            break;
        }
      },

      _fcGender: function (event) {
        const oMultiComboBox = event.getSource();
        const aSelectedKeys = oMultiComboBox.getSelectedKeys();

        this.viewModel.setFilterGender(aSelectedKeys);
        this.viewModel.setTabShowOverlay(true);
        this.viewModel.setValueState("Gender", "None");
      },

      /*******************************************************************
       * Filter Bar Control
       *******************************************************************/
      _fcFilterControlCM: function (event) {
        const oTable = this.getView().byId(this.ControlID.Table.T_MainTable);
        let sEventId = event.getId();
        switch (sEventId) {
          case "filterChange":
            break;
          case "search":
            this.viewModel.setBusy(true);
            const [vValid, vMsg] = this._filterValidCheckCM();
            if (vValid) {
              if (this.viewModel.getMainTableEdited()) {
                this.callPopupConfirm("InfoMsg04", "warning").then(
                  function (result) {
                    if (result === "OK") {
                      this.viewModel.setMainTableEdited(false);
                      this._updateScreenDataCM();
                    }
                  }.bind(this)
                );
              } else {
                this._updateScreenDataCM();
              }
            } else {
              this.viewModel.setBusy(false);
              this.showError(vMsg);
            }
            break;
        }
      },

      // Refresh Main Table Data
      _updateScreenDataCM: function (bActionRefresh) {
        const vToastMsg = "InfoMsg01";
        const oFilter = this._fcConfigFilter();

        this.dh.odata
          ._ReadMainTableView(oFilter)
          .then((aResult) => {
            const aMainTab = _.map(aResult, function (oItem) {
              return oItem.getObject();
            });
            const aNewResult = this._fcProcMainTableItems(aMainTab);

            this.viewModel.setIsSearched(true);
            this.viewModel.setMainTableItems(aNewResult);

            this.getView()
              .byId(this.ControlID.Table.T_MainTable)
              .getBinding("rows")
              .refresh();

            if (!bActionRefresh) {
              if (aNewResult.length === 0) {
                this.showError(this.getI18nText("ErrMsg010"));
              } else {
                this.showMessageToast(
                  this.getI18nText(vToastMsg, String(aNewResult.length))
                );
              }
            }
          })
          .catch((error) => {
            this._handleError(error);
          })
          .finally(() => {
            this._fcPostProupdateScreenData(bActionRefresh);
          });
      },

      _fcConfigFilter: function () {
        const aFilterUserName = this.viewModel.getFilterUserName();

        let aTableFilters = [];

        if (aFilterUserName && aFilterUserName.length > 0) {
          aTableFilters.push(
            this.makeMultiFilter(
              _.map(aFilterUserName, (item) => {
                return {
                  field: "UserName",
                  op: "EQ",
                  from: item.UserName,
                };
              })
            )
          );
        }

        return new Filter({ filters: aTableFilters, and: true });
      },

      _fcProcMainTableItems: function (aMainTab) {
        //Gender Filter
        const aFilterGender = this.viewModel.getFilterGender() || [];

        return _.map(
          aMainTab.filter((oData) =>
            aFilterGender.length > 0
              ? aFilterGender.includes(oData.Gender)
              : true
          ),
          (obj) => {
            const aFieldsToCheck = [
              "Gender",
              "UserName",
              "FirstName",
              "LastName",
              "Emails",
              "AddressInfo",
            ];

            const bFieldEmpty = aFieldsToCheck.some(
              (field) => !obj[field] || obj[field].length === 0
            );

            const vState = bFieldEmpty ? "E" : "C";

            return {
              ...obj,
              ...{
                State: vState,
              },
            };
          }
        );

        // const aResult = aMainTab.filter((oData) =>
        //   aFilterGender.length > 0 ? aFilterGender.includes(oData.Gender) : true
        // );

        // return aResult;
      },

      _fcPostProupdateScreenData: function (bActionRefresh) {
        this.viewModel.setBusy(false);
        this.viewModel.setTabShowOverlay(false);
      },

      /*******************************************************************
       * Filter Validation
       *******************************************************************/
      _filterValidCheckCM: function () {
        let vValid = true;
        let vMsg = "";
        [vValid, vMsg] = this._fcRequiredCheckCM(vValid, vMsg);
        [vValid, vMsg] = this._fcValueStateCheckCM(vValid, vMsg);
        return [vValid, vMsg];
      },

      // 필수 체크
      _fcRequiredCheckCM: function (vValid, vMsg) {
        if (vValid) {
          const oFilterBar = this.getView().byId(
              this.ControlID.FilterBar.FB_Main
            ),
            aRequiredFields = oFilterBar.determineMandatoryFilterItems(),
            oFilters = this.viewModel.getFilters();

          const aErrFields = _.reduce(
            aRequiredFields,
            (result, oFilterGI) => {
              let vField = oFilterGI.getName();
              let oFilter = oFilters[vField];
              if (!oFilter || oFilter.length == 0) result.push(vField);
              return result;
            },
            []
          );
          vValid = !aErrFields.length > 0;
          _.forEach(
            aErrFields,
            function (vField) {
              this.viewModel.setValueState(vField, "Error");
            }.bind(this)
          );
          if (!vValid) {
            vMsg = this.getI18nText("ErrMsg002", [
              _.join(
                _.map(
                  aErrFields,
                  function (vField) {
                    return this.getI18nText(vField);
                  }.bind(this)
                ),
                ", "
              ),
            ]);
          }
        }
        return [vValid, vMsg];
      },

      _fcValueStateCheckCM: function (vValid, vMsg) {
        if (vValid) {
          vValid = !_.includes(this.viewModel.getFilterValueStates(), "Error");
          if (!vValid) vMsg = this.getI18nText("ErrMsg001");
        }
        return [vValid, vMsg];
      },

      /*******************************************************************
       * Detail Table
       *******************************************************************/
      _updateScreenDataDetail: function (KeyMaster) {
        const vToastMsg = "InfoMsg01";

        this.dh.odata
          ._ReadDetailTableView(KeyMaster)
          .then((oResult) => {
            const aDetailTab = oResult.Friends;
            this.dh.odata
              ._GetDetailBestFriend(KeyMaster)
              .then((oBestFriend) => {
                const aNewResult = _.sortBy(
                  this._fcProcDetailTableItems(aDetailTab, oBestFriend),
                  "FriendShip"
                );

                this.viewModel.setDetailTableItems(aNewResult);

                this._fcSetDetailTableBindingRows();

                this.getView()
                  .byId(this.ControlID.Table.T_DetailTable)
                  .getBinding("rows")
                  .refresh();

                if (aNewResult.length === 0) {
                  this.showError(this.getI18nText("ErrMsg010"));
                } else {
                  this.showMessageToast(
                    this.getI18nText(vToastMsg, String(aNewResult.length))
                  );
                }
              })
              .catch((error) => {
                this._handleError(error);
              });
          })
          .catch((error) => {
            this._handleError(error);
          })
          .finally(() => {
            this._fcPostProupdateScreenData();
          });
      },

      _fcProcDetailTableItems: function (aDetailTab, oBestFriend) {
        return _.map(aDetailTab, (obj) => {
          const vBestFriend =
            oBestFriend.BestFriend.UserName === obj.UserName
              ? "BestFriend"
              : "Friend";

          return {
            ...obj,
            ...{
              Friendship: vBestFriend,
            },
          };
        });
      },

      _fcSetDetailTableBindingRows: function () {
        const oTable = this.getView().byId(this.ControlID.Table.T_DetailTable);
        const oBinding = oTable.getBinding("rows");

        const aContexts = oBinding.getContexts(0, oBinding.getLength());

        const vPath = aContexts
          .filter(
            (oContext) => oContext.getProperty("Friendship") === "BestFriend"
          )
          .map((oContext) => {
            const path = oContext.getPath();
            return path;
          });

        this.viewModel.setDetailTableChngFlagbyPath(vPath, true);
      },

      /*******************************************************************
       * Button Control
       *******************************************************************/
      _fcOpenFriend: function (event) {
        const aSelectedData = this._fcGetSelectedMainTableDataCM();
        if (!aSelectedData || aSelectedData.length === 0) {
          this.showError(this.getI18nText("ErrMsg007"));
          return;
        } else {
          this._updateScreenDataDetail(aSelectedData.UserName);
        }
      },

      _fcCreate: function (event) {
        if (this.viewModel.getIsSearched()) {
          this.viewModel.addInitLine();
          this.viewModel.setMainTableEdited(true);
        } else {
          this.showError(this.getI18nText("ErrMsg003"));
        }
      },

      _fcDelete: function (event) {
        const aSelectedRows = this._fcGetSelectedMainTableDataCM();

        if (aSelectedRows && _.includes(["N"], aSelectedRows.State)) {
          const bLocal = aSelectedRows.State == "N",
            vMsg = bLocal ? "InfoMsg05" : "InfoMsg06";
          this.callPopupConfirm(vMsg, "warning").then(
            function (result) {
              if (result === "OK") {
                if (bLocal) {
                  this.viewModel.delMainTableLinebyPath(
                    this._fcGetSelectedMainTablePathCM()
                  );
                } else {
                  this._fcCallDelete(aSelectedRows);
                }
              }
            }.bind(this)
          );
        } else if (aSelectedRows) {
          this.showError(this.getI18nText("ErrMsg008"));
        } else {
          this.showError(this.getI18nText("ErrMsg007"));
        }
      },

      _fcRefresh: function (event) {
        if (this.viewModel.getIsSearched()) {
          this.callPopupConfirm("InfoMsg04", "warning").then(
            function (result) {
              if (result === "OK") {
                this._updateScreenDataCM();
              }
            }.bind(this)
          );
        } else {
          this.showError(this.getI18nText("ErrMsg003"));
        }
      },

      /*******************************************************************
       * Table Control & Table P13N
       *******************************************************************/
      _fcTableControl: function (event) {
        let sEventId = event.getId();

        switch (sEventId) {
          case "columnMove":
            let oCol = event.getParameter("column");
            let newPos = event.getParameter("newPos");
            this.viewModel.changeOrderColCond(this._getKey(oCol), newPos);
            break;
        }
      },

      /**
       * Filter Bar Event Handler Method
       * 삭제 X / 수정 O
       * Multi Select / Single Select 에 따라
       */
      _fcGetSelectedMainTableDataCM: function (event) {
        const oSelectionPlugin = this.getView().byId(
            this.ControlID.Plugin.PI_MainSelection
          ),
          vSelectedIndex = oSelectionPlugin.getSelectedIndex(),
          oTable = oSelectionPlugin.getTable();

        return vSelectedIndex < 0
          ? undefined
          : oTable.getContextByIndex(vSelectedIndex).getObject();
      },

      _fcGetSelectedMainTablePathCM: function (event) {
        const oSelectionPlugin = this.getView().byId(
            this.ControlID.Plugin.PI_MainSelection
          ),
          vSelectedIndex = oSelectionPlugin.getSelectedIndex(),
          oTable = oSelectionPlugin.getTable();

        return vSelectedIndex < 0
          ? undefined
          : oTable.getContextByIndex(vSelectedIndex).getPath();
      },

      _fcGetSelectedMainTableIdxCM: function (event) {
        const oSelectionPlugin = this.getView().byId(
          this.ControlID.Plugin.PI_MainSelection
        );
        return oSelectionPlugin.getSelectedIndex();
      },

      _fcNavigate: function (event) {
        const selectedData = event
            .getParameter("row")
            .getBindingContext("viewModel")
            .getObject(),
          UserName = _.get(selectedData, "UserName");

        this.dh.router.navTo("RouteDetail", {
          UserName: UserName,
        });
      },

      /**********************************************************************************
       * Edit Line
       **********************************************************************************/
      _fcCheckLineEdited: function (sPath) {
        this.viewModel.checkMainTableLineEdited(sPath);
        const bAnyLineEdited = this._fcIsAnyLineEdited();
        this.viewModel.setEnabledSaveBtn(bAnyLineEdited);
      },

      _fcIsAnyLineEdited: function () {
        const aTableRowData = this.getView()
          .getModel("viewModel")
          .getProperty("/MainTable/Items");

        return aTableRowData.some((row) => row.chngFlag === true);
      },

      /*******************************************************************
       * Download Spread Sheet
       *******************************************************************/
      // Excel Export
      _fcExcelExport: function (event) {
        const aMainTab = this.viewModel.getMainTableItems(),
          oTable = this.byId(this.ControlID.Table.T_MainTable),
          oRowBinding = oTable.getBinding("rows");
        if (aMainTab.length == 0) {
          this.showError(this.getI18nText("ErrMsg010"));
          return;
        }

        const aNewDataSource = aMainTab.map((obj) => {
          const address = obj.AddressInfo[0] || {};
          return {
            ...obj,
            ...{
              Emails_1: obj.Emails[0] || "",
              Emails_2: obj.Emails[1] || "",
              Address: address.Address || "",
              CityCountryRegion:
                (address.City && address.City.CountryRegion) || "",
              CityName: (address.City && address.City.Name) || "",
              Region: (address.City && address.City.Region) || "",
            },
          };
        });

        const aCols = this._createColumnConfigCM();
        const sToday = dayjs().format("YYYY.MM.DD HH.mm.ss");
        const sFileName = this.getI18nText("appTitle") + "_" + sToday + ".xlsx";
        const oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: aNewDataSource,
          fileName: sFileName,
          worker: false,
          showProgress: true,
        };

        const oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },

      _fcConfigUnitCurrFields: function () {
        const oCurrencyFields = {},
          oUnitFields = {},
          aSkipFields = [],
          bShowUnit = false;
        return [oCurrencyFields, oUnitFields, aSkipFields, bShowUnit];
      },

      _createColumnConfigCM: function () {
        const oMainTable = this.getView().byId(
            this.ControlID.Table.T_MainTable
          ),
          aColumns = oMainTable.getColumns(),
          [oCurrencyFields, oUnitFields, aSkipFields, bShowUnit] =
            this._fcConfigUnitCurrFields();
        const EdmType = exportLibrary.EdmType;

        const aCols = _.map(aColumns, (oCol) => {
          let etc;
          const property = this._getLocalId(oCol),
            label = oCol.getLabel().getText(),
            width = Number(_.replace(oCol.getWidth(), /(rem|px)/g, "")) / 8,
            textAlign = oCol.getHAlign(),
            oColSetting = {
              property: property,
              label: label,
              width: width,
              textAlign: textAlign,
            };

          if (_.has(oCurrencyFields, property)) {
            etc = {
              type: EdmType.Currency,
              displayUnit: bShowUnit,
              unitProperty: oCurrencyFields[property],
            };
          } else if (_.has(oUnitFields, property)) {
            etc = {
              type: EdmType.Number,
              displayUnit: bShowUnit,
              unitProperty: oUnitFields[property],
            };
          } else {
            etc = {
              type: EdmType.String,
            };
          }

          if (oCol.getVisible() && !_.includes(aSkipFields, property)) {
            return { ...etc, ...oColSetting };
          }
        });

        return _.filter(aCols, (obj) => obj != undefined);
      },

      /*******************************************************************
       * Call Action
       *******************************************************************/
      _fcMultiComboBoxItems: function () {
        this.dh.odata
          ._ReadMainTableView()
          .then((aResult) => {
            const aMainTab = _.map(aResult, function (oItem) {
              return oItem.getObject();
            });
            const aNewResult = aMainTab.reduce((aUniGenders, oData) => {
              if (
                oData.Gender &&
                !aUniGenders.some((item) => item.Gender === oData.Gender)
              ) {
                aUniGenders.push({ Gender: oData.Gender });
              }
              return aUniGenders;
            }, []);

            this.viewModel.setMainTableMultiComboBoxItems(aNewResult);
          })
          .catch((error) => {
            this._handleError(error);
          });
      },

      /*******************************************************************
       * Common
       *******************************************************************/
      fcAlphaIn: function (vStr, vLen) {
        return `${"0".repeat(vLen - vStr.length)}${vStr}`;
      },

      /*******************************************************************
       * Error Handler
       *******************************************************************/
      /**
       * Handle error object
       * @param {Object} error error object
       * @param {string} errorCode Optional code for futher logic
       */
      _handleError: function (error, errorCode) {
        switch (errorCode) {
          case "":
            break;
          default:
            this.showError(error.message);
        }
      },

      _getLocalId: function (oControl) {
        return this.getView().getLocalId(oControl.getId());
      },
    });
  }
);
