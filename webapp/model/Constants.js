sap.ui.define(
  ["readians/zfrkjs0090/model/common/ConstantsBase"],
  function (ConstantsBase) {
    "use strict";

    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".model.Constants";

    const constant = ConstantsBase.extend(moduleName, {
      constructor: function (i18n) {
        var vReturn = ConstantsBase.prototype.constructor.apply(
          this,
          arguments
        );

        this.setConstant();

        return vReturn;
      },

      setConstant: function () {
        // Constants declaration
      },
    });

    return constant;
  }
);
