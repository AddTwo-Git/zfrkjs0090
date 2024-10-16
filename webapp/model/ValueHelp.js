sap.ui.define(
  [
    "readians/zfrkjs0090/model/common/ValueHelpBase",
    "sap/ui/model/type/String",
  ],
  function (ValueHelpBase, TypeString) {
    "use strict";

    // Common
    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".model.ValueHelp";

    // Data
    const model = ValueHelpBase.extend(moduleName, {
      /**
       * @override
       * @returns {readians.zfrkjs0090.model.common.ValueHelpBase}
       */
      constructor: function (i18n) {
        var vReturn = ValueHelpBase.prototype.constructor.apply(
          this,
          arguments
        );

        return vReturn;
      },

      // Public customizing method
      initScreen: function (
        // ValueHelp Dialog 초기화 및 필요 데이터 전달
        valueHelpName,
        valueHelpDialog,
        dataModel,
        callback,
        initCondition,
        searchFields,
        isLazyLoadingData,
        aFilters,
        aSorters
      ) {
        if (
          // isEmpty 함수로 주어진 값이 비어있는지 확인
          _.isEmpty(valueHelpName) ||
          _.isEmpty(valueHelpDialog) ||
          _.isEmpty(dataModel)
        ) {
          // 값이 셋중 하나라도 비어있으면 오류 처리
          throw Error(this.i18n.getText("errorInvalidInputForValuehelp"));
        }

        let columnAction = {};
        let rangeFields = [];
        let dataPath = "";
        let dataModelName = "";

        columnAction = this._getColumnAction(valueHelpName);
        rangeFields = this._getRangeFields(valueHelpName);
        dataPath = this._getDataPath(valueHelpName);
        dataModelName = this._getDataModelName(valueHelpName);

        this.initCommon(
          valueHelpName,
          valueHelpDialog,
          dataModel,
          dataPath,
          callback,
          columnAction,
          rangeFields,
          initCondition,
          searchFields,
          dataModelName,
          isLazyLoadingData,
          aFilters,
          aSorters
        );
      },

      _getColumnAction: function (valueHelpName) {
        switch (valueHelpName) {
          case "City":
            return {
              cols: [
                {
                  label: this.i18n.getText("City"),
                  template: "AddressInfo/0/City/Name",
                  width: "80px",
                },
                {
                  label: this.i18n.getText("CountryRegion"),
                  template: "AddressInfo/0/City/CountryRegion",
                },
              ],
            };

          case "UserName":
            return {
              cols: [
                {
                  label: this.i18n.getText("UserName"),
                  template: "UserName",
                  width: "200px",
                },
                {
                  label: this.i18n.getText("FirstName"),
                  template: "FirstName",
                  width: "150px",
                },
                {
                  label: this.i18n.getText("LastName"),
                  template: "LastName",
                  width: "150px",
                },
              ],
            };

          default:
            throw Error(
              this.i18n.getText("errorNotRegisteredValueHelp", [valueHelpName])
            );
        }
      },

      _getRangeFields: function (valueHelpName) {
        switch (valueHelpName) {
          case "City":
            return [];
          case "UserName":
            return [];
          default:
            throw Error(
              this.i18n.getText("errorNotRegisteredValueHelp", [valueHelpName])
            );
        }
      },

      _getDataPath: function (valueHelpName) {
        switch (valueHelpName) {
          case "City":
            return "/People";
          case "UserName":
            return "/People";
          default:
            throw Error(
              this.i18n.getText("errorNotRegisteredValueHelp", [valueHelpName])
            );
        }
      },

      _getDataModelName: function (valueHelpName) {
        switch (valueHelpName) {
          case "":
            break;
          default:
            return "";
        }
      },

      // Private Method
    });

    // return the module value, in this example a class
    return model;
  }
);
