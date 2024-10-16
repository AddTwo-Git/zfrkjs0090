sap.ui.define(
  ["readians/zfrkjs0090/model/common/ViewModelBase"],
  function (ViweModelBase) {
    "use strict";

    // Common
    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".model.Detail";

    // Data - Add view data
    const customData = {
      DetailData: {},
      DetailTable: {
        length: 0,
        Items: [],
      },

      TripUserList: {
        length: 0,
        Items: [],
      },

      TagList: {
        length: 0,
        Items: [],
        DetailItems: [],
      },
    };

    const model = ViweModelBase.extend(moduleName, {
      /**
       * @override
       * @param {int} i18n
       * @returns {sap.ui.base.Object}
       */
      constructor: function (i18n) {
        var vReturn = ViweModelBase.prototype.constructor.apply(
          this,
          arguments
        );

        this.initialization(customData);

        return vReturn;
      },

      /*******************************************************************
       * Detail Table
       *******************************************************************/
      setDetailData(oDetailData) {
        this.model.setProperty("/DetailData", oDetailData);
      },

      getDetailData(oDetailData) {
        return this.model.getProperty("/DetailData");
      },

      setDetailTableItems: function (aDetailTab) {
        //합계
        const oSubTotal = _.reduce(
          aDetailTab,
          (result, obj) => {
            result.Budget = (
              parseFloat(result.Budget) + parseFloat(obj.Budget)
            ).toFixed(2);
            return result;
          },
          {
            Budget: "0.00",
            Currency: aDetailTab[0].Currency,
            TripId: "합계",
            State: "Information",
          }
        );
        this.model.setProperty(
          "/DetailTable/Items",
          _.concat(aDetailTab, [oSubTotal])
        );
        // this.model.setProperty("/DetailTable/Items", aDetailTab);
        this.setDetailTableItemsLength(aDetailTab);
      },

      getDetailTableItems: function () {
        return this.model.getProperty("/DetailTable/Items");
      },

      setDetailTableItemsLength: function (aDetailTab) {
        if (_.isEmpty(aDetailTab)) {
          this.model.setProperty("/DetailTable/length", 0);
        } else {
          this.model.setProperty("/DetailTable/length", aDetailTab.length);
        }
      },

      /*******************************************************************
       * Trip User Popover
       *******************************************************************/
      setTripUserListItems: function (aTripUserTab) {
        this.model.setProperty("/TripUserList/Items", aTripUserTab);
        this.setTripUserListItemsLength(aTripUserTab);
      },

      getTripUserListItems: function () {
        return this.model.getProperty("/TripUserList/Items");
      },

      setTripUserListItemsLength: function (aTripUserTab) {
        if (_.isEmpty(aTripUserTab)) {
          this.model.setProperty("/TripUserList/length", 0);
        } else {
          this.model.setProperty("/TripUserList/length", aTripUserTab.length);
        }
      },

      /*******************************************************************
       * Trip Tag Popover
       *******************************************************************/
      setTripsByTagTableView: function (aTrips, sTag) {
        let aResult = [];
        _.forEach(aTrips, (oTrip) => {
          if (_.includes(oTrip.Tags, sTag)) aResult.push(oTrip);
        });
        _.sortBy(aResult, "TripId");

        return aResult;
      },

      setTripTagListItems: function (aTab) {
        this.model.setProperty("/TagList/Items", aTab);
        this.setTripTagListItemsLength(aTab);
      },

      setTripTagListItemsLength: function (aTab) {
        if (_.isEmpty(aTab)) {
          this.model.setProperty("/TripUserList/length", 0);
        } else {
          this.model.setProperty("/TripUserList/length", aTab.length);
        }
      },

      setTripTagListDetailItems: function (aTab) {
        this.model.setProperty("/TagList/DetailItems", aTab);
      },
    });

    // return the module value, in this example a class
    return model;
  }
);
