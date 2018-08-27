///<reference path="Tree.ts"/>
///<reference path="Node.ts"/>
///<reference path="Player.ts"/>
namespace GameTheoryExplorer {
    export class LabelSetter {
        player1Labels: Array<string>;
        player2Labels: Array<string>;

        constructor() {
            this.player1Labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            this.player2Labels = "abcdefghijklmnopqrstuvwxyz".split("");
        }

        /** Calculates and sets the labels for moves in a BFS order*/
        calculateLabels(bfsNodes: Array<Node>, players: Array<Player>) {
            let p1Labels = this.player1Labels.slice(0);
            let p2Labels = this.player2Labels.slice(0);

            bfsNodes.forEach(n => {
                if (n.type === NodeType.OWNED) {
                    // reference the labels depending on the player
                    let labels = n.player === players[1] ? p1Labels : p2Labels;
                    // If it is not in an information set, give the moves labels
                    if (n.iSet === null) {
                        n.children.forEach(n => {
                            n.parentMove.convertToLabeled(labels.shift());
                        });
                    }
                    // If it is an information set and it is the n such node in the set, give labels
                    // to all moves in the information set
                    else if (n === n.iSet.nodes[0]) {
                        n.children.forEach(n => {
                            n.parentMove.convertToLabeled(labels.shift());
                        });

                        for (let i = 1; i < n.iSet.nodes.length; i++) {
                            let iSetNode = n.iSet.nodes[i];
                            for (let j = 0; j < iSetNode.children.length; j++) {
                                iSetNode.children[j].parentMove.label = n.children[j].parentMove.label;
                            }
                        }
                    }
                }
            });
        }
    }
}
