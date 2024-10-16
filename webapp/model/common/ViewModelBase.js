sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "readians/zfrkjs0090/model/Validator",
    "readians/zfrkjs0090/model/Constants",
  ],
  function (Object, JSONModel, Validator, Constants) {
    "use strict";

    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".model.common.ViewModelBase";

    const defaultData = {
      busy: false,
      errorDataType: "",
      errorTitle: "",
      errorData: "",
    };

    const viewModelBase = Object.extend(moduleName, {
      defaultData: defaultData,

      /**
       * @override
       * @returns {sap.ui.base.Object}
       */
      constructor: function (i18n) {
        var vReturn = Object.prototype.constructor.apply(this, arguments);

        this.model = this.makeJSONModel();
        this.i18n = i18n;
        this.validator = new Validator(i18n);
        this.constants = new Constants(this.i18n);

        return vReturn;
      },

      // Public method
      initialization: function (customData) {
        this.setData(_.cloneDeep(_.merge(this.defaultData, customData)));
      },

      makeJSONModel: function () {
        return new JSONModel();
      },

      getModel: function () {
        return this.model;
      },

      setData: function (baseData) {
        this.model.setData(baseData);
      },

      setBusy: function (busy) {
        this.getModel().setProperty("/busy", busy);
      },

      getValidator: function () {
        return this.validator;
      },

      getConstants: function () {
        return this.constants;
      },

      /**
       * path에 해당하는 경로의 리스트를 삭제한다
       * @param {Array} indexList 삭제할 리스트의 인덱스
       * @param {string} path 삭제할 리스트의 경로
       *  /[리스트 경로]
       * @returns
       */
      deleteList: function (indexList, path) {
        if (_.isEmpty(indexList)) {
          return;
        }

        let newList = [];
        let oldlist = this.model.getProperty(path);

        const deletePath = _.map(indexList, function (path) {
          return _.toInteger(_.last(_.split(path, "/")));
        });

        _.forEach(oldlist, function (list, index) {
          if (_.indexOf(deletePath, index) < 0) {
            newList.push(list);
          }
        });

        this.model.setProperty(path, newList);
      },

      updateList: function (updatePath, updateData) {
        let oldData = this.model.getProperty(updatePath);

        _.forEach(updateData, function (value, key) {
          oldData[key] = value;
        });

        this.model.setProperty(updatePath, oldData);
      },

      updateValue: function (updatePath, updateValue) {
        this.model.setProperty(updatePath, updateValue);
      },

      setErrorData: function (title, description, errorType) {
        if (errorType === "json") {
          let jsonObj = JSON.parse(description);
          description = JSON.stringify(jsonObj, null, 4);
        }

        this.model.setProperty("/errorTitle", title);
        this.model.setProperty("/errorData", description);
        this.model.setProperty("/errorDataType", errorType);
      },
    });

    return viewModelBase;
  }
);
