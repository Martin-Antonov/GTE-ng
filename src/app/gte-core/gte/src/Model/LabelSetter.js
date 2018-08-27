///<reference path="Tree.ts"/>
///<reference path="Node.ts"/>
///<reference path="Player.ts"/>
var GTE;
(function (GTE) {
    var LabelSetter = /** @class */ (function () {
        function LabelSetter() {
            this.player1Labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            this.player2Labels = "abcdefghijklmnopqrstuvwxyz".split("");
        }
        /** Calculates and sets the labels for moves in a BFS order*/
        LabelSetter.prototype.calculateLabels = function (bfsNodes, players) {
            var p1Labels = this.player1Labels.slice(0);
            var p2Labels = this.player2Labels.slice(0);
            bfsNodes.forEach(function (n) {
                if (n.type === GTE.NodeType.OWNED) {
                    // reference the labels depending on the player
                    var labels_1 = n.player === players[1] ? p1Labels : p2Labels;
                    // If it is not in an information set, give the moves labels
                    if (n.iSet === null) {
                        n.children.forEach(function (n) {
                            n.parentMove.convertToLabeled(labels_1.shift());
                        });
                    }
                    // If it is an information set and it is the n such node in the set, give labels
                    // to all moves in the information set
                    else if (n === n.iSet.nodes[0]) {
                        n.children.forEach(function (n) {
                            n.parentMove.convertToLabeled(labels_1.shift());
                        });
                        for (var i = 1; i < n.iSet.nodes.length; i++) {
                            var iSetNode = n.iSet.nodes[i];
                            for (var j = 0; j < iSetNode.children.length; j++) {
                                iSetNode.children[j].parentMove.label = n.children[j].parentMove.label;
                            }
                        }
                    }
                }
            });
        };
        return LabelSetter;
    }());
    GTE.LabelSetter = LabelSetter;
})(GTE || (GTE = {}));
//# sourceMappingURL=LabelSetter.js.map