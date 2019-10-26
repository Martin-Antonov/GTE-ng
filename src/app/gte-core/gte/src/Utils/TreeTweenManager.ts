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
    for (let i = 0; i < this.oldCoordinates.length; i++) {
      const clonedCoords = this.oldCoordinates[i];
      const nodeV = nodes[i];
      this.scene.tweens.add({
        targets: nodeV,
        x: {start: clonedCoords.x, from: clonedCoords.x, to: nodeV.x},
        y: {start: clonedCoords.x, from: clonedCoords.y, to: nodeV.y},
        duration: TREE_TWEEN_DURATION,
        ease: 'Quart.easeOut',
        onUpdate: () => {
          nodes.forEach(n => {
            n.resetNodeDrawing(allNodesLabeled, properties.zeroSumOn);
          });
          moves.forEach(m => {
            m.updateMovePosition();
            m.updateLabel(properties.fractionOn, properties.levelHeight);
          });
        }
      });
    }
  }
}

