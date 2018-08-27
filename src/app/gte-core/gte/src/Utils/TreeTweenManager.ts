/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
///<reference path="../View/NodeView.ts"/>
///<reference path="../View/ISetView.ts"/>
///<reference path="../View/MoveView.ts"/>
///<reference path="Constants.ts"/>
///<reference path="../View/TreeViewProperties.ts"/>
namespace GameTheoryExplorer {
    export class TreeTweenManager {
        game: Phaser.Game;
        oldCoordinates: Array<{ x, y }>;
        properties: TreeViewProperties;

        constructor(game: Phaser.Game, properties: TreeViewProperties) {
            this.properties = properties;
            this.game = game;
        }

        startTweens(nodes: Array<NodeView>, moves: Array<MoveView>) {
            for (let i = 0; i < this.oldCoordinates.length; i++) {
                let clonedCoords = this.oldCoordinates[i];
                let nodeV = nodes[i];
                this.game.add.tween(nodeV).from({
                    x: clonedCoords.x,
                    y: clonedCoords.y
                }, TREE_TWEEN_DURATION, Phaser.Easing.Quartic.Out, true)
                    .onUpdateCallback(() => {
                        nodes.forEach(n => {
                            n.resetNodeDrawing();
                        });
                        moves.forEach(m => {
                            m.updateMovePosition();
                            m.updateLabel(this.properties.fractionOn);
                        });
                    }, this);
            }
        }
    }
}
