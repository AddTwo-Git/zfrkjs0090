sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
  "use strict";

  return {
    // Add Formatter
    formatOverallStatus: function (overallStatus) {
      switch (overallStatus) {
        case "R":
          return 0;
        case "X":
          return 0;
        case "J":
          return 0;
        case "S":
          return 10;
        case "F":
          return 30;
        case "P":
          return 50;
        case "A":
          return 70;
        case "D":
          return 80;
        case "I":
          return 90;
        case "C":
          return 100;
      }
    },

    formatEmails: function (email1, email2) {
      if (email1 && email2) {
        return `${email1}, ${email2}`;
      }
      return email1 || "";
    },

    formatDate: function (sDate) {
      if (!sDate || sDate === null) {
        return "";
      } else {
        let oDate = new Date(sDate);
        const oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "yyyy-MM-dd",
        });

        let formattedDate = oDateFormat.format(oDate);

        return formattedDate;
      }
    },
  };
});
