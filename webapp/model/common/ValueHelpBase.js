sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "readians/zfrkjs0090/model/Validator",
    "readians/zfrkjs0090/model/Constants",
    "sap/m/SearchField",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Object,
    JSONModel,
    Validator,
    Constants,
    SearchField,
    ColumnListItem,
    Label,
    Filter,
    FilterOperator
  ) {
    "use strict";

    const nameSpace = "readians.zfrkjs0090";
    const moduleName = nameSpace + ".model.common.ValueHelpBase";

    const valuehelpContent = {
      name: "",
      dialog: null,
      ok: undefined,
    };

    const rangeFieldExample = [
      {
        label: "Action",
        key: "Action",
        type: "string",
        typeInstance: "sap/ui/model/type 의 Type Instance",
      },
    ];

    const valueHelpList = [];
    let commonDataPath = "";
    let commonDataSearchFilters = [];
    let commonDataSorters = [];

    const model = Object.extend(moduleName, {
      constructor: function (i18n) {
        this.valueHelpList = _.cloneDeep(valueHelpList);
        this.validator = new Validator(i18n);
        this.constants = new Constants(i18n);
      },

      // Public method
      /**
       * ValueHelp 초기화 공통 메서드
       * @param {String} valueHelpName Value Help Name (Value Help File Name)
       * @param {Object} valueHelpDialog ValueHelpDialog Object
       * @param {Object} dataModel ValueHelp에 쓰이는 데이터 모델
       * @param {String} dataPath 데이터모델에서 사용할 Path
       * @param {Function} callback ValueHelpDialog에서 OK 버튼을 눌렀을 경우 수행되는 CALLBACK
       * @param {Array} columnData ValueHelpDialog에서 컬럼 리스트
       * @param {Arrary} rangeKeyFields Range에 쓰일 키 필드
       * @param {Object} initCondition ValueHelp를 띄울때 최초 검색 설정값
       * @param {Array} searchFields Search Field를 사용하는 경우 검색 대상 필드
       */
      initCommon: function (
        valueHelpName,
        valueHelpDialog,
        dataModel,
        dataPath,
        callback,
        columnData,
        rangeKeyFields,
        initCondition,
        searchFields,
        dataModelName,
        isLazyLoadingData,
        aFilters,
        aSorters
      ) {
        commonDataSearchFilters = aFilters;
        commonDataSorters = aSorters;
        commonDataPath = dataPath;

        let columnModel = new JSONModel(_.cloneDeep(columnData));

        let searchField = new SearchField({
          showSearchButton: false,
          search: function (event) {
            event.getSource().getParent().getParent().fireEvent("search");
          },
        });

        if (!_.isEmpty(rangeKeyFields)) {
          valueHelpDialog.setRangeKeyFields(rangeKeyFields);
        }

        if (!_.isEmpty(searchFields)) {
          valueHelpDialog.getFilterBar().setBasicSearch(searchField);
        }

        valueHelpDialog.getTableAsync().then(
          function (table) {
            table.setModel(dataModel);
            table.setModel(columnModel, "columns");

            if (!isLazyLoadingData) {
              if (table.bindRows) {
                table.bindAggregation("rows", {
                  path: dataPath,
                  filters: aFilters,
                  sorter: aSorters,
                  events: {
                    dataReceived: function () {
                      if (!_.has(table.getBinding("rows"), "aKeys"))
                        this.refineModel(table.getBinding("rows"));
                      valueHelpDialog.update();
                    }.bind(this),
                  },
                });
                table.bindColumns("columns>/cols", function (sId, oContext) {
                  let oColObject = oContext.getObject();
                  return new sap.ui.table.Column(oColObject);
                });
              }

              if (table.bindItems) {
                table.bindAggregation(
                  "items",
                  {
                    path: dataPath,
                    filters: aFilters,
                    sorter: aSorters,
                    events: {
                      dataReceived: function () {
                        if (!_.has(table.getBinding("items"), "aKeys"))
                          this.refineModel(table.getBinding("items"));
                        valueHelpDialog.update();
                      }.bind(this),
                    },
                  },
                  function () {
                    return new ColumnListItem({
                      cells: _.map(columnData.cols, function (column) {
                        return new Label({
                          text: "{" + column.template + "}",
                        });
                      }),
                    });
                  }
                );
              }
            }

            // Set Filterbar with default value
            if (!_.isEmpty(initCondition)) {
              let filterItems = valueHelpDialog
                .getFilterBar()
                .getFilterGroupItems();

              _.forEach(filterItems, function (filterItem) {
                let fieldName = filterItem.getControl().getName();

                if (fieldName && !_.isEmpty(initCondition[fieldName])) {
                  filterItem.getControl().setValue(initCondition[fieldName]);
                }
              });
            }

            valueHelpDialog.update();
          }.bind(this)
        );

        this.setValueHelp(
          valueHelpName,
          valueHelpDialog,
          searchFields,
          callback,
          dataModelName
        );
        valueHelpDialog.open();
      },

      refineModel: function (oRow) {
        let keys = [];
        let aContexts = oRow.aContexts;
        aContexts.forEach((context) => {
          keys.push(context.sPath.substring(1));
        });
        oRow.aKeys = keys;
      },

      /**
       * i18n 모델 할당
       * @param {Object} i18n i18n ResourceBundle 객체
       */
      setI18n: function (i18n) {
        this.i18n = i18n;
      },

      /**
       * Value Help 검색
       * @param {String}} valueHelpName ValueHelp 이름
       * @returns {Object} ValueHelp Object 데이터
       */
      getValueHelp: function (valueHelpName) {
        return _.find(this.valueHelpList, { name: valueHelpName });
      },
      /**
       * ValueHelp Object 설정
       * @param {String} valueHelpName ValueHelp Name
       * @param {Object} valueHelpDialog ValueHelpDialog 객체
       * @param {Array} searchFields search Field 검색 대상 필드
       * @param {Function} callback ok 버튼을 누르는 경우 해당 결과값을 가지고 처리해야하는 로직 함수
       *  --> 최초 valuehelp 호출하는 로직에서 넣어줘야 한다
       */
      setValueHelp: function (
        valueHelpName,
        valueHelpDialog,
        searchFields,
        callback,
        dataModelName
      ) {
        let vh = this.getValueHelp(valueHelpName);

        if (vh) {
          vh.valuehelp = valueHelpDialog;
        } else {
          this.valueHelpList.push({
            name: valueHelpName,
            dialog: valueHelpDialog,
            searchFields: searchFields,
            ok: callback,
            dataModelName: dataModelName,
          });
        }
      },

      /**
       * Value Help 창을 닫는다
       * @param {Object} event 이벤트 객체
       * @param {String} valueHelp 대상 ValueHelp 이름
       */
      cancel(event, valueHelp) {
        let valueHelpObj = _.find(this.valueHelpList, { name: valueHelp });

        if (_.isEmpty(valueHelpObj)) {
          throw new Error(
            this.i18n.getText("errorNotRegisteredValueHelp", [valueHelp])
          );
        }

        valueHelpObj.dialog.close();
      },

      /**
       * Value Help창을 닫고 나서 가장 마지막에 해당 ValueHelp를 삭제한다
       * @param {Object} event 이벤트 객체
       * @param {String} valueHelp Value Help 이름
       */
      afterClose(event, valueHelp) {
        let valueHelpObj = _.find(this.valueHelpList, { name: valueHelp });

        if (_.isEmpty(valueHelpObj)) {
          throw new Error(
            this.i18n.getText("errorNotRegisteredValueHelp", [valueHelp])
          );
        }

        valueHelpObj.dialog.destroy();
        this.valueHelpList = _.reject(this.valueHelpList, { name: valueHelp });
      },

      /**
       * Search 이벤트 공통
       * @param {Object} event 이벤트 객체
       * @param {String} valueHelp Value Help Name
       */
      searchCommon: function (event, valueHelp) {
        let valueHelpObj = this.getValueHelp(valueHelp);

        if (_.isEmpty(valueHelpObj)) {
          this.i18n.getText("errorNotRegisteredValueHelp", [valueHelp]);
        }

        let queryString = "";
        if (valueHelpObj.dialog.getFilterBar().getBasicSearch()) {
          queryString = valueHelpObj.dialog
            .getFilterBar()
            .getBasicSearchValue();
        }

        let selectionSet = event.getParameters().selectionSet;
        let DefaultFilters = _.cloneDeep(commonDataSearchFilters);
        let DefaultSorts = _.cloneDeep(commonDataSorters);

        let table = this.getValueHelp(valueHelp).dialog.getTable();

        if (table.bindRows) {
          table.bindAggregation("rows", { path: commonDataPath });
        }

        if (table.bindItems) {
          table.bindAggregation("items", { path: commonDataPath }, function () {
            return new ColumnListItem({
              cells: _.map(columnData.cols, function (column) {
                return new Label({
                  text: "{" + column.template + "}",
                });
              }),
            });
          });
        }

        let filters = _.reduce(
          selectionSet,
          function (filterResult, selectionField) {
            if (selectionField.getValue() && selectionField.getName()) {
              filterResult.push(
                new Filter({
                  path: selectionField.getName(),
                  operator: FilterOperator.Contains,
                  value1: selectionField.getValue(),
                })
              );
              return filterResult;
            } else {
              return filterResult;
            }
          },
          DefaultFilters
        );

        if (_.isEmpty(filters)) {
          filters = [];
        }

        let searchFilterResult = null;
        if (!_.isEmpty(queryString)) {
          let searchFilters = _.map(
            valueHelpObj.searchFields,
            function (searchField) {
              return new Filter({
                path: searchField,
                operator: FilterOperator.Contains,
                value1: queryString,
              });
            }
          );

          searchFilterResult = new Filter({
            filters: searchFilters,
            and: false,
          });

          filters.push(searchFilterResult);
        }

        let filterResult = null;
        if (!_.isEmpty(filters)) {
          filterResult = new Filter({
            filters: filters,
            and: true,
          });
        }

        this._filterTable(valueHelpObj, filterResult);
        this._sortTable(valueHelpObj, DefaultSorts);
      },

      /**
       * OK 버튼을 누르는 경우 선택된 항목을 리턴해 주는 함수
       * @param {Object} event 이벤트 객체
       * @param {String} valueHelpName ValueHelp 이름
       */
      ok: function (event, valueHelpName) {
        let valueHelpObj = this.getValueHelp(valueHelpName);

        if (!valueHelpObj.ok) {
          throw Error(this.i18n("errorNoValueHelpCallback"));
        } else {
          valueHelpObj.dialog.close();
          valueHelpObj.ok(event.getParameters().tokens);
        }
      },

      search: function (event, valueHelp) {
        if (!this.getValueHelp(valueHelp)) {
          throw new Error(
            this.i18n.getText("errorNotRegisteredValueHelp", [valueHelp])
          );
        }

        this.searchCommon(event, valueHelp);
      },

      // Private Method
      _filterTable: function (valueHelpObj, oFilter) {
        valueHelpObj.dialog.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }

          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }

          valueHelpObj.dialog.update();
        });
      },

      _sortTable: function (valueHelpObj, aSorter) {
        valueHelpObj.dialog.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").sort(aSorter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").sort(aSorter);
          }
          valueHelpObj.dialog.update();
        });
      },
    });

    return model;
  }
);
