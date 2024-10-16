sap.ui.define(
  [
    "sap/ui/base/Object",
    "readians/zfrkjs0090/model/ODataModel",
    "readians/zfrkjs0090/model/DeviceModel",
    "readians/zfrkjs0090/utils/Utils",
  ],
  function (Object, ODataModel, DeviceModel, Utils) {
    "use strict";

    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".DataHub";
    const dh = Object.extend(moduleName, {
      /**
       * Declear Global Variables
       */

      /**
       *
       * @param {String} nameSpace
       */
      setNamespace: function (nameSpace) {
        this.namespace = nameSpace;
        this.namespaceDir = _.replace(this.namespace, ".", "/");
      },

      /**
       * @returns {String} Namespace
       */
      getNamespace: function () {
        return this.namespace;
      },

      getNamespaceDir: function () {
        return this.namespaceDir;
      },

      createDeviceModel: function () {
        if (this.device) {
          return;
        }

        this.device = DeviceModel.createDeviceModel();
      },

      getDevice: function () {
        return this.device;
      },

      setI18n: function (i18n) {
        this.i18n = i18n;
      },

      getI18n: function () {
        return this.i18n;
      },

      setRouter: function (router) {
        this.router = router;
      },

      getRouter: function (router) {
        return this.router;
      },

      setManifest: function (manifest) {
        this.manifest = manifest;
      },

      getManifest: function () {
        return this.manifest;
      },

      createODataModel: function () {
        if (this.odataModel) {
          return;
        }

        this.odata = new ODataModel(this.i18n);
      },

      getOdataModel: function () {
        return this.odata;
      },

      createUtils: function () {
        if (this.utils) {
          return;
        }

        this.utils = new Utils();
      },

      getUtils: function () {
        return this.utils;
      },
    });

    return dh;
  }
);
