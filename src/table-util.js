/*global module, require*/
module.exports = function TableUtil() {
	'use strict';
	var self = this,
		RegexUtil = require ('./regex-util'),
		regexUtil = new RegexUtil();
	self.normaliseTitle = function (string) {
		return string.toLocaleLowerCase().replace(/\s/g, '');
	};
	self.normaliseObject = function (object) {
		var result = {};
		Object.keys(object).forEach(function (key) {
			result[self.normaliseTitle(key)] = object[key];
		});
		return result;
	};
	self.cellValuesForRow = function (dataRow) {
		if (!dataRow || dataRow.trim() === '') {
			return [];
		}
		var values = dataRow.split('|');
		if (values.length < 3) {
			return [];
		}
		values.pop();
		values =  values.slice(1);
		return values.map(function (v) {
			return v.trim();
		});
	};
	//TODO: validate table. eg multiple columns matching same normalised title so non-deterministic results
	self.tableValuesForTitles = function (table, titles) {
		if (!titles || titles.length === 0) {
			return false;
		}
		var pickItems = function (tableRow) {
					return columnIndexes.map(function (val) {
						return tableRow[val];
					});
				},
				normalisedTitles = titles.map(self.normaliseTitle),
				normalisedTableTitles = table.titles.map(self.normaliseTitle),
				columnIndexes = normalisedTitles.map(function (title) {
					return normalisedTableTitles.indexOf(title);
				});
		return table.items.map(pickItems);
	};
	self.objectArrayValuesForTitles = function (list, titles) {
		if (!titles || titles.length === 0) {
			return false;
		}
		var normalisedTitles = titles.map(self.normaliseTitle),
				pickItems = function (item) {
					return normalisedTitles.map(function (title) {
						return item[title];
					});
				};
		return list.map(self.normaliseObject).map(pickItems);
	};
	self.justifyTable = function (stringArray) {
		var maxCellLengths = function (maxSoFar, tableRow, index) {
				if (dividerRows[index]) {
					return maxSoFar;
				}
				var currentLengths = tableRow.map(function (s) {
					return s.length;
				});
				if (!maxSoFar) {
					return currentLengths;
				} else {
					return currentLengths.map(function (v, i) {
						return Math.max(v, (maxSoFar[i] || 0));
					});
				}
			},
			cellValues = stringArray.map(self.cellValuesForRow),
			dividerRows = stringArray.map(regexUtil.isTableHeaderDivider),
			columnLengths = cellValues.reduce(maxCellLengths, []),
			padding = function (howMuch, padChar) {
				return new Array(howMuch + 1).join(padChar);
			},
			padCells = function (cells, rowIndex) {
				return cells.map(function (cellVal, index) {
					if (dividerRows[rowIndex]) {
						return padding(2 + columnLengths[index], '-');
					} else {
						return ' '  + cellVal + padding(1 + columnLengths[index] - cellVal.length, ' ');
					}
				});
			},
			joinCells = function (cells) {
				return '|' + cells.join('|')	+ '|';
			};
		return cellValues.map(padCells).map(joinCells);
	};
};
