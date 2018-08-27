/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="../Model/Node.ts"/>
///<reference path="TreeController.ts"/>
///<reference path="UserActionController.ts"/>
///<reference path="../Utils/Constants.ts"/>
var GTE;
(function (GTE) {
    /** A class for controlling the input of the application. If there is a confusion over the functionality of each button
     * you can check the attachHandlersToKeysMethod*/
    var KeyboardController = /** @class */ (function () {
        function KeyboardController(game, userActionController) {
            this.game = game;
            this.userActionController = userActionController;
            this.playersKeys = [];
            this.addKeys();
            this.attachHandlersToKeys();
            // this.deselectNodesHandler();
        }
        /**Assigning all keys to the corresponding properties in the class*/
        KeyboardController.prototype.addKeys = function () {
            var _this = this;
            this.shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
            this.controlKey = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
            this.altKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ALT);
            this.nKey = this.game.input.keyboard.addKey(Phaser.Keyboard.N);
            this.zeroKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO);
            this.iKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
            this.testButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.zKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
            this.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
            this.uKey = this.game.input.keyboard.addKey(Phaser.Keyboard.U);
            this.cKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
            this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
            this.tabKey = this.game.input.keyboard.addKey(Phaser.Keyboard.TAB);
            this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.escapeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            var keys = [Phaser.Keyboard.ONE, Phaser.Keyboard.TWO, Phaser.Keyboard.THREE, Phaser.Keyboard.FOUR];
            keys.forEach(function (k) {
                _this.playersKeys.push(_this.game.input.keyboard.addKey(k));
            });
            this.deleteKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DELETE);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.C);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.N);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.I);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.Z);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.D);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.U);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.S);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.ZERO);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.ONE);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.TWO);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.THREE);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.FOUR);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.SPACEBAR);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.CONTROL);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.SHIFT);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.ALT);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.DELETE);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.UP);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.DOWN);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.LEFT);
            this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.RIGHT);
        };
        /**A method which assigns action to each key via the UserActionController*/
        KeyboardController.prototype.attachHandlersToKeys = function () {
            var _this = this;
            // Children and new file
            this.nKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    if (!_this.controlKey.isDown && !_this.altKey.isDown) {
                        _this.userActionController.addNodesHandler();
                    }
                    else if (!_this.controlKey.isDown && _this.altKey.isDown) {
                        _this.userActionController.createNewTree();
                    }
                }
            });
            // Delete nodes
            this.deleteKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    _this.userActionController.deleteNodeHandler();
                }
            });
            this.dKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    _this.userActionController.deleteNodeHandler();
                }
            });
            // Assigning players
            this.playersKeys.forEach(function (k) {
                if (!_this.userActionController.treeController.labelInput.active) {
                    var playerID_1 = _this.playersKeys.indexOf(k) + 1;
                    k.onDown.add(function () {
                        _this.userActionController.assignPlayerToNodeHandler(playerID_1);
                    });
                }
            });
            this.zeroKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    _this.userActionController.assignChancePlayerToNodeHandler();
                }
            });
            // Create an information set
            this.iKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    if (!_this.controlKey.isDown && !_this.altKey.isDown) {
                        _this.userActionController.createISetHandler();
                    }
                    else if (!_this.controlKey.isDown && _this.altKey.isDown) {
                        _this.userActionController.saveTreeToImage();
                    }
                }
            });
            // Undo and redo
            this.zKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    if (_this.controlKey.isDown && !_this.shiftKey.isDown) {
                        _this.userActionController.undoRedoHandler(true);
                    }
                    if (_this.controlKey.isDown && _this.shiftKey.isDown) {
                        _this.userActionController.undoRedoHandler(false);
                    }
                }
            });
            // Remove information set
            this.uKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    _this.userActionController.removeISetsByNodesHandler();
                }
            });
            // Cut information set
            this.cKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    var distinctISetsSelected = _this.userActionController.treeController.getDistinctISetsFromNodes(_this.userActionController.selectedNodes);
                    if (distinctISetsSelected.length === 1) {
                        _this.userActionController.initiateCutSpriteHandler(_this.userActionController.treeController.treeView.findISetView(distinctISetsSelected[0]));
                    }
                }
            });
            // Change to the next label
            this.tabKey.onDown.add(function () {
                if (_this.userActionController.treeController.labelInput.active) {
                    if (_this.shiftKey.isDown) {
                        _this.userActionController.activateLabelField(false);
                    }
                    else {
                        _this.userActionController.activateLabelField(true);
                    }
                }
            });
            // Enter value in label
            this.enterKey.onDown.add(function () {
                if (_this.userActionController.treeController.labelInput.active) {
                    _this.userActionController.changeLabel();
                }
            });
            // Exit label
            this.escapeKey.onDown.add(function () {
                if (_this.userActionController.treeController.labelInput.active) {
                    _this.userActionController.hideInputLabel();
                }
            });
            // Save to File
            this.sKey.onDown.add(function () {
                if (!_this.controlKey.isDown && _this.altKey.isDown) {
                    _this.userActionController.saveTreeToFile();
                }
            });
            // Arrow Keys Moving nodes
            this.upKey.onUp.add(function () {
                _this.userActionController.undoRedoController.saveNewTree(true);
            });
            this.downKey.onUp.add(function () {
                _this.userActionController.undoRedoController.saveNewTree(true);
            });
            this.leftKey.onUp.add(function () {
                _this.userActionController.undoRedoController.saveNewTree(true);
            });
            this.rightKey.onUp.add(function () {
                _this.userActionController.undoRedoController.saveNewTree(true);
            });
            this.upKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    var verticalDistance = _this.userActionController.treeController.treeViewProperties.levelHeight * GTE.NODES_VERTICAL_STEP_POSITIONING;
                    if (!_this.controlKey.isDown) {
                        _this.userActionController.moveNodeManually(0, -1, verticalDistance);
                    }
                }
            });
            this.downKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    var verticalDistance = _this.userActionController.treeController.treeViewProperties.levelHeight * GTE.NODES_VERTICAL_STEP_POSITIONING;
                    if (!_this.controlKey.isDown) {
                        _this.userActionController.moveNodeManually(0, 1, verticalDistance);
                    }
                }
            });
            this.leftKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    var horizontalDistance = _this.userActionController.treeController.treeViewProperties.treeWidth / _this.userActionController.treeController.tree.getLeaves().length * GTE.NODES_HORIZONTAL_STEP_POSITIONING;
                    if (!_this.controlKey.isDown) {
                        _this.userActionController.moveNodeManually(-1, 0, horizontalDistance);
                    }
                }
            });
            this.rightKey.onDown.add(function () {
                if (!_this.userActionController.treeController.labelInput.active) {
                    var horizontalDistance = _this.userActionController.treeController.treeViewProperties.treeWidth / _this.userActionController.treeController.tree.getLeaves().length * GTE.NODES_HORIZONTAL_STEP_POSITIONING;
                    if (!_this.controlKey.isDown) {
                        _this.userActionController.moveNodeManually(1, 0, horizontalDistance);
                    }
                }
            });
            this.upKey.onHoldCallback = function () {
                if (this.controlKey.isDown && !this.userActionController.treeController.labelInput.active) {
                    this.userActionController.moveNodeManually(0, -1, 1);
                }
            };
            this.downKey.onHoldCallback = function () {
                if (this.controlKey.isDown && !this.userActionController.treeController.labelInput.active) {
                    this.userActionController.moveNodeManually(0, 1, 1);
                }
            };
            this.leftKey.onHoldCallback = function () {
                if (this.controlKey.isDown && !this.userActionController.treeController.labelInput.active) {
                    this.userActionController.moveNodeManually(-1, 0, 1);
                }
            };
            this.rightKey.onHoldCallback = function () {
                if (this.controlKey.isDown && !this.userActionController.treeController.labelInput.active) {
                    this.userActionController.moveNodeManually(1, 0, 1);
                }
            };
            this.upKey.onHoldContext = this;
            this.downKey.onHoldContext = this;
            this.leftKey.onHoldContext = this;
            this.rightKey.onHoldContext = this;
            this.testButton.onDown.add(function () {
            });
        };
        return KeyboardController;
    }());
    GTE.KeyboardController = KeyboardController;
})(GTE || (GTE = {}));
//# sourceMappingURL=KeyboardController.js.map