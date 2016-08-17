var Step = require('./Step.js');
var DiffType = Step.Diff.DiffType;
var TableChange = Step.TableChange;
var OffsetTable = require('./OffsetTable.js');
var OffsetArr = OffsetTable.OffsetArr;

var FORWARD_ROW = 0;
var REVERSE_ROW = 1;

var DiffAlgorithm = {
  "basic": {
    "getResult": function(before, after) {
      var self = DiffAlgorithm.basic;
      var info = self.basicInfo(before, after);
      info.result.push( new Step( Step.type.editPath, self.getEditPathWithDMax(before, after, info.DMax) ) );
      return info.result;
    },
    "getEditPath": function(before, after) {
      var self = DiffAlgorithm.basic;      
      return self.getEditPathWithDMax(before, after, self.basicInfo(before, after).DMax);
    },
    "basicInfo": function(before, after) {
      var beforeLength = before.length,
          afterLength = after.length,
          result = [],
          oneStep = null;
      if (beforeLength == 0) {
        for (var i = 0; i < afterLength; ++i) {
          oneStep = new Step(Step.type.diff, {
            "x": 0,
            "y": i,
            "diffType": DiffType.added,
            "d": i + 1
          });
          result.push(oneStep);
        }
        return {
          "result": result,
          "DMax": afterLength
        };
      } else if (afterLength == 0) {
        for (var i = 0; i < beforeLength; ++i) {
          oneStep = new Step(Step.type.diff, {
            "x": i,
            "y": 0,
            "diffType": DiffType.removed,
            "d": i + 1
          });
          result.push(oneStep);
        }
        return {
          "result": result,
          "DMax": beforeLength
        };
      }
      var DMax = beforeLength + afterLength,
          kStartOffset = 0,
          kEndOffset = 0,
          DPathX = new OffsetArr(DMax, -1);
      DPathX.set(1, 0);
      for (var D = 0; D <= DMax; ++D) {
        for (var k = -D + kStartOffset; k <= D - kEndOffset; k += 2) {
          var newX = null,
              removed = false;
          if (k == -D || (k != D && DPathX.at(k - 1) < DPathX.at(k + 1))) {
            newX = DPathX.at(k + 1);
            if (D) {
              oneStep = new Step(Step.type.diff, {
                "x": newX,            // oldX
                "y": newX - k - 1,    // oldY = newY - 1
                "diffType": DiffType.added,
                "d": D
              });
              result.push(oneStep);
            }
          } else {
            newX = DPathX.at(k - 1) + 1;
            removed = true;
            oneStep = new Step(Step.type.diff, {
              "x": newX - 1,        // oldX = newX - 1
              "y": newX - k,        // oldY
              "diffType": DiffType.removed,
              "d": D
            });
            result.push(oneStep);
          }
          var newY = newX - k;
          
          if (D) {
            var changes = [{
                  "row": FORWARD_ROW,
                  "col": k,
                  "value": newX,
                  "class": [ TableChange.class.selected ]
                }];
            if (k != -D) {
              changes.push({
                  "row": FORWARD_ROW,
                  "col": k - 1,
                  "class": [ TableChange.class.choice ].concat(removed ? [ TableChange.class.selected ] : [])
              });
            }
            if (k != D) {
              changes.push({
                  "row": FORWARD_ROW,
                  "col": k + 1,
                  "class": [ TableChange.class.choice ].concat(removed ? [] : [ TableChange.class.selected ])
              });
            }
            oneStep.addTableChange(changes);
          }
          
          while (newX < beforeLength && newY < afterLength && before[newX] == after[newY]) {
            var tableParam = {
                "row": FORWARD_ROW,
                "col": k,
                "value": newX + 1,
                "class": [ TableChange.class.selected ]
              };
            oneStep = new Step(Step.type.diff, {
              "x": newX,      // oldX
              "y": newY,      // oldY
              "diffType": DiffType.common,
              "d": D, 
              "tableParam": tableParam
            });
            result.push(oneStep);
            ++newX, ++newY;
          }
          if (newX > beforeLength) {
            kEndOffset += 2;
          } else if (newY > afterLength) {
            kStartOffset += 2;
          } else if (newX == beforeLength && newY == afterLength) {
            return {
              "result": result,
              "DMax": D
            };
          }
          DPathX.set(k, newX);
        }
      }
      throw new Error("Max D not found");
    },
    "getEditPathWithDMax": function(before, after, DMax) {
      var beforeLength = before.length,
          afterLength = after.length,
          editPath = [],
          oneStep = null;
      if (beforeLength == 0) {
        for (var i = 0; i < afterLength; ++i) {
          oneStep = new Step(Step.type.diff, {
            "x": 0,
            "y": i,
            "diffType": DiffType.added,
            "d": -1
          });
          editPath.push(oneStep);
        }
        return editPath;
      } else if (afterLength == 0) {
        for (var i = 0; i < beforeLength; ++i) {
          oneStep = new Step(Step.type.diff, {
            "x": i,
            "y": 0,
            "diffType": DiffType.removed,
            "d": -1
          });
          editPath.push(oneStep);
        }
        return editPath;
      }
      var kStartOffset = 0,
          kEndOffset = 0,
          DPathXTable = new OffsetTable(DMax, DMax, -1);

      DPathXTable.set(-1, 1, 0);
      for (var D = 0; D <= DMax; ++D) {
        for (var k = -D + kStartOffset; k <= D - kEndOffset; k += 2) {
          var newX = null;
          if (k == -D || (k != D && DPathXTable.at(D - 1, k - 1) < DPathXTable.at(D - 1, k + 1))) {
            newX = DPathXTable.at(D - 1, k + 1);
          } else {
            newX = DPathXTable.at(D - 1, k - 1) + 1;
          }
          var newY = newX - k;
          
          while (newX < beforeLength && newY < afterLength && before[newX] == after[newY]) {
            ++newX, ++newY;
          }
          if (newX > beforeLength) kEndOffset += 2;
          else if (newY > afterLength) kStartOffset += 2;
          else if (newX == beforeLength && newY == afterLength) {

            var rightward = false, downward = false;
            for (var index = DMax; index >= 0; --index) {
              newY = newX - k;
              while (0 < newX && 0 < newY && before[newX - 1] == after[newY - 1]) {
                if (index) {
                  rightward = (-DMax <= k - 1 && DPathXTable.at(index - 1, k - 1) + 1 == newX);
                  downward = (k + 1 <= DMax && DPathXTable.at(index - 1, k + 1) == newX);
                  if (rightward || downward) break;
                }
                --newX, --newY;
                oneStep = new Step(Step.type.diff, {
                  "x": newX,
                  "y": newY,
                  "diffType": DiffType.common,
                  "d": -1
                });
                editPath.push(oneStep);
              }
              if (index == 0) break;
              rightward = -DMax <= k - 1 && DPathXTable.at(index - 1, k - 1) + 1 == newX;
              downward = k + 1 <= DMax && DPathXTable.at(index - 1, k + 1) == newX;
              if (downward) {
                ++k;
                oneStep = new Step(Step.type.diff, {
                  "x": newX,
                  "y": newX - k,
                  "diffType": DiffType.added,
                  "d": -1
                });
                editPath.push(oneStep);
              } else if (rightward) {
                --k, --newX;
                oneStep = new Step(Step.type.diff, {
                  "x": newX,
                  "y": newX - k,
                  "diffType": DiffType.removed,
                  "d": -1
                });
                editPath.push(oneStep);
              }
            }
            editPath.reverse();
            return editPath;
          }
          DPathXTable.set(D, k, newX);
        }
      }
      throw new Error("Max D not found");
    }
  },
  "advanced": {
    "getResult": function(before, after) {
      var self = DiffAlgorithm.advanced;
      var ret = [],
          range = {
            "before": {
              "begin": 0,
              "end": before.length
            },
            "after": {
              "begin": 0,
              "end": after.length
            }
          };
      self.addResultTo(ret, range, before, after);
      return ret;
    },
    "addResultTo": function(result, range, before, after) {
      var self = DiffAlgorithm.advanced;
      var initChanges = [{
          "row": FORWARD_ROW,
          "col": 0,
          "value": 0
        }, {
          "row": FORWARD_ROW,
          "col": 1,
          "value": 0
        }, {
          "row": REVERSE_ROW,
          "col": 0,
          "value": 0
        }, {
          "row": REVERSE_ROW,
          "col": 1,
          "value": 0
        }];
      var tableParam = {
          "d": before.length + after.length,
          "after": initChanges
        };
      var oneStep = new Step(Step.type.scene, {
        "range": range,
        "before": before,
        "after": after,
        "tableParam": tableParam
      });
      result.push(oneStep);
      return self.addDiffsTo(result, range, before, after);
    },

    "addDiffsTo": function(result, range, before, after) {
      var self = DiffAlgorithm.advanced;
      var beforeLength = before.length,
          afterLength = after.length,
          oneStep = null,
          globalDiffParam = null;

        // simple cases
      if (beforeLength == 0) {
          if (afterLength) {             // before = '', after = '^$#!$#@#@'
            for (var i = 0; i < afterLength; ++i) {
              globalDiffParam = {
                  "x": range.before.begin + 0,
                  "y": range.after.begin + i,
                  "diffType": DiffType.added,
                  "d": -1
                };
              oneStep = new Step(Step.type.diff, {
                  "x": 0,
                  "y": i,
                  "diffType": DiffType.added,
                  "d": i + 1,
                  "globalRange": range,
                  "globalDiffParam": globalDiffParam
                });
              result.push(oneStep);
            }
          }
          return result;
      } else if (afterLength == 0) {      // before = '^$#!$#@#@', after = ''
          for (var i = 0; i < beforeLength; ++i) {
            globalDiffParam = {
                "x": range.before.begin + i,
                "y": range.after.begin + 0,
                "diffType": DiffType.removed,
                "d": -1
              };
            oneStep = new Step(Step.type.diff, {
                "x": i,
                "y": 0,
                "diffType": DiffType.removed,
                "d": i + 1,
                "globalRange": range,
                "globalDiffParam": globalDiffParam
              });
            result.push(oneStep);
          }
          return result;
      } else if (beforeLength == afterLength && beforeLength == 1) {     // before = 'a', after = 'b'
          if (before[0] == after[0]) {    // before = 'a', after = 'a'
            globalDiffParam = {
                "x": range.before.begin + 0,
                "y": range.after.begin + 0,
                "diffType": DiffType.removed,
                "d": -1
              };
            oneStep = new Step(Step.type.diff, {
                "x": 0,
                "y": 0,
                "diffType": DiffType.common,
                "d": 0,
                "globalRange": range,
                "globalDiffParam": globalDiffParam
              });
            result.push(oneStep);
          } else {                        // before = 'a', after = 'b'
              // removed
            globalDiffParam = {
                "x": range.before.begin + 0,
                "y": range.after.begin + 0,
                "diffType": DiffType.removed,
                "d": -1
              };
            oneStep = new Step(Step.type.diff, {
                "x": 0,
                "y": 0,
                "diffType": DiffType.removed,
                "d": 1,
                "globalRange": range,
                "globalDiffParam": globalDiffParam
              });
            result.push(oneStep);

              // added
            globalDiffParam = {
                "x": range.before.begin + 1,
                "y": range.after.begin + 0,
                "diffType": DiffType.added,
                "d": -1
              };
            oneStep = new Step(Step.type.diff, {
                "x": 1,
                "y": 0,
                "diffType": DiffType.added,
                "d": 1,
                "globalRange": range,
                "globalDiffParam": globalDiffParam
              });
            result.push(oneStep);
          }
          return result;
      } else if (before == after) {
          for (var i = 0; i < beforeLength; ++i) {
            globalDiffParam = {
                "x": range.before.begin + i,
                "y": range.after.begin + i,
                "diffType": DiffType.common,
                "d": -1
              };
            oneStep = new Step(Step.type.diff, {
                "x": i,
                "y": i,
                "diffType": DiffType.common,
                "d": 0,
                "globalRange": range,
                "globalDiffParam": globalDiffParam
              });
            result.push(oneStep);
          }
          return result;
      }
      var prefixLen = self.hasCommonPrefix(before, after);
      if (prefixLen) {
        var commonRange = {
          "before": {
            "begin": range.before.begin + prefixLen,
            "end": range.before.end
          },
          "after": {
            "begin": range.after.begin + prefixLen,
            "end": range.after.end
          }
        };
        var commonPart = self.addResultTo(result, commonRange, before.substring(0, prefixLen), after.substring(0, prefixLen));

        var distinctRange = {
          "before": {
            "begin": range.before.begin + prefixLen,
            "end": range.before.end
          },
          "after": {
            "begin": range.after.begin + prefixLen,
            "end": range.after.end
          }
        };
        var distinctPart = self.addResultTo(result, distinctRange, before.substring(prefixLen), after.substring(prefixLen));

        return result;
      }

      var suffixLen = self.hasCommonSuffix(before, after);
      if (suffixLen) {
        var distinctRange = {
          "before": {
            "begin": range.before.begin,
            "end": range.before.end - suffixLen
          },
          "after": {
            "begin": range.after.begin,
            "end": range.after.end - suffixLen
          }
        };
        var distinctPart = self.addResultTo(result, distinctRange, before.substring(0, beforeLength - suffixLen), after.substring(0, afterLength - suffixLen));
        
        var commonRange = {
          "before": {
            "begin": range.before.end - suffixLen,
            "end": range.before.end
          },
          "after": {
            "begin": range.after.end - suffixLen,
            "end": range.after.end
          }
        };
        var commonPart = self.addResultTo(result, commonRange, before.substring(beforeLength - suffixLen), after.substring(afterLength - suffixLen));

        return result;
      }

      var delta = beforeLength - afterLength,
          DoubleDMax = beforeLength + afterLength,
          forwardCheck = delta & 1,
          DMax = (DoubleDMax + 1) / 2,
          kForwardStartOffset = 0, kForwardEndOffset = 0,
          kReverseStartOffset = 0, kReverseEndOffset = 0,
          DPathXTable = new OffsetTable(1, DoubleDMax, -1);

      DPathXTable.set(FORWARD_ROW, 1, 0), DPathXTable.set(REVERSE_ROW, 1, 0);
      for (var D = 0; D < DMax; ++D) {
        for (var k = -D + kForwardStartOffset; k <= D - kForwardEndOffset; k += 2) {
          var newX = null,
              removed = false;
          if (k == -D || (k != D && DPathXTable.at(FORWARD_ROW, k - 1) < DPathXTable.at(FORWARD_ROW, k + 1))) {
            newX = DPathXTable.at(FORWARD_ROW, k + 1);
            if (D) {
              oneStep = new Step(Step.type.diff, {
                "x": newX,            // oldX
                "y": newX - k - 1,    // oldY = newY - 1
                "diffType": DiffType.added,
                "d": D
              });
              result.push(oneStep);
            }
          } else {
            newX = DPathXTable.at(FORWARD_ROW, k - 1) + 1;
            removed = true;
            oneStep = new Step(Step.type.diff, {
              "x": newX - 1,        // oldX = newX - 1
              "y": newX - k,        // oldY
              "diffType": DiffType.removed,
              "d": D
            });
            result.push(oneStep);
          }
          var newY = newX - k;

            // add table changes to the step
          if (D) {
            var changes = [{
                  "row": FORWARD_ROW,
                  "col": k,
                  "value": newX,
                  "class": [ TableChange.class.selected ]
                }];
            if (k != -D) {
              changes.push({
                  "row": FORWARD_ROW,
                  "col": k - 1,
                  "class": [ TableChange.class.choice ].concat(removed ? [ TableChange.class.selected ] : [])
              });
            }
            if (k != D) {
              changes.push({
                  "row": FORWARD_ROW,
                  "col": k + 1,
                  "class": [ TableChange.class.choice ].concat(removed ? [] : [ TableChange.class.selected ])
              });
            }
            oneStep.addTableChange(changes);
          }

          while (newX < beforeLength && newY < afterLength && before[newX] == after[newY]) {
            var tableParam = {
                "row": FORWARD_ROW,
                "col": k,
                "value": newX + 1,
                "class": [ TableChange.class.selected ]
              };
            oneStep = new Step(Step.type.diff, {
              "x": newX,      // oldX
              "y": newY,      // oldY
              "diffType": DiffType.common,
              "d": D, 
              "tableParam": tableParam
            });
            result.push(oneStep);
            ++newX, ++newY;

          }
          
          if (newX > beforeLength) {
            kForwardEndOffset += 2;
          } else if (newY > afterLength) {
            kForwardStartOffset += 2;
          }

          var reverseK = delta - k;
                              
             // whether to check collison in the forward part    // reverseK should be within [-DoubleDMax, DoubleDMax]  
          if (forwardCheck && (reverseK < 0 ? -reverseK : reverseK) <= DoubleDMax
            && -1 != DPathXTable.at(REVERSE_ROW, reverseK)) {  // there is logged a D-path on reverseK
            var forwardX = beforeLength - DPathXTable.at(REVERSE_ROW, reverseK);  // map the x value of previously-logged D-path to forward
            
            if (newX >= forwardX) {
              DPathXTable = null;
              var firstRange = {
                  "before": {
                    "begin": range.before.begin,
                    "end": range.before.begin + newX
                  },
                  "after": {
                    "begin": range.after.begin,
                    "end": range.after.begin + newY
                  }
                };
              var firstPart = self.addResultTo(result, firstRange, before.substring(0, newX), after.substring(0, newY));

              var secondRange = {
                "before": {
                  "begin": range.before.begin + newX,
                  "end": range.before.end
                },
                "after": {
                  "begin": range.after.begin + newY,
                  "end": range.after.end
                }
              };
              var secondPart = self.addResultTo(result, secondRange, before.substring(newX), after.substring(newY));
              return result;
            }
          }
          DPathXTable.set(FORWARD_ROW, k, newX);
        }


        for (var k = -D + kReverseStartOffset; k <= D - kReverseEndOffset; k += 2) {
          var newX = null,
              removed = false;
          if (k == -D || (k != D && DPathXTable.at(REVERSE_ROW, k - 1) < DPathXTable.at(REVERSE_ROW, k + 1))) {
            newX = DPathXTable.at(REVERSE_ROW, k + 1);
            if (D) {
              oneStep = new Step(Step.type.diff, {
                "x": beforeLength - newX,       // in reverse canvas, (newX, newX - k) is the end point,
                "y": afterLength - (newX - k),  // and thus it will become the start point when mapped to forward
                "diffType": DiffType.added,
                "d": D,
                "reverse": true
              });
              result.push(oneStep);
            }
          } else {
            newX = DPathXTable.at(REVERSE_ROW, k - 1) + 1;
            removed = true;
            oneStep = new Step(Step.type.diff, {
              "x": beforeLength - newX,       // in reverse canvas, (newX, newX - k) is the end point,
              "y": afterLength - (newX - k),  // and thus it will become the start point when mapped to forward
              "diffType": DiffType.removed,
              "d": D,
              "reverse": true
            });
            result.push(oneStep);
          }
          var newY = newX - k;

            // add table changes to the step
          if (D) {
            var changes = [{
                  "row": REVERSE_ROW,
                  "col": k,
                  "value": newX,
                  "class": [ TableChange.class.selected ]
                }];
            if (k != -D) {
              changes.push({
                  "row": REVERSE_ROW,
                  "col": k - 1,
                  "class": [ TableChange.class.choice ].concat(removed ? [ TableChange.class.selected ] : [])
              });
            }
            if (k != D) {
              changes.push({
                  "row": REVERSE_ROW,
                  "col": k + 1,
                  "class": [ TableChange.class.choice ].concat(removed ? [] : [ TableChange.class.selected ])
              });
            }
            oneStep.addTableChange(changes);
          }

          while (newX < beforeLength && newY < afterLength && before[beforeLength - newX - 1] == after[afterLength - newY - 1]) {
            var tableParam = {
                "row": REVERSE_ROW,
                "col": k,
                "value": newX + 1,
                "class": [ TableChange.class.selected ]
              };
            oneStep = new Step(Step.type.diff, {
              "x": beforeLength - (newX + 1),
              "y": afterLength - (newY + 1),
              "diffType": DiffType.common,
              "d": D,
              "reverse": true,
              "tableParam": tableParam
            });
            result.push(oneStep);

            ++newX, ++newY;
          }
          if (newX > beforeLength) {
            kReverseEndOffset += 2;
          } else if (newY > afterLength) {
            kReverseStartOffset += 2;
          }

          var forwardK = delta - k;
           // whether to check collison in the reverse part    // forwardK should be within [-DoubleDMax, DoubleDMax]  
          if (!forwardCheck && ((forwardK < 0) ? -forwardK : forwardK) <= DoubleDMax
            && -1 != DPathXTable.at(FORWARD_ROW, forwardK)) {  // there is logged a D-path on forwardK
            var forwardX = DPathXTable.at(FORWARD_ROW, forwardK);
            var reverseX = beforeLength - forwardX;  // map the x value of previously-logged D-path to reverse

            if (newX >= reverseX) {
              var forwardY = forwardX - forwardK;
              DPathXTable = null;
              var firstRange = {
                  "before": {
                    "begin": range.before.begin,
                    "end": range.before.begin + forwardX
                  },
                  "after": {
                    "begin": range.after.begin,
                    "end": range.after.begin + forwardY
                  }
                };
              var firstPart = self.addResultTo(result, firstRange, before.substring(0, forwardX), after.substring(0, forwardY));
              var secondRange = {
                  "before": {
                    "begin": range.before.begin + forwardX,
                    "end": range.before.end
                  },
                  "after": {
                    "begin": range.after.begin + forwardY,
                    "end": range.after.end
                  }
                };
              var secondPart = self.addResultTo(result, secondRange, before.substring(forwardX), after.substring(forwardY));
              return result;
            }
          }
          DPathXTable.set(REVERSE_ROW, k, newX);
        }
      }
      DPathXTable = null;
      var i = 0;
      for (; i < beforeLength; ++i) {
        globalDiffParam = {
            "x": range.before.begin + i,
            "y": range.after.begin + 0,
            "diffType": DiffType.removed,
            "d": -1
          };
        oneStep = new Step(Step.type.diff, {
            "x": i,
            "y": 0,
            "diffType": DiffType.removed,
            "d": i + 1,
            "globalRange": range,
            "globalDiffParam": globalDiffParam
          });
        result.push(oneStep);
      }
      for (var j = 0; j < afterLength; ++j) {
        globalDiffParam = {
            "x": range.before.begin + i,
            "y": range.after.begin + j,
            "diffType": DiffType.added,
            "d": -1
          };
        oneStep = new Step(Step.type.diff, {
            "x": i,
            "y": j,
            "diffType": DiffType.added,
            "d": i + j,
            "globalRange": range,
            "globalDiffParam": globalDiffParam
          });
        result.push(oneStep);
      }
      return result;
    },
    "hasCommonPrefix": function(a, b) {
      var length = (a.length < b.length) ? a.length : b.length;
      for (var i = 0; i < length; ++i) {
        if (a[i] != b[i]) return i;
      }
      return a.length != b.length && length;
    },
    "hasCommonSuffix": function(a, b) {
      var length = (a.length < b.length) ? a.length : b.length;
      for (var i = a.length - 1, j = b.length - 1; i >= 0 && j >= 0; --i, --j) {
        if (a[i] != b[j]) return a.length - i - 1;
      }
      return a.length != b.length && length;
    }
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
    exports['DiffAlgorithm'] = factory();
  else
    root['DiffAlgorithm'] = factory();
})(this, function factory() {
  return DiffAlgorithm;
});
