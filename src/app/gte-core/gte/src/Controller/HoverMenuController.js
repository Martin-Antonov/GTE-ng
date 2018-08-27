/// <reference path = "../../lib/phaser.d.ts"/>"/>
///<reference path="../Controller/UserActionController.ts"/>
///<reference path="../View/NodeView.ts"/>
///<reference path="../View/ISetView.ts"/>
///<reference path="../Utils/HoverButton.ts"/>
var GTE;
(function (GTE) {
    var HoverMenuController = /** @class */ (function () {
        function HoverMenuController(game, userActionController) {
            var _this = this;
            this.game = game;
            this.userActionController = userActionController;
            this.buttonsGroup = this.game.add.group();
            this.buttonsGroup.name = "hoverMenu";
            this.createButtonSprites();
            this.setButtonFunctionality();
            this.buttonWidth = this.plusButton.width;
            var nodeWidth = this.userActionController.treeController.treeView.nodes[0].width;
            this.repositionButtonSprites(nodeWidth);
            this.menuTween = this.game.add.tween(this.buttonsGroup);
            this.hideMenu();
            // If a node or an iSet is hovered, we start the hover menu.
            this.userActionController.treeController.hoverSignal.add(function () {
                this.triggerMenu(arguments[0]);
            }, this);
            // Whenever a key on the keyobard is pressed, we remove the menu
            this.game.input.keyboard.onDownCallback = function () {
                _this.hideMenu();
            };
            // Remove the menu, whenever someone clicks on the background (on anything without an active input)
            this.userActionController.backgroundInputSprite.events.onInputDown.add(function () {
                _this.hideMenu();
            });
            // If clicking on the top menu, hide the hover menu
            setTimeout(function () {
                $("#top-container").on("click", function () {
                    _this.hideMenu();
                });
            }, 300);
            this.selectedNodesSprites = this.userActionController.selectedNodes;
        }
        HoverMenuController.prototype.createButtonSprites = function () {
            this.plusButton = new GTE.HoverButton(this.game, this.buttonsGroup, "plus", GTE.PLUS_BUTTON_COLOR);
            this.minusButton = new GTE.HoverButton(this.game, this.buttonsGroup, "minus", GTE.MINUS_BUTTON_COLOR);
            this.linkButton = new GTE.HoverButton(this.game, this.buttonsGroup, "link", GTE.LINK_BUTTON_COLOR);
            this.unlinkButton = new GTE.HoverButton(this.game, this.buttonsGroup, "unlink", GTE.UNLINK_BUTTON_COLOR);
            this.cutButton = new GTE.HoverButton(this.game, this.buttonsGroup, "scissors", GTE.CUT_BUTTON_COLOR);
            this.player1Button = new GTE.HoverButton(this.game, this.buttonsGroup, "player", GTE.PLAYER_BUTTON_COLOR, GTE.PLAYER_COLORS[0]);
            this.player2Button = new GTE.HoverButton(this.game, this.buttonsGroup, "player", GTE.PLAYER_BUTTON_COLOR, GTE.PLAYER_COLORS[1]);
            this.player3Button = new GTE.HoverButton(this.game, this.buttonsGroup, "player", GTE.PLAYER_BUTTON_COLOR, GTE.PLAYER_COLORS[2]);
            this.player4Button = new GTE.HoverButton(this.game, this.buttonsGroup, "player", GTE.PLAYER_BUTTON_COLOR, GTE.PLAYER_COLORS[3]);
            this.chancePlayerButton = new GTE.HoverButton(this.game, this.buttonsGroup, "chance", GTE.PLAYER_BUTTON_COLOR, 0x111111);
            this.buttonsArray = [this.plusButton, this.minusButton, this.linkButton, this.unlinkButton,
                this.cutButton, this.player1Button, this.player2Button, this.player3Button, this.player4Button, this.chancePlayerButton];
        };
        HoverMenuController.prototype.repositionButtonSprites = function (nodeWidth) {
            var buttonsScale = nodeWidth * 0.001;
            this.buttonsGroup.scale.set(buttonsScale);
            this.plusButton.position.set(-0.5 * this.buttonWidth, 0);
            this.minusButton.position.set(0.5 * this.buttonWidth, 0);
            this.repositionPlayerButtonSprites();
            this.unlinkButton.position.set(0, 2 * this.buttonWidth);
            this.linkButton.position.set(-this.buttonWidth, 2 * this.buttonWidth);
            this.cutButton.position.set(this.buttonWidth, 2 * this.buttonWidth);
        };
        HoverMenuController.prototype.repositionPlayerButtonSprites = function () {
            var playersCount = this.userActionController.treeController.tree.players.length;
            this.player1Button.position.set(-0.5 * (playersCount - 1) * this.buttonWidth, this.buttonWidth);
            this.player2Button.position.set(-0.5 * (playersCount - 3) * this.buttonWidth, this.buttonWidth);
            this.player3Button.position.set(0.5 * (5 - playersCount) * this.buttonWidth, this.buttonWidth);
            this.player4Button.position.set(this.buttonWidth, this.buttonWidth);
            this.chancePlayerButton.position.set(0.5 * (playersCount - 1) * this.buttonWidth, this.buttonWidth);
        };
        HoverMenuController.prototype.setButtonFunctionality = function () {
            var _this = this;
            // Add node button functionality
            this.plusButton.events.onInputDown.add(function () {
                if (_this.buttonsGroup.alpha === 1) {
                    if (_this.previouslyHoveredSprite instanceof GTE.NodeView && _this.selectedNodesSprites.length !== 0) {
                        _this.userActionController.addNodesHandler();
                    }
                    else if (_this.previouslyHoveredSprite instanceof GTE.NodeView && _this.selectedNodesSprites.length === 0) {
                        _this.userActionController.addNodesHandler(_this.previouslyHoveredSprite);
                    }
                    else if (_this.previouslyHoveredSprite instanceof GTE.ISetView) {
                        //A hack in order not to break the information set.
                        _this.userActionController.emptySelectedNodes();
                        _this.userActionController.selectedNodes = _this.previouslyHoveredSprite.nodes.slice(0);
                        _this.userActionController.addNodesHandler();
                        _this.userActionController.emptySelectedNodes();
                    }
                }
            });
            // Remove node button functionality
            this.minusButton.events.onInputDown.add(function () {
                if (_this.buttonsGroup.alpha === 1) {
                    if (_this.previouslyHoveredSprite instanceof GTE.NodeView && _this.selectedNodesSprites.length !== 0) {
                        _this.userActionController.deleteNodeHandler();
                    }
                    else if (_this.previouslyHoveredSprite instanceof GTE.NodeView && _this.selectedNodesSprites.length === 0) {
                        _this.userActionController.deleteNodeHandler(_this.previouslyHoveredSprite);
                    }
                    else if (_this.previouslyHoveredSprite instanceof GTE.ISetView) {
                        var nodes = _this.previouslyHoveredSprite.nodes;
                        if (nodes[0].node.children.length > 1) {
                            var nodesToDelete_1 = [];
                            nodes.forEach(function (n) {
                                nodesToDelete_1.push(_this.userActionController.treeController.treeView.findNodeView(n.node.children[n.node.children.length - 1]));
                            });
                            // Same hack as above
                            _this.userActionController.emptySelectedNodes();
                            _this.userActionController.selectedNodes = nodesToDelete_1.slice(0);
                            _this.userActionController.deleteNodeHandler();
                            _this.userActionController.emptySelectedNodes();
                        }
                    }
                }
            });
            // Players button functionality
            var playerButtons = [];
            this.buttonsArray.forEach(function (btn) {
                if (btn.buttonKey === "player") {
                    playerButtons.push(btn);
                }
            });
            playerButtons.forEach(function (btn) {
                btn.events.onInputDown.add(function () {
                    if (_this.buttonsGroup.alpha === 1) {
                        if (_this.previouslyHoveredSprite instanceof GTE.NodeView && _this.selectedNodesSprites.length !== 0) {
                            _this.userActionController.assignPlayerToNodeHandler(playerButtons.indexOf(btn) + 1);
                        }
                        else if (_this.previouslyHoveredSprite instanceof GTE.NodeView && _this.selectedNodesSprites.length === 0) {
                            _this.userActionController.assignPlayerToNodeHandler(playerButtons.indexOf(btn) + 1, _this.previouslyHoveredSprite);
                        }
                        else if (_this.previouslyHoveredSprite instanceof GTE.ISetView) {
                            var nodes = _this.previouslyHoveredSprite.nodes;
                            nodes.forEach(function (n) {
                                _this.userActionController.assignPlayerToNodeHandler(playerButtons.indexOf(btn) + 1, n);
                            });
                        }
                    }
                });
            });
            // Chance player button functionality
            this.chancePlayerButton.events.onInputDown.add(function () {
                if (_this.buttonsGroup.alpha === 1) {
                    if (_this.previouslyHoveredSprite instanceof GTE.NodeView) {
                        _this.userActionController.assignChancePlayerToNodeHandler(_this.previouslyHoveredSprite);
                    }
                }
            });
            // Adding Information sets functionality
            this.linkButton.events.onInputDown.add(function () {
                if (_this.buttonsGroup.alpha === 1) {
                    _this.userActionController.createISetHandler();
                }
            });
            // Removing information sets functionality
            this.unlinkButton.events.onInputDown.add(function () {
                if (_this.buttonsGroup.alpha === 1) {
                    if (_this.previouslyHoveredSprite instanceof GTE.NodeView) {
                        _this.userActionController.removeISetHandler(_this.previouslyHoveredSprite.node.iSet);
                    }
                    else if (_this.previouslyHoveredSprite instanceof GTE.ISetView) {
                        _this.userActionController.removeISetHandler(_this.previouslyHoveredSprite.iSet);
                    }
                }
            });
            // Cut Sprite functionality
            this.cutButton.events.onInputDown.add(function () {
                if (_this.buttonsGroup.alpha === 1) {
                    _this.userActionController.initiateCutSpriteHandler(_this.previouslyHoveredSprite);
                }
            });
            // Clear the menu after clicking every button.
            this.buttonsArray.forEach(function (btn) {
                btn.events.onInputDown.add(function () {
                    _this.hideMenu();
                });
            });
        };
        HoverMenuController.prototype.triggerMenu = function (hoveredElement) {
            this.repositionPlayerButtonSprites();
            this.game.world.bringToTop(this.buttonsGroup);
            if (this.previouslyHoveredSprite !== hoveredElement) {
                if (this.buttonsGroup.alpha !== 0) {
                    this.hideMenu();
                    this.menuTween.stop();
                }
                this.previouslyHoveredSprite = hoveredElement;
                this.handleMenuCases(hoveredElement);
            }
        };
        HoverMenuController.prototype.handleMenuCases = function (hoveredSprite) {
            var playersCount = this.userActionController.treeController.tree.players.length;
            this.buttonsArray.forEach(function (button) { return button.setActive(); });
            if (playersCount === 3) {
                this.player3Button.setHidden();
                this.player4Button.setHidden();
            }
            if (playersCount === 4) {
                this.player4Button.setHidden();
            }
            //Case 1: The hovered sprite is a node
            if (hoveredSprite instanceof GTE.NodeView) {
                this.buttonsGroup.x = hoveredSprite.x;
                this.buttonsGroup.y = hoveredSprite.y;
                //Case 1.1: There is no multiple selection of nodes
                if (this.selectedNodesSprites.length <= 1) {
                    // If the selected node is not the hovered sprite
                    if (this.selectedNodesSprites[0] && this.selectedNodesSprites[0] !== hoveredSprite) {
                        return;
                    }
                    this.unlinkButton.setHidden();
                    this.linkButton.setHidden();
                    this.cutButton.setHidden();
                    if (hoveredSprite.node.children.length === 0) {
                        this.buttonsArray.forEach(function (btn) {
                            btn.setHidden();
                        });
                        this.plusButton.setActive();
                        this.minusButton.setActive();
                    }
                }
                //Case 1.2: If the hovered sprite is not among the selected sprites
                else if (this.selectedNodesSprites.length > 1 && this.selectedNodesSprites.indexOf(hoveredSprite) === -1) {
                    return;
                }
                //Case 1.3: If the hovered sprite is among the selected sprites
                else if (this.selectedNodesSprites.length > 1) {
                    // Check whether we can create an information set and disable the corresponding button
                    var selectedNodes_1 = [];
                    var differentISets_1 = [];
                    this.selectedNodesSprites.forEach(function (s) {
                        selectedNodes_1.push(s.node);
                        if (s.node.iSet && differentISets_1.indexOf(s.node.iSet) === -1) {
                            differentISets_1.push(s.node.iSet);
                        }
                    });
                    try {
                        this.userActionController.treeController.tree.canCreateISet(selectedNodes_1);
                    }
                    catch (err) {
                        this.linkButton.setInactive();
                    }
                    //Check whether all nodes are in different sets to disable unlink button
                    if (differentISets_1.length !== 1) {
                        this.unlinkButton.setInactive();
                        this.cutButton.setInactive();
                    }
                    else {
                        this.linkButton.setInactive();
                    }
                    // If one among the selected nodes is a leaf, disable all but the plus and minus buttons
                    for (var i = 0; i < this.selectedNodesSprites.length; i++) {
                        if (this.selectedNodesSprites[i].node.children.length === 0) {
                            this.buttonsArray.forEach(function (btn) {
                                btn.setHidden();
                            });
                            this.plusButton.setActive();
                            this.minusButton.setActive();
                            break;
                        }
                    }
                }
            }
            //Case 2: Hovered sprite is an information set
            if (hoveredSprite instanceof GTE.ISetView) {
                // this.userActionController.deselectNodesHandler();
                this.buttonsGroup.x = hoveredSprite.label.x;
                this.buttonsGroup.y = hoveredSprite.label.y;
                if (hoveredSprite.nodes[0].node.children.length <= 1) {
                    this.minusButton.setInactive();
                }
                this.linkButton.setInactive();
                this.chancePlayerButton.setInactive();
            }
            var sign = 1;
            if (hoveredSprite instanceof GTE.NodeView && hoveredSprite.node.children.length === 0) {
                sign = -1;
            }
            this.menuTween = this.game.add.tween(this.buttonsGroup).to({
                y: this.buttonsGroup.position.y + sign * 50,
                alpha: 1
            }, 300, Phaser.Easing.Default, true);
        };
        HoverMenuController.prototype.hideMenu = function () {
            this.buttonsGroup.alpha = 0;
            this.previouslyHoveredSprite = null;
            this.buttonsArray.forEach(function (btn) {
                btn.setHidden();
            });
        };
        return HoverMenuController;
    }());
    GTE.HoverMenuController = HoverMenuController;
})(GTE || (GTE = {}));
//# sourceMappingURL=HoverMenuController.js.map