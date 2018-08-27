/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
///<reference path="Player.ts"/>
///<reference path="Node.ts"/>
namespace GameTheoryExplorer {
    /**The class that represents the ISet. The ISet has player, array storing all nodes, and a label */
    export class ISet {
        player: Player;
        nodes: Array<Node>;

        constructor(player?: Player, nodes?: Array<Node>) {
            this.player = player;
            this.nodes = [];
            if (nodes) {
                nodes.forEach(n => {
                    this.addNode(n);
                    if(this.player) {
                        n.convertToLabeled(this.player);
                    }
                });
            }
        }

        /** Adds a node to the current information set (currently not used)*/
        addNode(node: Node) {
            if (this.player && node.player && node.player !== this.player) {
                throw new Error("ISet player is different from node player!");
            }
            if (this.player && !node.player) {
                node.player = this.player;
            }
            if (this.nodes.indexOf(node) === -1) {
                this.nodes.push(node);
                node.iSet = this;
            }
        }

        /** Removes a node from the information set*/
        removeNode(node: Node) {
            if (this.nodes.indexOf(node) !== -1) {
                this.nodes.splice(this.nodes.indexOf(node), 1);
                node.iSet = null;
            }
        }

        /**The destroy method ensures that there are no memory-leaks */
        destroy() {
            this.player = null;
            this.nodes.forEach(n => {
                n.iSet = null;
            });
            this.nodes = [];
            this.nodes = null;
        }
    }
}
