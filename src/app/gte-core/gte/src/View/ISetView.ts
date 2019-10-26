import {ISET_LINE_WIDTH, LABEL_SIZE, OVERLAY_SCALE} from '../Utils/Constants';
import {NodeView} from './NodeView';
import {ISet} from '../Model/ISet';

/**A class for drawing the iSet */
export class ISetView extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  graphics: Phaser.GameObjects.Graphics;
  iSet: ISet;
  label: Phaser.GameObjects.Text;
  nodes: Array<NodeView>;

  constructor(scene: Phaser.Scene, iSet: ISet, nodes: Array<NodeView>) {
    super(scene, 0, 0, '');
    this.scene = scene;
    this.iSet = iSet;
    this.nodes = nodes;

    this.graphics = this.scene.make.graphics({});
    this.sortNodesLeftToRight();
    this.createISetBMD();
    this.createLabel();

    this.setInteractive(this.scene.input.makePixelPerfect());
    // P3: What to do here
    // this.input.priorityID = 100;
  }

  removeNode(nodeV: NodeView) {
    if (this.nodes.indexOf(nodeV) !== -1) {
      this.nodes.splice(this.nodes.indexOf(nodeV), 1);
    }
  }

  resetISet() {
    this.sortNodesLeftToRight();
    this.createISetBMD();
    const rightNode = this.nodes[Math.floor(this.nodes.length / 2)];
    const leftNode = this.nodes[Math.floor(this.nodes.length / 2) - 1];
    this.label.setPosition((rightNode.x + leftNode.x) * 0.5, (rightNode.y + leftNode.y) * 0.5);
    this.updateISetLabel();
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
    });
  }

  private updateISetLabel() {
    if (this.nodes[0].node.player) {
      this.label.setText(this.nodes[0].node.player.label);
    }
    if (!this.iSet.player) {
      this.label.alpha = 0;
    } else {
      this.label.alpha = 1;
      this.label.setColor(this.iSet.player.color.toString());
    }
    this.nodes.forEach((nV: NodeView) => {
      nV.ownerLabel.alpha = 0;
    });
  }

  /**Sorts the nodes left to right before drawing*/
  private sortNodesLeftToRight() {
    this.nodes.sort((n1, n2) => {
      return n1.x <= n2.x ? -1 : 1;
    });
  }

  /**Create e very thick line that goes through all the points*/
  private createISetBMD() {
    const color = this.iSet.player ? this.iSet.player.color : '#000000';
    this.graphics.clear();
    this.graphics.lineStyle(this.scene.sys.canvas.height * ISET_LINE_WIDTH, Number(color), 0.15);

    // P3: What to do here?
    // this.graphics.lineCap = 'round';
    // this.graphics.lineJoin = 'round';
    this.graphics.beginPath();
    this.graphics.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.nodes.length; i++) {
      this.graphics.lineTo(this.nodes[i].x, this.nodes[i].y);
    }

    this.graphics.stroke();
    this.graphics.generateTexture('iSet');

    this.setTexture('iSet');
    this.scene.add.existing(this);
  }

  private createLabel() {
    const rightNode = this.nodes[Math.floor(this.nodes.length / 2)];
    const leftNode = this.nodes[Math.floor(this.nodes.length / 2) - 1];

    const text = this.nodes[0].node.player ? this.nodes[0].node.player.label : '';
    this.label = this.scene.add.text((rightNode.x + leftNode.x) * 0.5,
      (rightNode.y + leftNode.y) * 0.5, text, {
      fontSize: this.nodes[0].displayWidth * LABEL_SIZE,

      });
    if (!this.iSet.player) {
      this.label.alpha = 0;
    } else {
      this.label.setColor(this.iSet.player.color.toString());
    }
  }

  destroy() {
    this.graphics.destroy();
    this.graphics = null;
    this.nodes = [];
    this.nodes = null;
    this.label.destroy();
    if (this.iSet && this.iSet.nodes) {
      this.iSet.destroy();
      this.iSet = null;
    }
    super.destroy(true);
  }
}

