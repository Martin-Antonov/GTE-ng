import {
  LABEL_SIZE,
  NODE_RADIUS,
  PAYOFF_SIZE,
  PLAYER_COLORS, PLAYER_COLORS_NUMBER,
  PREVIEW_CIRCLE_COLOR,
  PREVIEW_CIRCLE_SCALE
} from '../Utils/Constants';
import {Node, NodeType} from '../Model/Node';

/** A class for the graphical representation of the Node. The inherited sprite from Phaser.Sprite will not be visible
 * and will only detect input on the node. The private fields circle and square are the visible ones, depending on whether
 * the node (of type Node) is chance or not. */
export class NodeView extends Phaser.GameObjects.Container {
  scene: Phaser.Scene;
  node: Node;

  circle: Phaser.GameObjects.Arc;
  private previewSelected: Phaser.GameObjects.Arc;
  private square: Phaser.GameObjects.Rectangle;

  ownerLabel: Phaser.GameObjects.Text;
  payoffsLabel: Phaser.GameObjects.Text;

  isSelected: boolean;
  level: number;
  // Horizontal offset: -1 for left, 1 for right;
  labelHorizontalOffset: number;
  private radius: number;

  constructor(scene: Phaser.Scene, node: Node, x?: number, y?: number) {
    super(scene, x, y);
    this.isSelected = false;
    this.radius = this.scene.sys.canvas.height * NODE_RADIUS;

    this.node = node;
    this.level = this.node.depth;

    this.labelHorizontalOffset = 1;
    this.createSprites();
    this.createLabels();

    this.scene.add.existing(this);
  }

  /** A method which creates the circle and square sprites*/
  private createSprites() {
    this.circle = this.scene.add.circle(0, 0, this.radius, 0x000000);
    this.circle.setInteractive();

    this.previewSelected = this.scene.add.circle(0, 0, this.radius * PREVIEW_CIRCLE_SCALE, PREVIEW_CIRCLE_COLOR)
      .setAlpha(0)
      .setDepth(1);

    this.square = this.scene.add.rectangle(0, 0, this.radius * 2, this.radius * 2, 0x000000)
      .setAlpha(0);
    // this.test = this.scene.add.dom(0, 0, 'div', null, '0\n0\n0\n0');
    // this.test.setOrigin(0.5, 0);
    this.add([this.circle, this.square, this.previewSelected]);
  }

  /** A method which creates the label for the Node*/
  private createLabels() {
    const text = this.node.player ? this.node.player.label : '';
    const color = this.node.player ? this.node.player.color : '#000000';

    this.ownerLabel = this.scene.add.text(this.labelHorizontalOffset * this.circle.displayWidth * 0.75, -this.circle.displayWidth, text, {
      color: color,
      fontStyle: 'bold',
      fontFamily: 'Arial',
    }).setFontSize(this.circle.displayWidth * LABEL_SIZE);
    this.ownerLabel.setInteractive();
    const payoffsFontSize = Math.round(this.circle.displayWidth * PAYOFF_SIZE);
    this.payoffsLabel = this.scene.add.text(0, 0, '', {
      fontStyle: 'bold',
      align: 'right',
      fontFamily: 'Arial',
      color: '#000',
    }).setOrigin(0.5, 0)
      .setFontSize(payoffsFontSize);

    // Create gradient
    const grd = this.scene.sys.canvas.getContext('2d').createLinearGradient(0, 0, 0, payoffsFontSize * 4 - 5);
    grd.addColorStop(0.000, 'rgba(255, 0, 0, 1.000)');
    grd.addColorStop(0.249, 'rgba(255, 0, 0, 1.000)');
    grd.addColorStop(0.250, 'rgba(0, 0, 255, 1.000)');
    grd.addColorStop(0.499, 'rgba(0, 0, 255, 1.000)');
    grd.addColorStop(0.500, 'rgba(0, 187, 0, 1.000)');
    grd.addColorStop(0.749, 'rgba(0, 187, 0, 1.000)');
    grd.addColorStop(0.750, 'rgba(255, 0, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(255, 0, 255, 1.000)');
    this.payoffsLabel.setFill(grd);

    this.payoffsLabel.setInteractive();
    this.payoffsLabel.lineSpacing = -5;
    this.add([this.payoffsLabel, this.ownerLabel]);
  }

  updateLabelPosition() {
    if (this.node.parent && this.node.parent.children.indexOf(this.node) < this.node.parent.children.length / 2) {
      this.labelHorizontalOffset = -1;
      this.ownerLabel.setOrigin(1, 0.5);
    } else {
      this.labelHorizontalOffset = 1;
      this.ownerLabel.setOrigin(0, 0.5);
    }
    this.ownerLabel.setPosition(this.labelHorizontalOffset * this.circle.displayWidth * 0.75, -this.circle.displayWidth);
  }

  /** A method which converts the node, depending on whether it is a chance, owned or default.*/
  resetNodeDrawing(areLeavesActive: boolean, zeroSumOn: boolean) {
    this.square.setAlpha(0);
    // If Selected
    if (this.isSelected) {
      this.previewSelected.setAlpha(0.3);
    } else {
      this.previewSelected.setAlpha(0);
    }

    // If Owned
    if (this.node.type === NodeType.OWNED) {
      this.circle.setFillStyle(this.getColorFromPlayerId());
      this.circle.setAlpha(1);
      if (this.node.iSet) {
        this.ownerLabel.setAlpha(0);
      } else {
        this.ownerLabel.setText(this.node.player.label)
          .setColor(this.node.player.color)
          .setScale(1)
          .setAlpha(1);
      }
    }

    // If Chance
    if (this.node.type === NodeType.CHANCE) {
      this.square.setAlpha(1);
      this.circle.setAlpha(0);

      this.ownerLabel.setScale(0.5);
      this.ownerLabel.setAlpha(1);
      this.ownerLabel.setText('chance');
      this.ownerLabel.setColor('#000000');
    }

    // If Leaf
    if (this.node.type === NodeType.LEAF) {
      this.ownerLabel.setAlpha(0);
      this.circle.setFillStyle(this.getColorFromPlayerId());
      if (zeroSumOn) {
        this.node.payoffs.convertToZeroSum();
      }
      if (areLeavesActive) {
        this.circle.setAlpha(0);
        this.payoffsLabel.setAlpha(1);
        const payoffsString = this.node.payoffs.toString();
        const labelsArray = payoffsString.split(' ');
        let payoffsText = '';

        for (let i = 0; i < labelsArray.length; i++) {
          payoffsText += labelsArray[i] + '\n';
        }
        this.payoffsLabel.setText(payoffsText);
        this.payoffsLabel.setAlpha(1);
        this.payoffsLabel.input.enabled = true;
      } else {
        this.circle.alpha = 1;
        this.payoffsLabel.setAlpha(0);
      }
    }

    // If Default
    if (this.node.type === NodeType.DEFAULT) {
      this.circle.alpha = 1;
      this.circle.setFillStyle(this.getColorFromPlayerId());
      this.ownerLabel.alpha = 0;
      this.payoffsLabel.alpha = 0;
    }

    this.updateLabelPosition();
  }

  private getColorFromPlayerId() {
    let result = 0x000000;
    if (this.node && this.node.player && this.node.player.id) {
      result = PLAYER_COLORS_NUMBER[this.node.player.id - 1];
    }
    return result;
  }

  /** The destroy method of the node which prevents memory-leaks*/
  destroy() {
    this.node = null;
    this.previewSelected.destroy();
    this.previewSelected = null;
    this.ownerLabel.destroy();
    this.ownerLabel = null;
    this.payoffsLabel.destroy();
    this.payoffsLabel = null;
    super.destroy();
  }
}

