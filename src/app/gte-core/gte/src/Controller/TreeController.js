/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="../../lib/jquery.d.ts"/>
///<reference path="../Model/Tree.ts"/>
///<reference path="../View/TreeView.ts"/>
///<reference path="../View/TreeViewProperties.ts"/>
///<reference path="../View/NodeView.ts"/>
///<reference path="../View/MoveView.ts"/>
///<reference path="../Utils/SelectionRectangle.ts"/>
///<reference path="../Utils/Constants.ts"/>
///<reference path="../Utils/ErrorPopUp.ts"/>
///<reference path="../View/ISetView.ts"/>
///<reference path="../Menus/LabelInput/LabelInput.ts"/>
var GTE;
(function (GTE) {
    /**A class which connects the TreeView and the Tree Model.
     * This class is used mainly through UserActionController.ts*/
    var TreeController = /** @class */ (function () {
        function TreeController(game) {
            this.labelInput = new GTE.LabelInput(this.game);
            this.game = game;
            this.setCircleBitmapData(1);
            this.nodesToDelete = [];
            this.labelInput = new GTE.LabelInput(this.game);
            this.createInitialTree();
            this.attachHandlersToNodes();
            this.hoverSignal = new Phaser.Signal();
        }
        /**A method which creates the initial 3-node tree in the scene*/
        TreeController.prototype.createInitialTree = function () {
            this.tree = new GTE.Tree();
            this.tree.addNode();
            this.tree.addPlayer(new GTE.Player(0, "chance", 0x000000));
            this.tree.addPlayer(new GTE.Player(1, "1", GTE.PLAYER_COLORS[0]));
            this.tree.addPlayer(new GTE.Player(2, "2", GTE.PLAYER_COLORS[1]));
            this.treeViewProperties = new GTE.TreeViewProperties(this.game.height * GTE.INITIAL_TREE_HEIGHT, this.game.width * GTE.INITIAL_TREE_WIDTH);
            this.treeView = new GTE.TreeView(this.game, this.tree, this.treeViewProperties);
            this.addNodeHandler([this.treeView.nodes[0]]);
            this.resetTree(true, true);
        };
        /**A method for creating the circle for the nodes.
         * This method will imitate the zoom-in/zoom-out functionality*/
        TreeController.prototype.setCircleBitmapData = function (scale) {
            this.bmd = this.game.make.bitmapData(this.game.height * GTE.NODE_RADIUS * scale, this.game.height * GTE.NODE_RADIUS * scale, "node-circle", true);
            this.bmd.ctx.fillStyle = "#ffffff";
            this.bmd.ctx.beginPath();
            this.bmd.ctx.arc(this.bmd.width / 2, this.bmd.width / 2, this.bmd.width * 0.45, 0, Math.PI * 2);
            this.bmd.ctx.fill();
        };
        //region Input Handlers and Signals
        /**Attaching listeners, that will listen for specific actions from the user*/
        TreeController.prototype.attachHandlersToNodes = function () {
            var _this = this;
            this.treeView.nodes.forEach(function (n) {
                _this.attachHandlersToNode(n);
            });
        };
        /** The node specific method for attaching handlers
         * Also when we add node we attach the handler for the parent move label*/
        TreeController.prototype.attachHandlersToNode = function (n) {
            var _this = this;
            n.events.onInputOver.add(function () {
                _this.handleInputOverNode(n);
            });
            n.events.onInputDown.add(function () {
                _this.handleInputDownNode(n);
            });
            n.events.onInputOut.add(function () {
                _this.handleInputOutNode(n);
            });
            // arguments[0] is transferred via a signal from Nodeview
            n.ownerLabel.events.onInputDown.add(function () {
                var nodeLabel = arguments[0];
                this.handleInputDownNodeLabel(nodeLabel, n);
            }, this);
            n.payoffsLabel.events.onInputDown.add(function () {
                var nodeLabel = arguments[0];
                this.handleInputDownNodePayoffs(nodeLabel, n);
            }, this);
            if (n.node.parentMove) {
                var move_1 = this.treeView.findMoveView(n.node.parentMove);
                move_1.label.events.onInputDown.add(function () {
                    var moveLabel = arguments[0];
                    this.handleInputDownMoveLabel(moveLabel, move_1);
                }, this);
            }
        };
        /**The iSet specific method for attaching handlers*/
        TreeController.prototype.attachHandlersToISet = function (iSet) {
            iSet.events.onInputOver.add(function () {
                var iSet = arguments[0];
                this.handleInputOverISet(iSet);
            }, this);
        };
        /**Handler for the signal HOVER on a Node*/
        TreeController.prototype.handleInputOverNode = function (nodeV) {
            if (!this.game.input.activePointer.isDown && nodeV.node.iSet === null) {
                this.hoverSignal.dispatch(nodeV);
            }
        };
        /**Handler for the signal HOVER_OUT on a Node*/
        TreeController.prototype.handleInputOutNode = function (nodeV) {
            // ADD Hover Out logic here
        };
        /**Handler for the signal CLICK on a Node*/
        TreeController.prototype.handleInputDownNode = function (nodeV) {
            if (!this.game.input.activePointer.isDown) {
                this.hoverSignal.dispatch(nodeV);
            }
        };
        /**Handler for the signal HOVER on an ISet*/
        TreeController.prototype.handleInputOverISet = function (iSetV) {
            if (!this.game.input.activePointer.isDown) {
                this.hoverSignal.dispatch(iSetV);
            }
        };
        /**Handler for the signal CLICK on a Move Label*/
        TreeController.prototype.handleInputDownMoveLabel = function (label, move) {
            if (label.alpha !== 0) {
                this.labelInput.show(label, move);
            }
        };
        /**Handler for the signal CLICK on a Node Label*/
        TreeController.prototype.handleInputDownNodeLabel = function (label, node) {
            if (label.alpha !== 0) {
                this.labelInput.show(label, node);
            }
        };
        TreeController.prototype.handleInputDownNodePayoffs = function (label, node) {
            if (label.alpha !== 0) {
                this.labelInput.show(label, node);
            }
        };
        //endregion
        //region Nodes Logic
        /**Adding child or children to a node*/
        TreeController.prototype.addNodeHandler = function (nodesV) {
            var _this = this;
            nodesV.forEach(function (nodeV) {
                _this.handleInputOutNode(nodeV);
                if (nodeV.node.children.length === 0) {
                    var child1 = _this.treeView.addChildToNode(nodeV);
                    var child2 = _this.treeView.addChildToNode(nodeV);
                    _this.attachHandlersToNode(child1);
                    _this.attachHandlersToNode(child2);
                }
                else {
                    var child1 = _this.treeView.addChildToNode(nodeV);
                    _this.attachHandlersToNode(child1);
                }
            });
            this.tree.cleanISets();
            this.treeView.cleanISets();
            this.resetTree(true, true);
        };
        /**A method for deleting a node - 2 step deletion.*/
        TreeController.prototype.deleteNodeHandler = function (nodesV) {
            var _this = this;
            nodesV.forEach(function (nodeV) {
                var node = nodeV.node;
                if (_this.tree.nodes.indexOf(node) === -1) {
                    return;
                }
                if (node.children.length === 0 && node !== _this.tree.root) {
                    _this.deleteNode(node);
                }
                else {
                    _this.nodesToDelete = [];
                    _this.getAllBranchChildren(node);
                    _this.nodesToDelete.pop();
                    _this.nodesToDelete.forEach(function (n) {
                        _this.deleteNode(n);
                    });
                    _this.nodesToDelete = [];
                    node.convertToDefault();
                }
            });
            this.tree.cleanISets();
            this.treeView.cleanISets();
            this.resetTree(true, true);
        };
        //endregion
        //region Players Logic
        /** A method for assigning a player to a given node.*/
        TreeController.prototype.assignPlayerToNode = function (playerID, nodesV) {
            var _this = this;
            //if someone adds player 4 before adding player 3, we will add player 3 instead.
            if (playerID > this.tree.players.length) {
                playerID--;
            }
            this.addPlayer(playerID);
            nodesV.forEach(function (nodeV) {
                nodeV.node.convertToLabeled(_this.tree.findPlayerById(playerID));
                // If the node is in an iset, change the owner of the iSet to the new player
                if (nodeV.node.iSet && nodeV.node.iSet.nodes.length > 1) {
                    nodeV.node.iSet.player = _this.tree.players[playerID];
                    var iSetView = _this.treeView.findISetView(nodeV.node.iSet);
                    iSetView.tint = iSetView.iSet.player.color;
                }
            });
            this.resetTree(false, false);
        };
        /**A method for assigning chance player to a given node*/
        TreeController.prototype.assignChancePlayerToNode = function (nodesV) {
            var _this = this;
            nodesV.forEach(function (nodeV) {
                nodeV.node.convertToChance(_this.tree.players[0]);
            });
            this.resetTree(false, false);
        };
        /**A method for adding a new player if there isn't one created already*/
        TreeController.prototype.addPlayer = function (playerID) {
            //if someone adds player 4 before adding player 3, we will add player 3 instead.
            if (playerID > this.tree.players.length) {
                playerID--;
            }
            if (playerID > this.tree.players.length - 1) {
                this.tree.addPlayer(new GTE.Player(playerID, playerID.toString(), GTE.PLAYER_COLORS[playerID - 1]));
                $("#player-number").html((this.tree.players.length - 1).toString());
                $("#zero-sum-wrapper").css("opacity", 0.3);
                this.treeView.showOrHideLabels(true);
            }
        };
        //endregion
        //region ISets Logic
        /**Creates an iSet with the corresponding checks*/
        TreeController.prototype.createISet = function (nodesV) {
            var _this = this;
            var nodes = [];
            nodesV.forEach(function (n) {
                nodes.push(n.node);
            });
            //Check for errors
            this.tree.canCreateISet(nodes);
            // Create a list of nodes to put into an iSet - create the union of all iSets
            var iSetNodes = [];
            var player = null;
            nodesV.forEach(function (n) {
                if (n.node.iSet) {
                    n.node.iSet.nodes.forEach(function (iNode) {
                        iSetNodes.push(iNode);
                    });
                    var iSetView = _this.treeView.findISetView(n.node.iSet);
                    _this.tree.removeISet(n.node.iSet);
                    _this.treeView.removeISetView(iSetView);
                }
                else {
                    iSetNodes.push(n.node);
                }
                if (n.node.player) {
                    player = n.node.player;
                }
            });
            var iSet = this.tree.addISet(player, iSetNodes);
            var iSetV = this.treeView.addISetView(iSet);
            this.attachHandlersToISet(iSetV);
            this.resetTree(true, true);
        };
        /**A method for deleting an iSet*/
        TreeController.prototype.removeISetHandler = function (iSet) {
            this.tree.removeISet(iSet);
            this.treeView.removeISetView(this.treeView.findISetView(iSet));
            this.resetTree(true, true);
        };
        /**A method which removes all isets from the selected nodes*/
        TreeController.prototype.removeISetsByNodesHandler = function (selectedNodes) {
            var iSetsToRemove = this.getDistinctISetsFromNodes(selectedNodes);
            for (var i = 0; i < iSetsToRemove.length; i++) {
                this.removeISetHandler(iSetsToRemove[i]);
            }
            iSetsToRemove = null;
        };
        /**A helper method which returns all iSets from the selected nodes*/
        TreeController.prototype.getDistinctISetsFromNodes = function (nodesV) {
            var distinctISets = [];
            nodesV.forEach(function (n) {
                if (n.node.iSet && distinctISets.indexOf(n.node.iSet) === -1) {
                    distinctISets.push(n.node.iSet);
                }
            });
            return distinctISets;
        };
        /**A method which cuts the information set*/
        TreeController.prototype.cutInformationSet = function (iSetV, x, y) {
            if (iSetV.nodes.length === 2) {
                this.removeISetHandler(iSetV.iSet);
            }
            else {
                var leftNodes_1 = [];
                var rightNodes_1 = [];
                iSetV.nodes.forEach(function (n) {
                    if (n.x <= x) {
                        leftNodes_1.push(n);
                    }
                    else {
                        rightNodes_1.push(n);
                    }
                });
                if (leftNodes_1.length === 1) {
                    iSetV.iSet.removeNode(leftNodes_1[0].node);
                    iSetV.removeNode(leftNodes_1[0]);
                }
                else if (rightNodes_1.length === 1) {
                    iSetV.iSet.removeNode(rightNodes_1[0].node);
                    iSetV.removeNode(rightNodes_1[0]);
                }
                else {
                    this.removeISetHandler(iSetV.iSet);
                    this.createISet(leftNodes_1);
                    this.createISet(rightNodes_1);
                }
            }
            this.resetTree(false, false);
        };
        //endregion
        /**A method for assigning random payoffs to nodes*/
        TreeController.prototype.assignRandomPayoffs = function () {
            var leaves = this.tree.getLeaves();
            leaves.forEach(function (n) {
                n.payoffs.setRandomPayoffs();
            });
            this.resetTree(false, false);
        };
        /**A method for resetting the tree after each action on the tree,
         * soft=true means only changing labels and isets, false redraws the full tree*/
        TreeController.prototype.resetTree = function (fullReset, startAnimations) {
            if (this.tree.nodes.length > 1) {
                this.treeView.drawTree(fullReset, startAnimations);
            }
        };
        TreeController.prototype.reloadTreeFromJSON = function (newTree, treeCoordinates) {
            var _this = this;
            //1. Delete the current Tree and ISets in tree controller
            this.deleteNodeHandler([this.treeView.nodes[0]]);
            this.treeView.nodes[0].destroy();
            this.treeView.iSets.forEach(function (iSet) {
                iSet.destroy();
            });
            //2. Change it with the corresponding one in treelist
            // this.tree = this.treesList[this.currentTreeIndex].clone();
            this.tree = newTree;
            this.treeView = new GTE.TreeView(this.game, this.tree, this.treeViewProperties);
            this.treeView.nodes.forEach(function (n) {
                n.resetNodeDrawing();
                n.resetLabelText(_this.treeViewProperties.zeroSumOn);
            });
            this.treeView.showOrHideLabels(true);
            this.attachHandlersToNodes();
            this.treeView.iSets.forEach(function (iSet) {
                _this.attachHandlersToISet(iSet);
            });
            if (treeCoordinates) {
                for (var i = 0; i < this.treeView.nodes.length; i++) {
                    this.treeView.nodes[i].position.x = treeCoordinates[i].x;
                    this.treeView.nodes[i].position.y = treeCoordinates[i].y;
                }
                this.treeView.drawISets();
            }
            this.resetTree(false, false);
        };
        /**Get all children of a given node*/
        TreeController.prototype.getAllBranchChildren = function (node) {
            var _this = this;
            node.children.forEach(function (c) {
                _this.getAllBranchChildren(c);
            });
            this.nodesToDelete.push(node);
        };
        /**A method for deleting a single! node from the treeView and tree*/
        TreeController.prototype.deleteNode = function (node) {
            this.treeView.removeNodeView(this.treeView.findNodeView(node));
            this.tree.removeNode(node);
        };
        return TreeController;
    }());
    GTE.TreeController = TreeController;
})(GTE || (GTE = {}));
//# sourceMappingURL=TreeController.js.map