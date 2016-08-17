var DiffCanvas = require('./DiffCanvas.js');
var DiffType = DiffCanvas.DiffType;
var DiffAlgorithm = require('./DiffAlgorithm.js');
var Step = require('./Step.js');
var config = require('./diffConfig.js');

function BasicResultStack(oldStr, newStr, diffCanvas, diffTable) {
  this['result'] = DiffAlgorithm.basic.getResult(oldStr, newStr);
  this['diffCanvas'] = diffCanvas;
  var prevTableChange = null;
  this['result'].forEach(function(oneStep) {
    var content = oneStep.content;
    if (content.tableChange) {
      content.tableChange['prev'] = prevTableChange;
      prevTableChange = content.tableChange;
    }
  });
  this['diffTable'] = diffTable;
  this['indexToDraw'] = 0;
}
BasicResultStack.prototype = {
  "constructor": BasicResultStack,
  "push": function() {
    if (this.indexToDraw == this.result.length) return false;  // unable to push now

    var curStep = this.result[this.indexToDraw];
    if (curStep.content.tableChange) this.diffTable.applyChange(curStep.content.tableChange);

    if (curStep.type == Step.type.editPath) {
      this.diffCanvas.drawEditPath(curStep.content);
    } else {
      this.diffCanvas.drawDiff(curStep.content);
    }
    return ++this.indexToDraw != this.result.length;  // equal => false => unable to push now
  },


  "pop": function() {
    if (this.indexToDraw == 0) return false;    // unable to pop now

    var curStep = this.result[this.indexToDraw - 1];
    if (curStep.type == Step.type.editPath) {
      this.diffCanvas.undrawEditPath(curStep.content);
    } else {
      this.diffCanvas.undrawDiff(curStep.content)
      if (curStep.content.tableChange) {
        this.diffTable.recoverChangeFrom(curStep.content.tableChange);
      }
      return --this.indexToDraw != 0;  // pop successfully: see whether it is able to pop once more
      // } else {
      //   return true;  // failed to pop: able to pop once again
      // }
    }
    return --this.indexToDraw != 0;    // whether it is able to pop once more
    
  },
  "clear": function() {
    while (this.pop());
  }
};

function AdvancedResultStack(oldStr, newStr, canvases, diffTable) {
  var res = this['result'] = DiffAlgorithm.advanced.getResult(oldStr, newStr);
  this['diffCanvas'] = canvases.diffCanvas;
  this['diffTable'] = diffTable;
  this['globalCanvas'] = canvases.globalCanvas;

  var prevTableChange = null,
      prevScene = null;
      scenes = [];
  res.forEach(function(oneStep) {
    var content = oneStep.content;
    if (oneStep.type == Step.type.scene) {
      content['prev'] = prevScene;
      scenes.push(prevScene = content);
    }
    if (content.tableChange) {
      content.tableChange['prev'] = prevTableChange;
      prevTableChange = content.tableChange;
    }
  });
  this.genRanges(scenes);

  this['reverse'] = {
    "contents": this.genReverse(oldStr.length, newStr.length, res),
    "diffCanvas": canvases.reverseDiffCanvas
  };
  this['indexToDraw'] = 0;
}
AdvancedResultStack.prototype = {
  "constructor": AdvancedResultStack,
  "push": function() {
    if (this.indexToDraw == this.result.length) return false;  // unable to push now

    var curStep = this.result[this.indexToDraw];
    if (curStep.content.tableChange) this.diffTable.applyChange(curStep.content.tableChange);
    
    var content = curStep.content,
        contentR = this.reverse.contents[this.indexToDraw];
    if (curStep.type == Step.type.scene) {
      this.globalCanvas.drawSquares(content.squareRanges);
      function changeBg(diffCanvas, content) {
        if (content.$curBg === undefined) {
          var bgs = diffCanvas.$init(content.before, content.after);
          content['$oldBg'] = bgs.$oldBg;
          content['$curBg'] = bgs.$curBg;
        } else {
          content.$oldBg = diffCanvas.restore(content.$curBg);
        }
      }
      changeBg(this.diffCanvas, content);
      changeBg(this.reverse.diffCanvas, contentR);

    } else {
      this.diffCanvas.drawDiff(content, content.reverse ? 'red' : 'black');
      this.reverse.diffCanvas.drawDiff(contentR, contentR.reverse ? 'red' : 'black');
      if (content.globalDiff) {
        this.globalCanvas.drawDiff(content.globalDiff, 'red');
      }
    }
    return ++this.indexToDraw != this.result.length;
  },

  "pop": function() {
    if (this.indexToDraw == 0) return false;    // unable to pop now

    var curStep = this.result[this.indexToDraw - 1];
    var content = curStep.content;
    var contentR = this.reverse.contents[this.indexToDraw - 1];
    if (content.tableChange) this.diffTable.recoverChangeFrom(content.tableChange);
    if (content.globalDiff) this.globalCanvas.undrawDiff(content.globalDiff);
   
    if (curStep.type == Step.type.scene) {
      var prevScene = content.prev || {"squareRanges": null};
      this.globalCanvas.drawSquares(prevScene.squareRanges);
      if (content.$oldBg) {
        this.diffCanvas.restore(content.$oldBg);
        this.reverse.diffCanvas.restore(contentR.$oldBg);
      }
      return --this.indexToDraw != 0;
    } else if ((this.diffCanvas.undrawDiff(content) && this.reverse.diffCanvas.undrawDiff(contentR)), true) {
      return --this.indexToDraw != 0;  // pop successfully: see whether is it able to pop once more
    } else {
      return true;  // failed to pop: able to pop once again
    }
  },

  "clear": function() {
    while (this.pop());
  },

  "genReverse": function(oldStrLength, newStrLength, originResult) {
    return originResult.map(function(oneStep, index, self) {
      var ret = null,
          reverseRange = null,
          content = oneStep.content;
      if (oneStep.type == Step.type.scene) {
        oldStrLength = content.before.length,
        newStrLength = content.after.length;
        reverseRange = {
            "before": {
              "begin": content.range.before.end,
              "end": content.range.before.begin
            },
            "after": {
              "begin": content.range.after.end,
              "end": content.range.after.begin
            }
          };
        ret = {
            "before": content.before.split('').reverse().join(''),
            "after": content.after.split('').reverse().join(''),
            "range": reverseRange
          };
      } else {
        ret = {
            "x": oldStrLength - content.x - (content.diffType != DiffType.added),
            "y": newStrLength - content.y - (content.diffType != DiffType.removed),
            "diffType": content.diffType,
            "d": content.d,
            "reverse": content.reverse
          };
      }
      return ret;
    });
  },

  "genRanges": function(scenes) {
    scenes[0]['squareRanges'] = [scenes[0].range];
    for (var i = 1, curRoot = scenes[0], cur = scenes[i]; i < scenes.length; curRoot = scenes[i], ++i, cur = scenes[i]) {
      cur['squareRanges'] = [cur.range];
      while (!cur.isIn(curRoot)) {
        curRoot = curRoot.root;
      }
      cur['root'] = curRoot;
      cur.squareRanges = cur.squareRanges.concat(curRoot.squareRanges);
    }
  }
};

function ResultStack(oldStr, newStr, canvases, diffTable) {
  if (canvases.reverseDiffCanvas) this.stack = new AdvancedResultStack(oldStr, newStr, canvases, diffTable);
  else this.stack = new BasicResultStack(oldStr, newStr, canvases.diffCanvas, diffTable);
}
ResultStack.prototype = {
  "constructor": ResultStack,
  "push": function() {
    return this.stack.push();
  },
  "pop": function() {
    return this.stack.pop();
  },
  "clear": function() {
    this.stack.clear();
  }
};

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
    exports['ResultStack'] = factory();
  else
    root['ResultStack'] = factory();
})(this, function factory() {
  return ResultStack;
});
