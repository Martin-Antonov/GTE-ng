import {TREE_TWEEN_DURATION} from './Constants';
import {NodeView} from '../View/NodeView';
import {MoveView} from '../View/MoveView';
import {TreeViewProperties} from '../View/TreeViewProperties';

export class TreeTweenManager {
  scene: Phaser.Scene;
  oldCoordinates: Array<{ x, y }>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  startTweens(nodes: Array<NodeView>, moves: Array<MoveView>, allNodesLabeled: boolean, properties: TreeViewProperties) {
    const finalPositionsX = [];
    const finalPositionsY = [];

    nodes.forEach((nV: NodeView) => {
      finalPositionsX.push(nV.x);
      finalPositionsY.push(nV.y);
    });


    const tween = this.scene.tweens.add({
      targets: nodes[0],
      x: {from: this.oldCoordinates[0].x, to: nodes[0].x},
      y: {from: this.oldCoordinates[0].y, to: nodes[0].y},
      duration: TREE_TWEEN_DURATION,
      ease: 'Cubic.easeOut',
      onStart: () => {
        for (let i = 1; i < nodes.length; i++) {
          nodes[i].setPosition(this.oldCoordinates[i].x, this.oldCoordinates[i].y);
        }
      },
      onUpdate: () => {
        const progress = tween.data[0].ease(tween.progress);
        for (let i = 1; i < nodes.length; i++) {
          nodes[i].setPosition(this.oldCoordinates[i].x + (finalPositionsX[i] - this.oldCoordinates[i].x) * progress,
            this.oldCoordinates[i].y + (finalPositionsY[i] - this.oldCoordinates[i].y) * progress);
        }

        moves.forEach(m => {
          m.updateMovePosition();
          m.updateLabel(properties.fractionOn, properties.levelHeight);
        });
      }
    });
    // for (let i = 0; i < this.oldCoordinates.length; i++) {
    //   const clonedCoords = this.oldCoordinates[i];
    //   const nodeV = nodes[i];
    //   this.scene.tweens.add({
    //     targets: nodeV,
    //     x: {from: clonedCoords.x, to: nodeV.x},
    //     y: {from: clonedCoords.y, to: nodeV.y},
    //     duration: TREE_TWEEN_DURATION,
    //     ease: 'Quart.easeOut',
    //     onUpdate: () => {
    //       // moves.forEach(m => {
    //       //   m.updateMovePosition();
    //       //   m.updateLabel(properties.fractionOn, properties.levelHeight);
    //       // });
    //     }
    //   });
    // }
  }
}

