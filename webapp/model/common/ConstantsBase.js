sap.ui.define(
  ["sap/ui/base/Object", "sap/m/MessageBox"],
  function (ObjectBase, MessageBox) {
    "use strict";

    const operator = Object.freeze({
      ALL: sap.ui.model.FilterOperator.All,
      ANY: sap.ui.model.FilterOperator.Any,
      BT: sap.ui.model.FilterOperator.BT,
      CONTAINS: sap.ui.model.FilterOperator.Contains,
      NOTCONTAINS: sap.ui.model.FilterOperator.NotContains,
      ENDSWITH: sap.ui.model.FilterOperator.EndsWith,
      NOTENDSWITH: sap.ui.model.FilterOperator.NotEndsWith,
      EQ: sap.ui.model.FilterOperator.EQ,
      GE: sap.ui.model.FilterOperator.GE,
      GT: sap.ui.model.FilterOperator.GT,
      LE: sap.ui.model.FilterOperator.LE,
      LT: sap.ui.model.FilterOperator.LT,
      NB: sap.ui.model.FilterOperator.NB,
      NE: sap.ui.model.FilterOperator.NE,
      STARTSWITH: sap.ui.model.FilterOperator.StartsWith,
      NOTSTARTSWITH: sap.ui.model.FilterOperator.NotStartsWith,
    });

    const messageAction = Object.freeze({
      ABORT: MessageBox.Action.ABORT,
      CANCEL: MessageBox.Action.CANCEL,
      CLOSE: MessageBox.Action.CLOSE,
      DELETE: MessageBox.Action.DELETE,
      IGNORE: MessageBox.Action.IGNORE,
      NO: MessageBox.Action.NO,
      OK: MessageBox.Action.OK,
      RETRY: MessageBox.Action.RETRY,
      YES: MessageBox.Action.YES,
    });

    const messageType = Object.freeze({
      ALERT: "alert",
      CONFIRM: "confirm",
      ERROR: "error",
      INFORMATION: "information",
      SHOW: "show",
      SUCCESS: "success",
      WARNING: "warning",
    });

    const messageIcon = Object.freeze({
      ERROR: sap.m.MessageBox.Icon.ERROR,
      INFORMATION: sap.m.MessageBox.Icon.INFORMATION,
      NONE: sap.m.MessageBox.Icon.NONE,
      QUESTION: sap.m.MessageBox.Icon.QUESTION,
      SUCCESS: sap.m.MessageBox.Icon.SUCCESS,
      WARNING: sap.m.MessageBox.Icon.WARNING,
    });

    const modelMessageType = Object.freeze({
      Error: sap.ui.core.MessageType.Error,
      Information: sap.ui.core.MessageType.Information,
      None: sap.ui.core.MessageType.None,
      Success: sap.ui.core.MessageType.Success,
      Warning: sap.ui.core.MessageType.Warning,
    });

    return ObjectBase.extend("readians.zfrkjs0090.model.common.Constants", {
      operator: operator,
      messageAction: messageAction,
      messageType: messageType,
      messageIcon: messageIcon,
      modelMessageType: modelMessageType,

      constructor: function (i18n) {
        var vReturn = ObjectBase.prototype.constructor.apply(this, arguments);

        this.i18n = i18n;

        return vReturn;
      },

      setI18n: function (i18n) {
        this.i18n = i18n;
      },
    });
  }
);
