///<reference path="Move.ts"/>
///<reference path="ISet.ts"/>
///<reference path="Player.ts"/>
///<reference path="Payoffs.ts"/>
var GTE;
(function (GTE) {
    /**The types of Node. If a node does not have type, it can be deleted */
    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["DEFAULT"] = 1] = "DEFAULT";
        NodeType[NodeType["CHANCE"] = 2] = "CHANCE";
        NodeType[NodeType["OWNED"] = 3] = "OWNED";
        NodeType[NodeType["LEAF"] = 4] = "LEAF";
    })(NodeType = GTE.NodeType || (GTE.NodeType = {}));
    /**The class Node. Each Node has a type, parent, parentMove, children, childrenMoves, iSet, player, depth and payoff */
    var Node = /** @class */ (function () {
        function Node(depth, type, parent) {
            this.depth = depth || 0;
            this.type = type || NodeType.DEFAULT;
            this.parent = parent || null;
            this.children = [];
            this.childrenMoves = [];
            this.player = null;
            this.iSet = null;
            this.payoffs = new GTE.Payoffs();
        }
        /**The method adds a child to the current Node. */
        Node.prototype.addChild = function (node) {
            var child = node || new Node();
            child.parent = this;
            child.type = NodeType.DEFAULT;
            child.depth = this.depth + 1;
            this.children.push(child);
            var move = new GTE.Move(this, child);
            child.parentMove = move;
            this.childrenMoves.push(move);
        };
        /**The method removes a given child from the Node (currently not used anywhere)*/
        Node.prototype.removeChild = function (node) {
            if (this.children.indexOf(node) !== -1) {
                this.children.splice(this.children.indexOf(node), 1);
                node.destroy();
            }
        };
        /**Converts the current Node to a default Node */
        Node.prototype.convertToDefault = function () {
            this.type = NodeType.DEFAULT;
            this.player = null;
            if (this.iSet) {
                this.iSet.removeNode(this);
            }
            this.childrenMoves.forEach(function (c) { return c.convertToDefault(); });
        };
        /**Converts the current Node to a labeled, by setting an player */
        Node.prototype.convertToLabeled = function (player) {
            if (this.children.length > 0) {
                if (this.iSet && this.iSet.nodes) {
                    this.iSet.player = player;
                    this.iSet.nodes.forEach(function (n) {
                        n.type = NodeType.OWNED;
                        n.player = player;
                        n.childrenMoves.forEach(function (c) { return c.convertToLabeled(); });
                    });
                }
                else {
                    this.type = NodeType.OWNED;
                    this.player = player;
                    this.childrenMoves.forEach(function (c) { return c.convertToLabeled(); });
                }
            }
        };
        /**Converts the current Node to a leaf node, by setting payoffs */
        Node.prototype.convertToLeaf = function () {
            this.type = NodeType.LEAF;
            this.player = null;
            if (this.iSet) {
                this.iSet.removeNode(this);
            }
        };
        /**Converts the current Node to a chance Node, setting the player to the chancePlayer and assigning probabilities to children moves*/
        Node.prototype.convertToChance = function (chancePlayer, probabilities) {
            var _this = this;
            if (this.children.length > 0 && this.iSet === null) {
                this.type = NodeType.CHANCE;
                if (chancePlayer.id === 0) {
                    this.player = chancePlayer;
                }
                else {
                    throw new Error("Given player is not a chance player");
                }
                if (this.iSet) {
                    this.iSet.removeNode(this);
                }
                if (probabilities && this.childrenMoves.length === probabilities.length) {
                    for (var i = 0; i < this.childrenMoves.length; i++) {
                        this.childrenMoves[i].convertToChance(1 / probabilities[i]);
                    }
                }
                else if (probabilities && this.childrenMoves.length !== probabilities.length) {
                    throw new SyntaxError("Number of probabilities does not match number of moves!");
                }
                else {
                    this.childrenMoves.forEach(function (c) { return c.convertToChance(1 / _this.childrenMoves.length); });
                }
            }
        };
        /**A method which returns the path from a given node to the root*/
        Node.prototype.getPathToRoot = function () {
            var path = [];
            var node = this;
            while (node.parent !== null) {
                path.push(node.parent);
                node = node.parent;
            }
            return path;
        };
        /**Destroy ensures that there are no memory-leaks. */
        Node.prototype.destroy = function () {
            this.type = null;
            this.depth = null;
            this.player = null;
            if (this.parent) {
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }
            if (this.iSet) {
                this.iSet.removeNode(this);
                this.iSet = null;
            }
            if (this.payoffs) {
                this.payoffs.destroy();
                this.payoffs = null;
            }
            if (this.children.length > 0) {
                this.children.forEach(function (c) { return c.destroy(); });
                this.children = null;
            }
            if (this.childrenMoves.length > 0) {
                this.childrenMoves.forEach(function (m) {
                    m.destroy();
                });
                this.childrenMoves = null;
            }
        };
        return Node;
    }());
    GTE.Node = Node;
})(GTE || (GTE = {}));
//# sourceMappingURL=Node.js.map