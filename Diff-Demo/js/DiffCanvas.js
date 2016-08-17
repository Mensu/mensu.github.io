var config = require('./diffConfig.js');
var $ = require('./jquery.js');
require('./bootstrap.js')(this, $);
function DiffCanvas(selector, xStr, yStr) {
  this.selector = selector;
  this.$init(xStr, yStr);
}
DiffCanvas.prototype = {
  "DiffType": {
    "removed": -1,
    "common": 0,
    "added": 1
  },
  "$init": function(xStr, yStr) {
    var $parent = $(this.selector);
    var $oldBg = $parent.find('.bg');
    if ($oldBg.length) $oldBg.detach();
    var $curBg = $('<div>')
      .addClass('bg')
      .css({
          "width": xStr.length * config.cellHeight + 'px',
          "height": yStr.length * config.cellWidth + 'px'
        })
      .append([
          this.$getXAxis(xStr),
          this.$getYAxis(yStr),
          $('<div>').addClass('squares-wrapper'),
          $('<div>').addClass('arrows-wrapper')
        ])
      .prependTo($parent);

    
    (function drawDiagonals(xMax, yMax) {
      var $diagonals = $('<div>').addClass('diagonals-wrapper').appendTo($curBg);
      for (var k = -yMax; k <= xMax; ++k) {
        var length = (k < 0 ? (yMax + k + 2) : (xMax - k + 2)) * 1.414 * config.cellHeight,
            x = (k < 0 ? -1 : k - 1),
            y = (k < 0 ? -1 - k : -1);

        var $oneDiagonal = $('<div>')
          .addClass('diagonal')
          .css({
              "left": (x * config.cellWidth + 2) + 'px',
              "top": (y * config.cellHeight - 2) + 'px',
              "width": length + 'px'
            })
          .tooltip({
              "placement": 'mouse',
              "container": 'body',
              "title": 'diagonal ' + k
            })
          .appendTo($diagonals);
      }
    })(xStr.length, yStr.length);

    (function drawPoints(xStr, yStr) {
      var $points = $('<div>').addClass('points-wrapper').appendTo($curBg);
      for (var x = 0; x <= xStr.length; ++x) {
        for (var y = 0; y <= yStr.length; ++y) {
          var $infoX = $('<div>')
            .addClass('point-inner')
            .tooltip({
              "placement": 'top',
              "container": '#main',
              "title": '"' + (x ? xStr[x - 1] : '') + '"'
            });
          var $infoY = $('<div>')
            .addClass('point-inner')
            .append($infoX)
            .tooltip({
              "placement": 'left',
              "container": '#main',
              "title": '"' + (y ? yStr[y - 1] : '') + '"'
            });
          var $onePoint = $('<div>')
            .addClass('point-outer')
            .css({
                "left": x * config.cellWidth - config.cellWidth / 8 + 'px',
                "top": y * config.cellHeight - config.cellHeight / 8 + 'px'
              })
            .append($infoY)
            .tooltip({
              "placement": 'bottom',
              "container": '#main',
              "title": '( ' + x + ' ,  ' + y + ' )\ndiagonal ' + (x - y)
            })
            .appendTo($points);

        }
      }
    })(xStr, yStr);
    return {
      "$oldBg": $oldBg,
      "$curBg": $curBg
    };
  },
  "restore": function($newBg) {
    var $parent = $(this.selector);
    var $oldBg = $parent.find('.bg');
    if ($oldBg.length) $oldBg.detach();
    $newBg.appendTo($parent);
    return $oldBg;
  },
  "$getXAxis": function(str) {
    var $xAxis = $('<div>').addClass('x-axis');
    for (var i in str) {
      $('<div>')
        .addClass('axis-cell x-axis-cell')
        .text(str[i])
        .appendTo($xAxis);
    }
    return $('<div>')
      .addClass('x-axis-wrapper')
      .append($xAxis);
  },
  "$getYAxis": function(str) {
    var $yAxis = $('<div>').addClass('y-axis');
    for (var i in str) {
      $('<div>')
        .addClass('axis-cell y-axis-cell')
        .text(str[i])
        .appendTo($yAxis);
    }
    return $('<div>')
      .addClass('y-axis-wrapper')
      .append($yAxis);
  },
  "drawHorizontalArrow": function(oneDiff, color) {
    var $wrapper = $(this.selector).find('.arrows-wrapper');
    oneDiff['$arrow'] = $('<div>')
      .addClass('horizontal-line horizontal-line-' + color)
      .css({
          "left": oneDiff.x * config.cellWidth + 'px',
          "top": (oneDiff.y * config.cellHeight - 9) + 'px'
        })
      .tooltip({
        "placement": 'auto top',
        "container": 'body',
        "title": oneDiff.d + '-path\non diagonal ' + (oneDiff.x + 1 - oneDiff.y)
      })
      .appendTo($wrapper);
  },
  "drawDiagonalArrow": function(oneDiff, color) {
    var $wrapper = $(this.selector).find('.arrows-wrapper');
    oneDiff['$arrow'] = $('<div>')
      .addClass('diagonal-line diagonal-line-' + color)
      .css({
          "left": oneDiff.x * config.cellWidth + 'px',
          "top": oneDiff.y * config.cellHeight + 'px'
        })
      .appendTo($wrapper);
  },
  "drawVerticalArrow": function(oneDiff, color) {
    var $wrapper = $(this.selector).find('.arrows-wrapper');
    oneDiff['$arrow'] = $('<div>')
      .addClass('vertical-line vertical-line-' + color)
      .css({
          "left": (oneDiff.x * config.cellWidth - 8) + 'px',
          "top": oneDiff.y * config.cellHeight + 'px'
        })
      .tooltip({
        "placement": 'auto left',
        "container": 'body',
        "title": oneDiff.d + '-path\non diagonal ' + (oneDiff.x - oneDiff.y - 1)
      })
      .appendTo($wrapper);
  },
  "drawArrows": function(oneDiff, color) {
    if (oneDiff.diffType == this.DiffType.removed) this.drawHorizontalArrow(oneDiff, color);
    else if (oneDiff.diffType == this.DiffType.common) this.drawDiagonalArrow(oneDiff, color);
    else if (oneDiff.diffType == this.DiffType.added) this.drawVerticalArrow(oneDiff, color);
  },
  "drawDiff": function(oneDiff, color) {
    return this.drawArrows(oneDiff, (color ? color : 'black')), true;
  },
  "undrawDiff": function(oneDiff) {
    if (oneDiff.$arrow) return oneDiff.$arrow.remove(), oneDiff.$arrow = undefined, true;
    else return false;
  },
  "drawEditPath": function(editPath) {
    for (var i = 0; i < editPath.length; ++i) {
      this.drawDiff(editPath[i], 'red');
    }
    return false;
  },
  "undrawEditPath": function(editPath) {
    if (0 == editPath.length) return false;
    for (var i = 0; i < editPath.length; ++i) {
      this.undrawDiff(editPath[i]);
    }
    return true;
  },
  "drawSquare": function(range, color) {
    var $wrapper = $(this.selector).find('.squares-wrapper');
    $('<div>')
      .addClass('diff-square diff-square-' + (color ? color : 'black'))
      .css({
          "left": range.before.begin * config.cellWidth - 2 + 'px',
          "top": range.after.begin * config.cellHeight - 2 + 'px',
          "width": (range.before.end - range.before.begin) * config.cellWidth + 'px',
          "height": (range.after.end - range.after.begin) * config.cellHeight + 'px'
        })
      .prependTo($wrapper);
  },
  "drawSquares": function(ranges) {
    var $wrapper = $(this.selector).find('.squares-wrapper');
    $wrapper.find('.diff-square').remove();
    if (ranges == null) return;
    else if ( ({}).toString.apply(ranges) != '[object Array]') ranges = [ranges];
    for (var i = 0; i != ranges.length; ++i) {
      this.drawSquare(ranges[i], i ? 'black' : 'red');
    }
  }
};
DiffCanvas.DiffType = DiffCanvas.prototype.DiffType;
DiffCanvas.prototype.constructor = DiffCanvas;

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
    exports['DiffCanvas'] = factory();
  else
    root['DiffCanvas'] = factory();
})(this, function factory() {
  return DiffCanvas;
});
