/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"readian/zrds_temp01/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
