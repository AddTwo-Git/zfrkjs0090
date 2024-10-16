sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
  "use strict";

  /**
   * Convert Date object to OData datetime string format
   * @param {Date} date Date Object
   * @returns {String} YYYY-MM-DDT:00:00:00
   */
  function convertDateForOData(date) {
    return escape(moment(date).format("YYYY-MM-DD") + "T00:00:00");
  }

  /**
   * Make Range for OData edm.datetime string format
   * @param {Date} fdate from date object
   * @param {Date} tdate to date object
   * @returns {Object} string converted to odate datetime format
   */
  function convertDateRangeForOData(fdate, tdate) {
    return {
      fdate: escape(dayjs(fdate).format("YYYY-MM-DD") + "T00:00:00"),
      tdate: escape(dayjs(tdate).format("YYYY-MM-DD") + "T23:59:59"),
    };
  }

  const nameSpace = "readians.zfrkjs0090";
  const moduleName = nameSpace + ".model.Utils";

  return ManagedObject.extend("readians.zfrkjs0090.model.Utils", {
    convertDateForOData: convertDateForOData,
    convertDateRangeForOData: convertDateRangeForOData,
  });
});
