///<reference path="../Model/Tree.ts"/>
///<reference path="../Model/Move.ts"/>
///<reference path="../Model/Node.ts"/>
///<reference path="../Model/ISet.ts"/>
///<reference path="../Model/Player.ts"/>
///<reference path="../Model/Payoffs.ts"/>
var GTE;
(function (GTE) {
    var TreeParser = /** @class */ (function () {
        function TreeParser() {
        }
        TreeParser.prototype.copyWithoutCircularReferences = function (tree) {
            var strippedTree = {
                players: [],
                nodes: [],
                iSets: [],
                moves: [],
                nodePlayerPair: []
            };
            //Copy players
            tree.players.forEach(function (p) {
                strippedTree.players.push(new GTE.Player(p.id, p.label, p.color));
            });
            // Copy the nodes without any connection to other nodes
            tree.nodes.forEach(function (n) {
                var node = new GTE.Node();
                node.type = n.type;
                node.depth = n.depth;
                if (node.type === GTE.NodeType.OWNED || node.type === GTE.NodeType.CHANCE) {
                    var ownerIndex = tree.players.indexOf(n.player);
                    strippedTree.nodePlayerPair.push({ nodeIndex: tree.nodes.indexOf(n), playerIndex: ownerIndex });
                }
                if (n.payoffs) {
                    node.payoffs.outcomes = n.payoffs.outcomes;
                }
                strippedTree.nodes.push(node);
            });
            //Copy moves
            tree.moves.forEach(function (m) {
                var move = {
                    type: null,
                    fromIndex: null,
                    toIndex: null,
                    label: null,
                    probability: null
                };
                if (m.label) {
                    move.label = m.label;
                }
                if (m.probability) {
                    move.probability = m.probability;
                }
                move.fromIndex = tree.nodes.indexOf(m.from);
                move.toIndex = tree.nodes.indexOf(m.to);
                strippedTree.moves.push(move);
            });
            //Copy iSets
            tree.iSets.forEach(function (is) {
                var iSet = {
                    label: null,
                    nodeIndexes: []
                };
                is.nodes.forEach(function (n) {
                    iSet.nodeIndexes.push(tree.nodes.indexOf(n));
                });
                strippedTree.iSets.push(iSet);
            });
            return strippedTree;
        };
        TreeParser.prototype.stringify = function (tree) {
            var decircularTree = this.copyWithoutCircularReferences(tree);
            return JSON.stringify(decircularTree);
        };
        TreeParser.prototype.parse = function (jsonTree) {
            var strippedTree = JSON.parse(jsonTree);
            var clonedTree = new GTE.Tree();
            strippedTree.players.forEach(function (pl) {
                clonedTree.players.push(new GTE.Player(pl.id, pl.label, pl.color));
            });
            strippedTree.nodes.forEach(function (n) {
                var node = new GTE.Node();
                node.type = n.type;
                node.depth = n.depth;
                node.payoffs.outcomes = n.payoffs.outcomes.slice(0);
                clonedTree.nodes.push(node);
            });
            strippedTree.nodePlayerPair.forEach(function (pair) {
                clonedTree.nodes[pair.nodeIndex].player = clonedTree.players[pair.playerIndex];
            });
            strippedTree.iSets.forEach(function (is) {
                var iSet = new GTE.ISet();
                is.nodeIndexes.forEach(function (i) {
                    iSet.nodes.push(clonedTree.nodes[i]);
                    clonedTree.nodes[i].iSet = iSet;
                });
                iSet.player = iSet.nodes[0].player;
                clonedTree.iSets.push(iSet);
            });
            strippedTree.moves.forEach(function (m) {
                var move = new GTE.Move();
                move.label = m.label;
                move.probability = m.probability;
                move.from = clonedTree.nodes[m.fromIndex];
                move.to = clonedTree.nodes[m.toIndex];
                move.from.children.push(move.to);
                move.to.parent = move.from;
                move.from.childrenMoves.push(move);
                move.to.parentMove = move;
                clonedTree.moves.push(move);
            });
            clonedTree.root = clonedTree.nodes[0];
            clonedTree.getLeaves();
            return clonedTree;
        };
        return TreeParser;
    }());
    GTE.TreeParser = TreeParser;
})(GTE || (GTE = {}));
//# sourceMappingURL=TreeParser.js.map