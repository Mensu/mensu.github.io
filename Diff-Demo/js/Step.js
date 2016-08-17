// var config = require('./diffConfig.js');
// var $ = require('./jquery.js');
// require('./bootstrap.js')(this, $);
var DiffTable = require('./DiffTable.js');
var DiffCanvas = require('./DiffCanvas.js');

function Diff(x, y, diffType, d, changes, reverse, globalRange) {
  this['x'] = x;
  this['y'] = y;
  this['diffType'] = diffType;
  this['d'] = d;
  if (changes) {
    this['tableChange'] = new TableChange(TableChange.type.change, changes);
  }
  this['reverse'] = reverse;
  if (globalRange) {
    this['globalDiff'] = new Diff(globalRange.before.begin + x, globalRange.after.begin + y, diffType, -1);
  }
}
Diff.prototype['DiffType'] = Diff['DiffType'] = DiffCanvas.DiffType;

function Scene(range, before, after, tableParam) {
  this['before'] = before;
  this['after'] = after;
  this['range'] = range;
  if (tableParam) {
    this['tableChange'] = new TableChange(TableChange.type['new'], tableParam);
  }
}
Scene.prototype = {
  "constructor": Scene,
  "isIn": function(another) {
    if (another.range.before.begin <= this.range.before.begin
        && this.range.before.end <= another.range.before.end
        && another.range.after.begin <= this.range.after.begin
        && this.range.after.end <= another.range.after.end) {
      return true;
    } else {
      return false;
    }
  }
};

function TableChange(type, param) {
  this.type = type;
  if (type == TableChange.type['new']) {
    this.d = param.d;
    this.after = new TableChange(TableChange.type.change, param.after);
  } else if (type == TableChange.type.change) {
    if ( ({}).toString.apply(param) != '[object Array]') {
      param = [param];
    }
    this.changes = param;
  }
}
TableChange.prototype = {
  "constructor": TableChange,
  "type": DiffTable.changeType,
  "class": {
    "selected": 'cell-selected',
    "choice": 'cell-choice'
  },
  "isIn": function(another) {
    if (another.range.before.begin <= this.range.before.begin
        && this.range.before.end <= another.range.before.end
        && another.range.after.begin <= this.range.after.begin
        && this.range.after.end <= another.range.after.end) {
      return true;
    } else {
      return false;
    }
  }
};
TableChange['type'] = TableChange.prototype.type;
TableChange['class'] = TableChange.prototype.class;

function Step(type, param) {
  this['type'] = type;
  switch (type) {
    case Step.type.diff: {
      this['content'] = new Diff(param.x, param.y, param.diffType, param.d, param.tableParam, param.reverse, param.globalRange);
      break;
    }
    case Step.type.scene: {
      this['content'] = new Scene(param.range, param.before, param.after, param.tableParam);
      break;
    }
    case Step.type.editPath: {
      this['content'] = param.map(function(oneStep) {
        return oneStep.content;
      });
    }
  }
}
Step.prototype = {
  "constructor": Step,
   "type": {
     "diff": 0,
     "scene": 1,
     "editPath": 2
   },
   "addTableChange": function(param) {
     this.content.tableChange = new TableChange(TableChange.type.change, param);
   }
};
Step['type'] = Step.prototype.type;
Step['Diff'] = Diff;
Step['Scene'] = Scene;
Step['TableChange'] = TableChange;

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
    exports['Step'] = factory();
  else
    root['Step'] = factory();
})(this, function factory() {
  return Step;
});

// OneDiff.prototype = {
//   "createEndPointSpan": function(endX, endY) {
//     return createElementWith('span', 'log-info-snake-end-point',
//               [
//                 createElementWith('span', 'log-info-snake-end-point-text', '(' + endX + ', ' + endY + ')'),
//                 createElementWith('span', ['log-info-snake-end-point-json', 'hidden'], '{"endX":' + endX + ',"endY":' + endY + '}')
//               ]
//             );
//   },

//   "createSnakeSpan": function(endX, endY) {
//     return createElementWith('span', ['log-info-snake', 'hidden'],
//               [
//                 createElementWith('span', 'log-info-snake-plus', ' + '),
//                 createElementWith('span', 'log-info-snake-num', '0'),
//                 createElementWith('span', 'log-info-snake-text', '-length snake to '),
//                 this.createEndPointSpan(endX, endY)
//               ]
//             );
//   },

//   "logInfo": function(red, arrow) {
//     var log = document.getElementById('log');
//     var oneInfo = null;
//     if (log.querySelector('.log-info') === null) log.appendChild(createElementWith('div', 'log-info',
//         [
//           createElementWith('span', ['log-info-d-path-on-diagonal-k', 'log-info-d-path-on-diagonal-k-black'], '0-path on diagonal 0:   (0, 0)'),
//           this.createSnakeSpan(0, 0)
//         ]
//       )
//     );
//     if (this.type) {
//       var endX = parseInt(this.x) + (this.type == DiffType.removed), endY = parseInt(this.y) + (this.type == DiffType.added);
//       var summary = createElementWith('span', ['log-info-d-path-on-diagonal-k', 'log-info-d-path-on-diagonal-k-' + (red ? 'red' : 'black')], this.d + '-path on diagonal ' + (endX - endY) + ':   ');
//       $(summary).on('mouseover', function(mouseEvent) {
//         $(arrow).tooltip('show');
//       });
//       $(summary).on('mouseout', function(mouseEvent) {
//         $(arrow).tooltip('hide');
//       });
//       var modifyPath = createElementWith('div', ['log-info-modify-path', (this.type == DiffType.removed ? 'horizontal-path' : 'vertical-path')],
//                             [
//                               createElementWith('div', 'log-info-modify-path-start-point', '(' + this.x + ', ' + this.y + ')'),
//                               createElementWith('div', ['log-info-modify-path-arrow', (this.type == DiffType.removed ? 'horizontal-arrow' : 'vertical-arrow')]),
//                               createElementWith('div', 'log-info-modify-path-end-point', '(' + endX + ', ' + endY + ')')
//                             ]
//                           );
//       oneInfo = createElementWith('div', 'log-info',
//         [
//           summary, modifyPath, this.createSnakeSpan(endX, endY)
//         ]
//       );
//     } else {
//       var snakeSpan = log.lastElementChild.querySelector('.log-info-snake');
//       var numSpan = snakeSpan.querySelector('.log-info-snake-num'), endPointSpan = snakeSpan.querySelector('.log-info-snake-end-point');
//       snakeSpan.classList.remove('hidden');
//       numSpan.textContent = parseInt(numSpan.textContent) + 1;
//       var endPointJson = JSON.parse(endPointSpan.querySelector('.log-info-snake-end-point-json').textContent);
//       var endX = parseInt(endPointJson.endX) + 1, endY = parseInt(endPointJson.endY) + 1;
//       snakeSpan.removeChild(endPointSpan);
//       snakeSpan.appendChild(this.createEndPointSpan(endX, endY));
//     }
//     if (oneInfo) {
//       if (log.lastElementChild && ~log.lastElementChild.className.indexOf(red ? 'black' : 'red')) log.appendChild(createElementWith('br'));
//       log.appendChild(oneInfo);
//       if (OneDiff.toScrollToLastestLog) oneInfo.scrollIntoView();
//     };
    
//   },

//   "unlogInfo": function() {
//     var log = document.getElementById('log');
//     if (log.lastElementChild) {
//       var snakeSpan = log.lastElementChild.querySelector('.log-info-snake');
//       var numSpan = snakeSpan.querySelector('.log-info-snake-num'), endPointSpan = snakeSpan.querySelector('.log-info-snake-end-point');
//       var curNum = parseInt(numSpan.textContent) - 1;
//       var endPointJson = JSON.parse(endPointSpan.querySelector('.log-info-snake-end-point-json').textContent);
//       if (curNum == -1) {
//         log.removeChild(log.lastElementChild);
//       } else {
//         if (curNum == 0) snakeSpan.classList.add('hidden');
//         var endX = parseInt(endPointJson.endX) - 1, endY = parseInt(endPointJson.endY) - 1;
//         numSpan.textContent = curNum;
//         snakeSpan.removeChild(endPointSpan);
//         snakeSpan.appendChild(this.createEndPointSpan(endX, endY));
//       }
//       if (log.querySelectorAll('.log-info').length == 1) {
//         if (log.querySelector('.log-info').querySelector('.log-info-snake') === null || log.querySelector('.log-info').querySelector('.log-info-snake.hidden')) log.removeChild(log.lastElementChild);
//         return;
//       }
//     }
//   }

// };
// OneDiff.prototype.constructor = OneDiff;