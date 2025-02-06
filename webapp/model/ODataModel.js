sap.ui.define(
  ["readians/zfrkjs0090/model/common/ODataModelBase"],
  function (ODataModelBase) {
    "use strict";

    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".ODataModel";
    const cPrefix = "/Trippin";

    const odataModel = ODataModelBase.extend(moduleName, {
      /**
       * @override
       * @param {int} i18n
       * @returns {readians.zfrkjs0090.model.common.ODataModelBase}
       */
      constructor: function (i18n) {
        var vReturn = ODataModelBase.prototype.constructor.apply(
          this,
          arguments
        );

        return vReturn;
      },

      _ReadMainTableView: function (oFilter) {
        const oModel = this.getModel("");
        const oListBinding = oModel.bindList("/People", null, null, oFilter, {
          $count: true,
        });

        return oListBinding.requestContexts(0, 500);
      },

      _ReadDetailTableView: function (vKey) {
        const oModel = this.getModel("");

        const oContext = oModel.bindContext(
          `/People('${vKey}')?$expand=Friends`
        );

        return oContext.requestObject(0, 500);
      },

      _GetDetailBestFriend: function (vKey) {
        const oModel = this.getModel("");
        const oContext = oModel.bindContext(
          `/People('${vKey}')?$expand=BestFriend`
        );
        return oContext.requestObject(0, 500);
      },

      _ReadPeopleTripDetailDataView: function (vKey) {
        const oModel = this.getModel("");
        let oContext = oModel.bindContext(`/People('${vKey}')`);

        return oContext.requestObject(0, 500);
      },

      _ReadPeopleTripDetailTableView: function (vKey) {
        const oModel = this.getModel("");

        const oContext = oModel.bindContext(`/People('${vKey}')?$expand=Trips`);

        return oContext.requestObject(0, 500);
      },

      _ReadPeopleTripUserListView: function (vUserName, vTripId) {
        const oModel = this.getModel("");

        const oContext = oModel.bindContext(
          `/People('${vUserName}')/Trips(${vTripId})/GetInvolvedPeople`
        );

        return oContext.requestObject(0, 500);
      },

      _ReadPeopleTripListTableView: function (oFilter) {
        const oModel = this.getModel("");

        const oListBinding = oModel.bindList(`/People`, null, null, oFilter, {
          $count: true,
          $expand: "Friends,Trips",
        });

        return oListBinding.requestContexts(0, 500);
      },

      _ReadPeopleTripPlanItemList: function (oParameter) {
        const oModel = this.getModel("");

        const sPersonInstancePath = `/People('${oParameter.PeopleInstance}')`,
          sTripIdPath = `/Trips(${oParameter.TripId})`,
          sPath = sPersonInstancePath + sTripIdPath + `/PlanItems`;

        const oContext = oModel.bindContext(sPath);

        return oContext.requestObject(0, 500);
      },

      CallShareTrip: function (oParameter) {
        const oModel = this.getModel("");

        const sPersonInstancePath = `/People('${oParameter.PeopleInstance}')`,
          sActionPath = sPersonInstancePath + `${cPrefix}.ShareTrip(...)`;

        let oActionContext = oModel.bindContext(sActionPath);

        oActionContext.setParameter("userName", oParameter.UserName);
        oActionContext.setParameter("tripId", oParameter.TripId);
        return oActionContext;
      },
    });

    return odataModel;
  }
);
