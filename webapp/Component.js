/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "readians/zfrkjs0090/model/models",
    "readians/zfrkjs0090/DataHub"
],
    function (UIComponent, Device, models, DataHub) {
        "use strict";

        const nameSpace = "readians.zfrkjs0090";
        const componentName = nameSpace + ".Component";

        return UIComponent.extend(componentName, {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                /// set DataHub
                this.dh = new DataHub();
                this.dh.setNamespace(nameSpace);
                this.dh.setI18n(this.getModel("i18n"));
                this.dh.setRouter(this.getRouter());
                this.dh.setManifest(this.getManifest());
                this.dh.createDeviceModel();
                this.dh.createODataModel();
                this.dh.createUtils();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // [TO-DO] set odata model [Regisger all odata service]
                this.dh.odata.setModel("", this.getModel());
            },

            /**
             * Destroy resource used in this app
             */
            destroy: function () {
                this.dh.destroy();
                UIComponent.prototype.destroy.apply(this, arguments);
            },

            /**
             * Get Desity css class name used in this class
             * @returns {string} Return density class name
             */
            getContentDensityClass: function () {
                if (this._sContentDensityClass === undefined) {
                    if (
                        jQuery(document.body).hasClass("sapUiSizeCozy") ||
                        jQuery(document.body).hasClass("sapUiSizeCompact")
                    ) {
                        this._sContentDensityClass = "";
                    } else if (!this.dh.device.getProperty("/").support.touch) {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }

                return this._sContentDensityClass;
            },
        });
    }
);