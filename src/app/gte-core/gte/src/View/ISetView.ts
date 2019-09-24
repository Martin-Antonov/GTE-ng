/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
import {ISET_LINE_WIDTH, LABEL_SIZE, OVERLAY_SCALE} from '../Utils/Constants';
import {NodeView} from './NodeView';
import {ISet} from '../Model/ISet';

/**A class for drawing the iSet */
export class ISetView extends Phaser.Sprite {
  game: Phaser.Game;
  bmd: Phaser.BitmapData;
  iSet: ISet;
  label: Phaser.Text;
  nodes: Array<NodeView>;

  constructor(game: Phaser.Game, iSet: ISet, nodes: Array<NodeView>) {
    super(game, 0, 0, '');
    this.game = game;
    this.iSet = iSet;
    this.nodes = nodes;

    this.bmd = this.game.make.bitmapData(this.game.width, this.game.height);
    this.sortNodesLeftToRight();
    this.createISetBMD();
    this.createLabel();

    this.inputEnabled = true;
    this.input.priorityID = 100;
    this.input.pixelPerfectClick = true;
    this.input.pixelPerfectOver = true;

    this.events.onInputOver.add(() => {
      this.game.canvas.style.cursor = 'crosshair';
    });
    this.events.onInputOut.add(() => {
      this.game.canvas.style.cursor = 'default';
    });
  }

  removeNode(nodeV: NodeView) {
    if (this.nodes.indexOf(nodeV) !== -1) {
      this.nodes.splice(this.nodes.indexOf(nodeV), 1);
    }
  }

  resetISet() {
    this.sortNodesLeftToRight();
    this.createISetBMD();
    let rightNodePosition = this.nodes[Math.floor(this.nodes.length / 2)].position;
    let leftNodePosition = this.nodes[Math.floor(this.nodes.length / 2) - 1].position;
    this.label.position.set((rightNodePosition.x + leftNodePosition.x) * 0.5, (rightNodePosition.y + leftNodePosition.y) * 0.5);
    this.updateISetLabel();
    this.game.add.tween(this)
      .from({alpha: 0}, 300, Phaser.Easing.Default, true);
  }

  private updateISetLabel() {
    if (this.nodes[0].node.player) {
      this.label.setText(this.nodes[0].node.player.label);
    }
    if (!this.iSet.player) {
      this.label.alpha = 0;
    } else {
      this.label.alpha = 1;
      this.label.fill = Phaser.Color.getWebRGB(this.iSet.player.color);
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
    this.bmd.clear();
    this.bmd.ctx.lineWidth = this.game.height * ISET_LINE_WIDTH;
    this.bmd.ctx.lineCap = 'round';
    this.bmd.ctx.lineJoin = 'round';
    this.bmd.ctx.strokeStyle = '#ffffff';
    this.bmd.ctx.beginPath();
    this.bmd.ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.nodes.length; i++) {
      this.bmd.ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }

    this.bmd.ctx.stroke();

    this.loadTexture(this.bmd);

    this.game.add.existing(this);
    if (this.iSet.player) {
      this.tint = this.iSet.player.color;
    } else {
      this.tint = 0x000000;
    }
    this.alpha = 0.15;
  }

  private createLabel() {

    let rightNodePosition = this.nodes[Math.floor(this.nodes.length / 2)].position;
    let leftNodePosition = this.nodes[Math.floor(this.nodes.length / 2) - 1].position;

    this.label = this.game.add.text((rightNodePosition.x + leftNodePosition.x) * 0.5,
      (rightNodePosition.y + leftNodePosition.y) * 0.5, '', null);
    if (this.nodes[0].node.player) {
      this.label.setText(this.nodes[0].node.player.label);
    }
    this.label.fontSize = this.nodes[0].width * LABEL_SIZE / OVERLAY_SCALE;
    this.label.anchor.set(0.5, 0.5);
    if (!this.iSet.player) {
      this.label.alpha = 0;
    } else {
      this.label.fill = Phaser.Color.getWebRGB(this.iSet.player.color);
    }
  }

  destroy() {
    this.bmd.destroy();
    this.bmd = null;
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

