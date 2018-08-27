/// <reference path = "../../lib/phaser.d.ts"/>
///<reference path="../Model/Tree.ts"/>
///<reference path="TreeViewProperties.ts"/>
///<reference path="NodeView.ts"/>
///<reference path="MoveView.ts"/>
///<reference path="../Model/Node.ts"/>
///<reference path="ISetView.ts"/>
///<reference path="../Utils/TreeTweenManager.ts"/>
///<reference path="../Model/ISet.ts"/>
var GTE;
(function (GTE) {
    /** A class for the graphical representation of the tree. The main algorithm for drawing and repositioning
     * the tree is in this class*/
    var TreeView = /** @class */ (function () {
        function TreeView(game, tree, properties) {
            this.game = game;
            this.treeTweenManager = new GTE.TreeTweenManager(this.game, properties);
            this.tree = tree;
            this.properties = properties;
            this.nodes = [];
            this.moves = [];
            this.iSets = [];
            this.initializeTree();
        }
        /**Given a tree from the Model, we initialize the treeView by adding the corresponding sprites*/
        TreeView.prototype.initializeTree = function () {
            var _this = this;
            this.tree.nodes.forEach(function (n) {
                var nodeView = new GTE.NodeView(_this.game, n);
                _this.nodes.push(nodeView);
                if (n !== _this.tree.root) {
                    var parent_1 = _this.findNodeView(n.parent);
                    _this.moves.push(new GTE.MoveView(_this.game, parent_1, nodeView));
                }
            });
            this.tree.iSets.forEach(function (iSet) {
                _this.addISetView(iSet);
            });
            this.drawTree(true, false);
            this.updateMoves();
        };
        //region Tree Drawing Algorithm
        /**This method contains the algorithm for drawing the tree in different scenarios*/
        TreeView.prototype.drawTree = function (fullReset, startAnimations) {
            var maxDepth = this.tree.getMaxDepth();
            if (maxDepth * this.properties.levelHeight > this.game.height * 0.75) {
                this.properties.levelHeight *= 0.8;
            }
            this.treeTweenManager.oldCoordinates = this.getOldCoordinates();
            if (fullReset) {
                this.setYCoordinates();
                this.updateLeavesPositions();
                this.centerParents();
                this.centerGroupOnScreen();
            }
            this.drawISets();
            this.resetNodeLabels();
            this.showOrHideLabels(true);
            if (startAnimations) {
                this.treeTweenManager.startTweens(this.nodes, this.moves);
            }
            else {
                this.updateMoves();
            }
        };
        /**In order to tween the nodes, we need to save the old coordinates for each node*/
        TreeView.prototype.getOldCoordinates = function () {
            var oldCoordinates = [];
            this.nodes.forEach(function (n) {
                oldCoordinates.push({ x: n.x, y: n.y });
            });
            return oldCoordinates;
        };
        /**Sets the Y-coordinates for the tree nodes*/
        TreeView.prototype.setYCoordinates = function () {
            var _this = this;
            this.nodes.forEach(function (nodeView) {
                nodeView.y = nodeView.level * _this.properties.levelHeight;
            });
        };
        /**Update the leaves' x coordinate first*/
        TreeView.prototype.updateLeavesPositions = function () {
            var leaves = this.tree.getLeaves();
            var widthPerNode = this.properties.treeWidth / leaves.length;
            for (var i = 0; i < leaves.length; i++) {
                var nodeView = this.findNodeView(leaves[i]);
                nodeView.x = (widthPerNode * i);
            }
        };
        /**Update the parents' x coordinate*/
        TreeView.prototype.centerParents = function () {
            var _this = this;
            this.tree.BFSOnTree().reverse().forEach(function (n) {
                if (n.children.length !== 0) {
                    var currentNodeView = _this.findNodeView(n);
                    var leftChildNodeView = _this.findNodeView(n.children[0]);
                    var rightChildNodeView = _this.findNodeView(n.children[n.children.length - 1]);
                    currentNodeView.x = (leftChildNodeView.x + rightChildNodeView.x) / 2;
                }
            });
        };
        /**A method which updates the rotation and position of the moves with regards to the parent and child nodes*/
        TreeView.prototype.updateMoves = function () {
            var _this = this;
            this.moves.forEach(function (mV) {
                mV.updateMovePosition();
                mV.updateLabel(_this.properties.fractionOn);
            });
        };
        /** Resets the drawing of each node, depending on the node type*/
        TreeView.prototype.resetNodeLabels = function () {
            var _this = this;
            this.nodes.forEach(function (nV) {
                nV.resetNodeDrawing();
                nV.resetLabelText(_this.properties.zeroSumOn);
            });
        };
        /**ISets need to be redrawn at each step*/
        TreeView.prototype.drawISets = function () {
            this.iSets.forEach(function (is) {
                is.resetISet();
            });
        };
        /** A method which decides whether to show the labels or not*/
        TreeView.prototype.showOrHideLabels = function (shouldResetLabels) {
            var _this = this;
            if (this.tree.checkAllNodesLabeled()) {
                if (shouldResetLabels) {
                    this.tree.resetLabels();
                }
                this.moves.forEach(function (m) {
                    m.label.alpha = 1;
                    m.updateLabel(_this.properties.fractionOn);
                });
                this.nodes.forEach(function (n) {
                    if (n.node.children.length === 0) {
                        n.node.convertToLeaf();
                        n.resetNodeDrawing();
                        n.resetLabelText(_this.properties.zeroSumOn);
                    }
                });
            }
            else {
                this.tree.removeMoveLabels();
                this.moves.forEach(function (m) {
                    m.label.alpha = 0;
                });
                this.nodes.forEach(function (n) {
                    n.resetLabelText(_this.properties.zeroSumOn);
                    n.payoffsLabel.alpha = 0;
                    if (n.node.type === GTE.NodeType.LEAF) {
                        n.node.convertToDefault();
                        n.resetNodeDrawing();
                    }
                });
            }
        };
        /**Re-centers the tree on the screen*/
        TreeView.prototype.centerGroupOnScreen = function () {
            var left = this.game.width * 5;
            var right = -this.game.width * 5;
            var top = this.game.height * 5;
            var bottom = -this.game.height * 5;
            this.nodes.forEach(function (n) {
                if (n.x < left) {
                    left = n.x;
                }
                if (n.x > right) {
                    right = n.x;
                }
                if (n.y < top) {
                    top = n.y;
                }
                if (n.y > bottom) {
                    bottom = n.y;
                }
            });
            var width = right - left;
            var height = bottom - top;
            var treeCenterX = left + width / 2;
            var treeCenterY = top + height / 2;
            var offsetX = (this.game.width / 2 - treeCenterX);
            var offsetY = (this.game.height / 2 - treeCenterY);
            this.nodes.forEach(function (n) {
                n.position.set(n.x + offsetX, n.y + offsetY);
            });
        };
        //endregion
        //region Nodes
        /** Adds a child to a specified node*/
        TreeView.prototype.addChildToNode = function (nodeV) {
            var node = nodeV.node;
            var child = new GTE.Node();
            this.tree.addChildToNode(node, child);
            var childV = new GTE.NodeView(this.game, child, nodeV.x, nodeV.y);
            var move = new GTE.MoveView(this.game, nodeV, childV);
            this.nodes.push(childV);
            this.moves.push(move);
            return childV;
        };
        /** A helper method for finding the nodeView, given a Node*/
        TreeView.prototype.findNodeView = function (node) {
            for (var i = 0; i < this.nodes.length; i++) {
                var nodeView = this.nodes[i];
                if (nodeView.node === node) {
                    return nodeView;
                }
            }
        };
        /**A helper method for finding the moveView, given a Move*/
        TreeView.prototype.findMoveView = function (move) {
            for (var i = 0; i < this.moves.length; i++) {
                var moveView = this.moves[i];
                if (moveView.move === move) {
                    return moveView;
                }
            }
        };
        /**A method which removes the given nodeView from the treeView*/
        TreeView.prototype.removeNodeView = function (nodeV) {
            var _this = this;
            if (this.nodes.indexOf(nodeV) !== -1) {
                //Delete the associated moves.
                this.moves.forEach(function (m) {
                    if (m.to === nodeV) {
                        _this.moves.splice(_this.moves.indexOf(m), 1);
                        m.destroy();
                    }
                });
                //Remove the nodeView from the treeView and destroy it
                this.nodes.splice(this.nodes.indexOf(nodeV), 1);
                nodeV.events.onInputOut.dispatch(nodeV);
                nodeV.destroy();
            }
        };
        //endregion
        //region ISets
        /**A method for adding an iSetView*/
        TreeView.prototype.addISetView = function (iSet) {
            var _this = this;
            var nodes = [];
            iSet.nodes.forEach(function (n) {
                nodes.push(_this.findNodeView(n));
            });
            var iSetV = new GTE.ISetView(this.game, iSet, nodes);
            this.iSets.push(iSetV);
            return iSetV;
        };
        /**A helper method for finding the iSetView, given iSet*/
        TreeView.prototype.findISetView = function (iSet) {
            for (var i = 0; i < this.iSets.length; i++) {
                var iSetView = this.iSets[i];
                if (iSetView.iSet === iSet) {
                    return iSetView;
                }
            }
        };
        /**A method which removes the given iSetView from the treeView*/
        TreeView.prototype.removeISetView = function (iSetView) {
            if (this.iSets.indexOf(iSetView) !== -1) {
                this.iSets.splice(this.iSets.indexOf(iSetView), 1);
                iSetView.nodes.forEach(function (n) {
                    if (n.node && n.node.player) {
                        n.ownerLabel.alpha = 1;
                    }
                });
                iSetView.destroy();
            }
        };
        /**A method which removes broken iSets*/
        TreeView.prototype.cleanISets = function () {
            for (var i = 0; i < this.iSets.length; i++) {
                var iSetV = this.iSets[i];
                if (!iSetV.iSet || !iSetV.iSet.nodes) {
                    this.removeISetView(iSetV);
                    i--;
                }
            }
        };
        return TreeView;
    }());
    GTE.TreeView = TreeView;
})(GTE || (GTE = {}));
//# sourceMappingURL=TreeView.js.map