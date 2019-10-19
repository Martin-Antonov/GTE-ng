import {LABEL_SIZE, NODE_SELECTED_COLOR, OVERLAY_SCALE, PAYOFF_SIZE, PLAYER_COLORS, SELECTION_INNER_COLOR} from '../Utils/Constants';
import {Node, NodeType} from '../Model/Node';

/** A class for the graphical representation of the Node. The inherited sprite from Phaser.Sprite will not be visible
 * and will only detect input on the node. The private fields circle and square are the visible ones, depending on whether
 * the node (of type Node) is chance or not. */
export class NodeView extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  node: Node;

  // The input handler will fire signals when the node is pressed, hovered and hovered-out
  ownerLabel: Phaser.GameObjects.Text;
  payoffsLabel: Phaser.GameObjects.Text;
  isSelected: boolean;
  level: number;
  private previewSelected: Phaser.GameObjects.Sprite;
  // Horizontal offset: -1 for left, 1 for right;
  labelHorizontalOffset: number;

  constructor(scene: Phaser.Scene, node: Node, x?: number, y?: number) {
    super(scene, x, y, 'circle-black');

    this.setInteractive();
    this.isSelected = false;
    // P3: What to do here?
    // this.input.priorityID = 2;

    this.node = node;
    this.level = this.node.depth;
    if (this.node.player) {
      // P3: What to do here?
      this.tint = node.player.color;
    } else {
      // P3: What to do here?
      this.tint = 0x000000;
    }

    this.labelHorizontalOffset = 1;
    this.createSprites();
    this.createLabels();
    // P3: What to do here?
    // this.input.priorityID = 1;
    this.scene.add.existing(this);
  }

  /** A method which creates the circle and square sprites*/
  private createSprites() {
    this.previewSelected = this.scene.add.sprite(this.x, this.y, 'circle-preview')
      .setScale(1.8, 1.8)
      .setPosition(this.x, this.y)
      .setAlpha(0);
  }

  /** A method which creates the label for the Node*/
  private createLabels() {
    const text = this.node.player ? this.node.player.label : '';
    const color = this.node.player ? this.node.player.color : 0x000000;
    this.ownerLabel = this.scene.add.text(this.x + this.labelHorizontalOffset * this.displayWidth, this.y - this.displayWidth, text)
      .setFontSize(this.displayWidth * LABEL_SIZE)
      .setColor(color.toString());
    this.ownerLabel.setInteractive();

    this.payoffsLabel = this.scene.add.text(this.x, this.y + this.displayWidth * OVERLAY_SCALE, '',)
      .setFontSize(this.displayWidth * PAYOFF_SIZE)
      .setOrigin(0.5, 0)
      .setFontStyle('bolder')
      .setAlign('right');
    this.payoffsLabel.setInteractive();
    this.payoffsLabel.lineSpacing = -10;
    // P3: What to do?
    // this.payoffsLabel.input.priorityID = 199;
  }

  updateLabelPosition() {
    if (this.node.parent && this.node.parent.children.indexOf(this.node) < this.node.parent.children.length / 2) {
      this.labelHorizontalOffset = -1;
      this.ownerLabel.setOrigin(1, 0.5);
    } else {
      this.labelHorizontalOffset = 1;
      this.ownerLabel.setOrigin(0, 0.5);
    }
    this.ownerLabel.setPosition(this.x + this.labelHorizontalOffset * this.displayWidth * 0.75, this.y - this.displayWidth);
  }

  /** A method which converts the node, depending on whether it is a chance, owned or default.*/
  resetNodeDrawing(areLeavesActive: boolean, zeroSumOn: boolean) {
    // If Owned
    if (this.node.type === NodeType.OWNED) {
      this.setTexture(this.getColorFromPlayerId());
      this.alpha = 1;
      if (this.node.iSet) {
        this.ownerLabel.alpha = 0;
      } else {
        this.ownerLabel.alpha = 1;
        this.ownerLabel.setText(this.node.player.label);
        // P3: Check
        this.ownerLabel.setColor(this.node.player.color.toString());
        this.ownerLabel.setScale(1);
      }
    }

    // If Chance
    if (this.node.type === NodeType.CHANCE) {
      this.setTexture('square');
      this.ownerLabel.setScale(0.5);
      this.ownerLabel.alpha = 1;
      this.ownerLabel.setText('chance');
      this.ownerLabel.setColor('#000000');
    } else {
      this.setTexture('circle-black');
    }

    // If Leaf
    if (this.node.type === NodeType.LEAF) {
      this.ownerLabel.alpha = 0;
      if (zeroSumOn) {
        this.node.payoffs.convertToZeroSum();
      }
      if (areLeavesActive) {
        this.alpha = 0;
        this.payoffsLabel.alpha = 1;
        const payoffsString = this.node.payoffs.toString();
        const labelsArray = payoffsString.split(' ');
        this.payoffsLabel.text = '';
        // P3: TODO
        // this.payoffsLabel.clearColors();
        for (let i = 0; i < labelsArray.length; i++) {
          this.payoffsLabel.text += labelsArray[i] + '\n';
          // this.payoffsLabel.addColor(Phaser.Color.getWebRGB(PLAYER_COLORS[i]),
          //   (this.payoffsLabel.text.length - labelsArray[i].length - i - 1));
        }
        this.payoffsLabel.text = this.payoffsLabel.text.slice(0, -1);
        this.payoffsLabel.alpha = 1;
        this.payoffsLabel.input.enabled = true;
      } else {
        this.alpha = 1;
        this.payoffsLabel.alpha = 0;
      }
    }

    // If Default
    if (this.node.type === NodeType.DEFAULT) {
      this.alpha = 1;
      this.setTexture('circle-black');
      this.ownerLabel.alpha = 0;
      this.payoffsLabel.alpha = 0;
    }

    // If Selected
    if (this.isSelected) {
      this.previewSelected.alpha = 0.3;
    } else {
      this.previewSelected.alpha = 0;
      if (this.node.player) {
        this.setTexture(this.getColorFromPlayerId());
      } else {
        this.setTexture('circle-black');
      }
    }

    this.updateLabelPosition();
  }

  private getColorFromPlayerId() {
    let result = '';
    switch (this.node.player.id) {
      case 1:
        result = 'circle-red';
        break;
      case 2:
        result = 'circle-blue';
        break;
      case 3:
        result = 'circle-green';
        break;
      case 4:
        result = 'circle-purple';
        break;
      default:
        result = 'circle-black';
        break;
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
    this.tint = null;
    this.scale = null;
    this.labelHorizontalOffset = null;
    super.destroy();
  }
}

