import {ISET_LINE_WIDTH, LABEL_SIZE, TREE_TWEEN_DURATION} from '../Utils/Constants';
import {NodeView} from './NodeView';
import {ISet} from '../Model/ISet';

/**A class for drawing the iSet */
export class ISetView extends Phaser.GameObjects.Image {
  scene: Phaser.Scene;
  canvasTexture: Phaser.Textures.CanvasTexture;
  iSet: ISet;
  label: Phaser.GameObjects.Text;
  nodes: Array<NodeView>;
  uuid: string;

  constructor(scene: Phaser.Scene, iSet: ISet, nodes: Array<NodeView>) {
    super(scene, scene.sys.canvas.width / 2, scene.sys.canvas.height / 2, '');
    this.scene = scene;
    this.iSet = iSet;
    this.nodes = nodes;

    this.uuid = this.getUUID();
    this.canvasTexture = this.scene.textures.createCanvas(this.uuid, this.scene.sys.canvas.width, this.scene.sys.canvas.height);
    this.sortNodesLeftToRight();
    this.createISetBMD();
    this.createLabel();
    this.setTexture(this.uuid);
    this.setInteractive(this.scene.input.makePixelPerfect());
    this.scene.add.existing(this);
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
      alpha: 0.15,
      duration: TREE_TWEEN_DURATION / 2,
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
      this.label.setColor(this.iSet.player.color);
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
    const ctx = this.canvasTexture.getContext();
    const color = this.iSet.player ? this.iSet.player.color : '#000000';
    this.canvasTexture.clear();
    ctx.lineWidth = this.scene.sys.canvas.height * ISET_LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.nodes.length; i++) {
      ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }
    ctx.stroke();
  }

  private createLabel() {
    const rightNode = this.nodes[Math.floor(this.nodes.length / 2)];
    const leftNode = this.nodes[Math.floor(this.nodes.length / 2) - 1];

    const text = this.nodes[0].node.player ? this.nodes[0].node.player.label : '';
    this.label = this.scene.add.text((rightNode.x + leftNode.x) * 0.5,
      (rightNode.y + leftNode.y) * 0.5, text, {
        fontSize: this.nodes[0].circle.displayWidth * LABEL_SIZE,
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }).setOrigin(0.5, 0.5);
    if (!this.iSet.player) {
      this.label.alpha = 0;
    } else {
      this.label.setColor(this.iSet.player.color);
    }
  }

  private getUUID() {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  destroy() {
    this.canvasTexture.destroy();
    this.canvasTexture = null;
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

