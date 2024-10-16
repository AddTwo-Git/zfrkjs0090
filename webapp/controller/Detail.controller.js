sap.ui.define(
  [
    "readians/zfrkjs0090/controller/common/BaseController",
    "readians/zfrkjs0090/model/Detail",
    "sap/ui/model/Filter",
  ],
  function (BaseController, ViewModel, Filter) {
    "use strict";

    return BaseController.extend("readians.zfrkjs0090.controller.Detail", {
      constructor: function () {
        var vReturn = BaseController.prototype.constructor.apply(
          this,
          arguments
        );

        return vReturn;
      },

      // [Customizing] View의 컨트롤을 설정하여 로직에서 사용하는 경우에 아래에 상수로 정의해서 사용한다
      ControlID: {
        Table: {
          T_TripTable: "T_TripTable",
        },
        List: {
          S_TripList: "S_TripList",
          S_TagList: "S_TagList",
        },
        Popover: {
          PO_Tag: "PO_Tag",
          PO_List: "PO_List",
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
        this.initMessageModel("message");

        // Set Event
        this.dh.router
          .getRoute("RouteDetail")
          .attachPatternMatched(this._onPatternMatched, this);

        // Screen
        this.getView().addStyleClass(
          this.getOwnerComponent().getContentDensityClass()
        );

        /* Custom Logic */
      },

      /*******************************************************************
       * Event Handler
       *******************************************************************/
      _onPatternMatched: function (event) {
        const Keymaster = _.get(event.getParameters(), "arguments.UserName");

        const oTable = this.getView().byId(this.ControlID.Table.T_TripTable);
        if (oTable) {
          oTable.clearSelection();
        }

        if (_.isEmpty(Keymaster)) {
          this.showError(this.getI18nText("ErrMsg005"), undefined, () => {
            this.navBack();
          });
        } else {
          this._updateScreenData(Keymaster);
          this._updateScreenDataDetail(Keymaster);
        }
      },

      onPAI: function (event) {
        let sCode = this.getCustomData(event.getSource(), "fcCode");

        try {
          switch (sCode) {
            // Botton Control
            case "fcOpenTag":
              this._fcOpenTag(event);
              break;
            case "fcOpenTripUser":
              this._fcOpenTripUser(event);
              break; 
              
            // Navigation
            case "fcNavBack":
              this._fcNavBack(event);
              break;
            case "fcNavDetail":
              this._fcNavDetail(event);
              break;
          }
        } catch (error) {
          this._handleError(error);
        }
      },

      /*******************************************************************
       * Table Update
       *******************************************************************/
      _updateScreenData: function (Keymaster) {
        this.dh.odata
          ._ReadPeopleTripDetailDataView(Keymaster)
          .then((aResult) => {
            this.viewModel.setDetailData(aResult);

            this.getView().getModel("viewModel").refresh(true);
          })
          .catch((error) => {
            this._handleError(error);
          })
          .finally(() => {
            this.viewModel.setBusy(false);
          });
      },

      _updateScreenDataDetail: function (Keymaster) {
        const vToastMsg = "InfoMsg01";

        this.dh.odata
          ._ReadPeopleTripDetailTableView(Keymaster)
          .then((aResult) => {
            const aNewResult = this._fcDetailTableItems(aResult.Trips);

            this.viewModel.setDetailTableItems(aNewResult);

            this.getView()
              .byId(this.ControlID.Table.T_TripTable)
              .getBinding("rows")
              .refresh();

            if (aNewResult.length === 0) {
              this.showError(this.getI18nText("ErrMsg005"), undefined, () => {
                this.navBack("RouteMain", "");
              });
            } else {
              this.showMessageToast(
                this.getI18nText(vToastMsg, String(aNewResult.length))
              );
            }
          })
          .catch((error) => {
            this._handleError(error);
          })
          .finally(() => {
            this.viewModel.setBusy(false);
          });
      },

      _fcDetailTableItems: function (aDerailTab) {
        return _.map(aDerailTab, (obj) => {
          return {
            ...obj,
            ...{
              Currency: "KRW",
            },
          };
        });
      },

      /*******************************************************************
       * Button Control
       *******************************************************************/
      _fcOpenTripUser: function (event) {
        let oButton = event.getSource();

        const oSelectedContext = event
            .getSource()
            .getBindingContext("viewModel"),
          oSelectedObj = _.cloneDeep(oSelectedContext.getObject());

        const vUserName = this.viewModel.getDetailData().UserName;
        const vTripId = oSelectedObj.TripId;

        if (!vTripId.toString() || vTripId.length === 0) {
          this.showError(this.getI18nText("ErrMsg010"));
          return;
        }

        this.dh.odata
          ._ReadPeopleTripUserListView(vUserName, vTripId)
          .then((oResult) => {
            const aTripUserList = oResult.value.map((item) => ({
              UserName: `${item.FirstName} ${item.LastName}`,
              Gender: item.Gender,
            }));

            this.viewModel.setTripUserListItems(aTripUserList);

            this.callPopoverFragment(
              "ListPopover",
              oButton,
              this._fcNavBack.bind(
                this,
                "navCon",
                "master",
                this.ControlID.Popover.PO_List
              )
            );
          })
          .catch((error) => {
            this._handleError(error);
          });
      },

      _fcOpenTag: function (event) {
        const sTag = event.getSource().getText();

        this.dh.odata._ReadPeopleTripListTableView().then((aResult) => {
          let aTripTab = _.map(aResult, function (oItem) {
            return oItem.getObject();
          });

          let aTrips = [];
          _.forEach(aTripTab, function (oResult) {
            _.forEach(oResult.Trips, function (oTrip) {
              aTrips.push(oTrip);
            });
          });

          aTrips = _.uniqBy(aTrips, "ShareId");

          const aNewResult = this.viewModel.setTripsByTagTableView(
            aTrips,
            sTag
          );

          const aTripTagList = aNewResult.map((item) => ({
            Name: item.Name,
            Description: item.Description,
            ShareId: item.ShareId,
          }));

          this.viewModel.setTripTagListItems(aTripTagList);

          let oButton = event.getSource();
          this.callPopoverFragment(
            "TagPopover",
            oButton,
            this._fcNavBack.bind(
              this,
              "navCon02",
              "master02",
              this.ControlID.Popover.PO_Tag
            )
          );
        });
      },

      /*******************************************************************
       * Navigation
       *******************************************************************/
      _fcNavBack: function (vNavConId, vMasterPageId, vPopoverId) {
        if (!vNavConId || (!vMasterPageId && !vPopoverId)) {
          vNavConId = "navCon02";
          vMasterPageId = "master02";
          vPopoverId = this.ControlID.Popover.PO_Tag;
        }

        const oNavCon = this.byId(vNavConId),
          oMasterPage = this.byId(vMasterPageId);

        oNavCon.to(oMasterPage);
        this._fcFocusOn(vPopoverId);
      },

      _fcNavDetail: function (event) {
        const oContext = event.getSource().getBindingContext("viewModel"),
          oNavCon = this.byId("navCon02"),
          oDetailPage = this.byId("detail");
        oNavCon.to(oDetailPage);

        this.dh.odata
          ._ReadPeopleTripListTableView()
          .then((aResult) => {
            let aTripTab = _.map(aResult, function (oItem) {
              return oItem.getObject();
            });

            const vShareId = oContext.getObject().ShareId;

            let aTrips = [];
            _.forEach(aTripTab, function (oResult) {
              _.forEach(oResult.Trips, function (oTrip) {
                if (oTrip.ShareId === vShareId) {
                  aTrips.push(oTrip);
                }
              });
            });

            aTrips = _.uniqBy(aTrips, "ShareId");

            const aNewResult = this._fcProcTripsTimes(aTrips);

            this.viewModel.setTripTagListDetailItems(aNewResult);
          })
          .catch((error) => {
            this._handleError(error);
          });
      },

      _fcProcTripsTimes: function (aTrips) {
        return _.map(aTrips, (obj) => {
          return {
            ...obj,
            ...{
              Currency: "KRW",
            },
          };
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

      _fcFocusOn: function (vId) {
        this.getView().byId(vId).focus();
      },
    });
  }
);
