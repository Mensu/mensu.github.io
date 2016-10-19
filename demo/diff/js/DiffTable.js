var $ = require('./jquery.js');
var changeType = {
    "new": 0,
    "change": 1
  };
function DiffTable(selector, row, d) {
  this.selector = selector;
  this.row = row;
  this.$init(d);
}
DiffTable.prototype = {
  "constructor": DiffTable,
  "changeType": changeType,
  "$init": function(d) {
    var $parent = $(this.selector);
    var $oldTable = $parent.find('.diff-table');
    if ($oldTable.length) $oldTable.detach();
    var $table = $('<table>')
      .addClass('diff-table')
      .appendTo($parent);

    var $thead = $('<thead>')
      .appendTo($table);

    var $leftTop = $('<th>');
    var $row = $('<tr>')
      .append($leftTop)
      .appendTo($thead);
    var $middle = null;
    for (var i = 0, col = 2 * d + 1; i < col; ++i) {
      var $th = $('<th>').text(i - d);
      if (i - d == 0) $middle = $th;
      $row.append($th);
    }

    var $tbody = $('<tbody>').appendTo($table);
    for (var i = 0; i < this.row; ++i) {
      $row = $('<tr>')
        .append($('<td>').text(i))
        .appendTo($tbody);
      for (var j = 0, col = 2 * d + 1; j < col; ++j) {
        $row.append($('<td>').text('-1'));
      }
    }
    var middleLeft = $middle[0].offsetLeft - $parent.width() / 2;
    $table.data('middleLeft', middleLeft);
    this.scrollTo(middleLeft);

    $table.data('d', d);
    this.d = d;
    this['$curTable'] = $table;
    return {
      "$oldTable": $oldTable,
      "$curTable": $table
    };
  },
  "scrollTo": function(scrollLeft) {
    $(this.selector).parent().scrollLeft(scrollLeft);
  },
  "detach": function() {
    this.$curTable.detach();
  },
  "reattach": function() {
    this.$curTable.prependTo($(this.selector));
    this.scrollTo(this.$curTable.data('middleLeft'));
  },
  "restore": function($newTable) {
    var $parent = $(this.selector);
    var $oldTable = $parent.find('.diff-table');
    this.$curTable = $newTable;
    
    this.d = $newTable.data('d');
    if ($oldTable.length) $oldTable.detach();
    this.reattach();
    return $oldTable;
  },
  "applyChange": function(cur) {
    var prev = cur.prev;
    if (cur.type == changeType['new']) {
        if (cur.$curTable === undefined) {
            var tables = this.$init(cur.d);
            cur['$oldTable'] = tables.$oldTable;
            this.$curTable = cur['$curTable'] = tables.$curTable;
        } else {
            cur['$oldTable'] = this.restore(cur.$curTable);
        }
        this.applyChange(cur.after);
    } else if (cur.type == changeType.change) {
        if (prev && prev.type == changeType.change) {
            this.unmodify(prev.changes, true);
        }
        this.modify(cur.changes);
    }

  },
  "recoverChangeFrom": function(cur) {
    var prev = cur.prev;
    if (cur.type == changeType['new']) {
      cur.$curTable = this.restore(cur.$oldTable);
    } else if (cur.type == changeType.change) {
      this.unmodify(cur.changes);
      if (prev && prev.type == changeType.change) {
        this.modify(prev.changes, false, true);
      }
    }

  },
  "modify": function(changes, notChangeValue, notBackupValue) {
    var $rows = $(this.selector).find('.diff-table tbody tr');
    var d = this.d;
    changes.forEach(function(oneChange) {
      var $td = $rows.eq(oneChange.row).find('td').eq(oneChange.col + d + 1);
      if (!notBackupValue) oneChange['prevValue'] = $td.text();
      if (!notChangeValue && oneChange.value !== undefined) $td.text(oneChange.value);
      if (oneChange.class !== undefined) $td.addClass(oneChange.class.join(' '));
    });
  },
  "unmodify": function(changes, notChangeValue, notChangeStyle) {
    var $rows = $(this.selector).find('.diff-table tbody tr');
    var d = this.d;
    changes.forEach(function(oneChange) {
      var $td = $rows.eq(oneChange.row).find('td').eq(oneChange.col + d + 1);
      if (!notChangeValue && oneChange.prevValue) $td.text(oneChange.prevValue);
      if (oneChange.class) $td.removeClass(oneChange.class.join(' '));
    });
  }
};
DiffTable['changeType'] = DiffTable.prototype.changeType;

(function exportModuleUniversally(root, factory) {
  if (typeof(exports) === 'object' && typeof(module) === 'object')
    module.exports = factory();
  else if (typeof(define) === 'function' && define.amd)
    define(factory);
  /* amd  // module name: diff
    define([other dependent modules, ...], function(other dependent modules, ...)) {
      return exported object;
    });
    usage: require([required modules, ...], function(required modules, ...) {
      // codes using required modules
    });
  */
  else if (typeof(exports) === 'object')
    exports['DiffTable'] = factory();
  else
    root['DiffTable'] = factory();
})(this, function factory() {
  return DiffTable;
});
