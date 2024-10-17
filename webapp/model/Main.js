sap.ui.define(
  [
    "readians/zfrkjs0090/model/common/ViewModelBase",
    "sap/ui/model/odata/v4/ODataModel",
  ],
  function (ViweModelBase, oDataModel) {
    "use strict";

    // Common
    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".model.Main";

    // Data - Add view data
    const customData = {
      MainTable: {
        length: 0,
        Items: [],
        showOverlay: false,
        Edited: false,
        IsSearched: false,
        MultiComboBoxItems: [],
      },

      DetailTable: {
        length: 0,
        Items: [],
      },

      Search: {
        UserName: [],
        Gender: [],
        City: [],
        Country: [],
        Address: [],
        Region: [],
      },

      ValueState: {
        Gender: "None",
        City: "",
      },

      Enabled: {
        SaveBtn: false,
      },

      MsgPopover: {
        DtlMsg: [],
        DtlSta: [],
        ResMsg: [],
        Length: 0,
      },

      Const: {
        Icon: {
          A: "sap-icon://message-information",
          E: "sap-icon://status-error",
          C: "sap-icon://status-completed",
          F: "sap-icon://status-in-process",
          W: "sap-icon://warning",
          N: "sap-icon://high-priority",
        },

        Crit: {
          A: "Default",
          E: "Negative",
          C: "Positive",
          F: "Negative",
          W: "Critical",
          N: "Neutral",
        },

        Editable: {
          N: {
            Gender: true,
            UserName: false,
            FirstName: true,
            MiddleName: true,
            LastName: true,
            Emails: true,
            Address: true,
            Country: true,
            City: true,
            Region : false,
          },
          E: {
            Gender: false,
            UserName: false,
            FirstName: false,
            MiddleName: true,
            LastName: false,
            Emails: true,
            Address: true,
            Country: true,
            City: true,
            Region : false,
          },
          C: {
            Gender: false,
            UserName: false,
            FirstName: false,
            MiddleName: false,
            LastName: false,
            Emails: false,
            Address: false,
            Country: false,
            City: false,
            Region : false,
          },
        },
      },

      ColSettings: {
        ColInfo: [],
        InitColSetting: {
          UserName: {
            order: 0,
            width: "6rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "UserName",
            i18nLabel: "main_list_UserName",
            key: "UserName",
            Path: "UserName",
          },
          FirstName: {
            order: 1,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "FirstName",
            i18nLabel: "main_list_FirstName",
            key: "FirstName",
            Path: "FirstName",
          },
          LastName: {
            order: 2,
            width: "4rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "LastName",
            i18nLabel: "main_list_LastName",
            key: "LastName",
            Path: "LastName",
          },
          MiddleName: {
            order: 3,
            width: "4rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "MiddleName",
            i18nLabel: "main_list_MiddleName",
            key: "MiddleName",
            Path: "MiddleName",
          },
          Gender: {
            order: 4,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "Gender",
            i18nLabel: "main_list_Gender",
            key: "Gender",
            Path: "Gender",
          },
          Age: {
            order: 5,
            width: "6rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "Age",
            i18nLabel: "main_list_Age",
            key: "Age",
            Path: "Age",
          },
          Emails: {
            order: 6,
            width: "6rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "Emails",
            i18nLabel: "main_list_Emails",
            key: "Emails",
            Path: "Emails",
          },
          FavoriteFeature: {
            order: 7,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "FavoriteFeature",
            i18nLabel: "main_list_FavoriteFeature",
            key: "FavoriteFeature",
            Path: "FavoriteFeature",
          },
          Address: {
            order: 7,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "Address",
            i18nLabel: "main_list_Address",
            key: "Address",
            Path: "Address",
          },
          CityName: {
            order: 7,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "CityName",
            i18nLabel: "main_list_CityName",
            key: "CityName",
            Path: "CityName",
          },
          CityCountryRegion: {
            order: 7,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "CityCountryRegion",
            i18nLabel: "main_list_CityCountryRegion",
            key: "CityCountryRegion",
            Path: "CityCountryRegion",
          },
          HomeAddress: {
            order: 7,
            width: "15rem",
            visible: true,
            grouped: false,
            sorted: false,
            name: "HomeAddress",
            i18nLabel: "main_list_HomeAddress",
            key: "HomeAddress",
            Path: "HomeAddress",
          },
        },

        ColSettings: {},
        ColCond: [],
        InitColCond: [],
        ChangedOrderList: [],
      },
    };

    const model = ViweModelBase.extend(moduleName, {
      /**
       * @override
       * @param {int} i18n
       * @returns {sap.ui.base.Object}
       */
      constructor: function (i18n) {
        var vReturn = ViweModelBase.prototype.constructor.apply(
          this,
          arguments
        );

        this.initialization(customData);
        this.setColInfo();

        // this.loadODataData();

        return vReturn;
      },

      /********************************************************************
       * Table Control & Table P13N
       ********************************************************************/
      // 초기 세팅
      setColInfo: function () {
        let oColInit = _.cloneDeep(this.getInitiColSettings());
        let aColCondition = [];
        let oInitialWidth = {};
        let idx = 0;
        _.forEach(oColInit, (oConf, key) => {
          let oConfig = _.cloneDeep(oConf);
          oConfig.label = this.i18n.getText(oConfig.i18nLabel);

          aColCondition.push(oConfig);
          oInitialWidth[key] = oConfig.width;
        });
        this.model.setProperty("/ColSettings/ColInfo", oColInit);
        this.model.setProperty("/ColSettings/InitialWidth", oInitialWidth);
        this.model.setProperty("/ColSettings/ColCond", aColCondition);
        this.model.setProperty("/ColSettings/InitColCond", aColCondition);
      },

      getInitiColSettings: function () {
        return this.model.getProperty("/ColSettings/InitColSetting");
      },

      setColCond: function (aColCond) {
        this.model.setProperty("/ColSettings/ColCond", aColCond);
      },

      getColCond: function () {
        return this.model.getProperty("/ColSettings/ColCond");
      },

      getInitColCondition: function () {
        return this.model.getProperty("/ColSettings/InitColCond");
      },

      changeOrderColCond: function (column, idx) {
        let aColCond = this.getColCond();
        let oMovedCond = _.remove(aColCond, function (oCond) {
          return oCond.key === column;
        })[0];
        this.setColCond(
          _.concat(
            _.slice(aColCond, 0, idx),
            [oMovedCond],
            _.slice(aColCond, idx)
          )
        );
      },

      setColVisible: function (oSelectionPanel) {
        _.forEach(oSelectionPanel, (obj) => {
          let key = obj.key;
          let visible = obj.visible;
          this.model.setProperty(
            `/ColSettings/ColInfo/${key}/visible`,
            visible
          );
        });
      },

      /*******************************************************************
       * MainTable
       *******************************************************************/
      setMainTableMultiComboBoxItems: function (aItems) {
        this.model.setProperty("/MainTable/MultiComboBoxItems", aItems);
      },

      setMainTableItems: function (aItem) {
        this.model.setProperty("/MainTable/Items", aItem);
        this.setMainTableItemsLength(aItem);
      },

      getMainTableItems: function () {
        return this.model.getProperty("/MainTable/Items");
      },

      setMainTableItemsLength: function (aItem) {
        if (_.isEmpty(aItem)) {
          this.model.setProperty("/MainTable/length", 0);
        } else {
          this.model.setProperty("/MainTable/length", aItem.length);
        }
      },

      setMainTableEdited(bool) {
        this.model.setProperty("/MainTable/Edited", bool);
      },

      getMainTableEdited() {
        return this.model.getProperty("/MainTable/Edited");
      },

      setTabShowOverlay: function (boolean) {
        this.model.setProperty("/MainTable/showOverlay", boolean);
      },

      getIsSearched() {
        return this.model.getProperty("/MainTable/IsSearched");
      },

      setIsSearched(bBool) {
        this.model.setProperty("/MainTable/IsSearched", bBool);
      },

      addInitLine() {
        const aMainTab = _.cloneDeep(this.getMainTableItems());
        const aNewTab = _.concat(
          [
            {
              State: "N",
              Gender: this.getFilterGender(),
              Address: this.getFilterAddress(),
              CountryRegion: this.getFilterCountry(),
              Name: this.getFilterCity(),
              Region: this.getFilterRegion(),
              CompTrgt: {
                State: "N",
                Gender: this.getFilterGender(),
                Address: this.getFilterAddress(),
                CountryRegion: this.getFilterCountry(),
                Name: this.getFilterCity(),
                Region: this.getFilterRegion(),
              },
            },
          ],
          aMainTab
        );
        this.setMainTableItems(aNewTab);
        this.setMainTableItemsLength(aNewTab);
      },

      delMainTableLinebyPath(vPath) {
        const aMainTab = this.getMainTableItems(),
          vIdx = Number(_.last(_.split(vPath, "/"))),
          aNewTab = _.concat(
            _.slice(aMainTab, 0, vIdx),
            _.slice(aMainTab, vIdx + 1)
          );

        this.setMainTableItems(aNewTab);
        this.setMainTableItemsLength(aNewTab);
      },

      /*******************************************************************
       * DetailTable
       *******************************************************************/
      setDetailTableItems: function (aItem) {
        this.model.setProperty("/DetailTable/Items", aItem);
        this.setDetailTableItemsLength(aItem);
      },

      getDetailTableItems: function () {
        return this.model.getProperty("/DetailTable/Items");
      },

      setDetailTableItemsLength: function (aItem) {
        if (_.isEmpty(aItem)) {
          this.model.setProperty("/DetailTable/length", 0);
        } else {
          this.model.setProperty("/DetailTable/length", aItem.length);
        }
      },

      setDetailTableChngFlagbyPath(vPath, bool) {
        this.model.setProperty(`${vPath}/chngFlag`, bool);
      },

      /******************************************************************
       * FilterBar
       ******************************************************************/
      getFilters() {
        return this.model.getProperty("/Search");
      },

      getFilterUserName() {
        return this.model.getProperty("/Search/UserName");
      },

      setFilterUserName(aToken) {
        this.model.setProperty("/Search/UserName", aToken);
      },

      getFilterGender() {
        return this.model.getProperty("/Search/Gender");
      },

      setFilterGender(selUsers) {
        this.model.setProperty("/Search/Gender", selUsers);
      },

      getFilterCity() {
        return this.model.getProperty("/Search/City");
      },

      setFilterCity(selUsers) {
        this.model.setProperty("/Search/City", selUsers);
      },

      getFilterCountry() {
        return this.model.getProperty("/Search/Country");
      },

      setFilterCountry(selUsers) {
        this.model.setProperty("/Search/Country", selUsers);
      },

      getFilterAddress() {
        return this.model.getProperty("/Search/Address");
      },

      setFilterAddress(selUsers) {
        this.model.setProperty("/Search/Address", selUsers);
      },

      getFilterRegion() {
        return this.model.getProperty("/Search/Region");
      },

      setFilterRegion(selUsers) {
        this.model.setProperty("/Search/Region", selUsers);
      },
      /******************************************************************
       * Value State
       ******************************************************************/
      setValueState(vField, vState) {
        this.model.setProperty(`/ValueState/${vField}`, vState);
      },

      getFilterValueStates() {
        return this.model.getProperty("/ValueState");
      },

      /*******************************************************************
       * Enabled
       *******************************************************************/
      setEnabledSaveBtn(bool) {
        this.model.setProperty("/Enabled/SaveBtn", bool);
      },
      setEnabledAggregateBtn(bool) {
        this.model.setProperty("/Enabled/AggregateBtn", bool);
      },
    });

    // return the module value, in this example a class
    return model;
  }
);
