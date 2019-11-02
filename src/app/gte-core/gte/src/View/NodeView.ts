import {LABEL_SIZE, OVERLAY_SCALE, PAYOFF_SIZE, PLAYER_COLORS, SELECTION_INNER_COLOR} from '../Utils/Constants';
import {Node, NodeType} from '../Model/Node';

/** A class for the graphical representation of the Node. The inherited sprite from Phaser.Sprite will not be visible
 * and will only detect input on the node. The private fields circle and square are the visible ones, depending on whether
 * the node (of type Node) is chance or not. */
export class NodeView extends Phaser.GameObjects.Container {
  scene: Phaser.Scene;
  node: Node;

  circle: Phaser.GameObjects.Sprite;
  ownerLabel: Phaser.GameObjects.Text;
  payoffsLabel: Phaser.GameObjects.Text;
  isSelected: boolean;
  level: number;
  private previewSelected: Phaser.GameObjects.Sprite;

  // Horizontal offset: -1 for left, 1 for right;
  labelHorizontalOffset: number;

  constructor(scene: Phaser.Scene, node: Node, x?: number, y?: number) {
    super(scene, x, y);
    this.isSelected = false;

    this.node = node;
    this.level = this.node.depth;

    this.labelHorizontalOffset = 1;
    this.createSprites();
    this.createLabels();

    this.scene.add.existing(this);
  }

  /** A method which creates the circle and square sprites*/
  private createSprites() {
    this.circle = this.scene.add.sprite(0, 0, 'circle-black');
    this.circle.setInteractive();

    this.previewSelected = this.scene.add.sprite(0, 0, 'circle-preview')
      .setAlpha(0)
      .setDepth(1);

    this.add([this.circle, this.previewSelected]);
  }

  /** A method which creates the label for the Node*/
  private createLabels() {
    const text = this.node.player ? this.node.player.label : '';
    const color = this.node.player ? this.node.player.color : '#000000';

    this.ownerLabel = this.scene.add.text(this.labelHorizontalOffset * this.circle.displayWidth * 0.75, -this.circle.displayWidth, text, {
      fontSize: this.circle.displayWidth * LABEL_SIZE,
      color: color,
      fontStyle: 'bold',
      fontFamily: 'Arial',
    });

    this.ownerLabel.setInteractive();

    this.payoffsLabel = this.scene.add.text(0, 0, '', {
      fontSize: this.circle.displayWidth * PAYOFF_SIZE,
      fontStyle: 'bold',
      align: 'right',
      fontFamily: 'Arial',
      color: '#000'
    }).setOrigin(0.5, 0);

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
    // If Selected
    if (this.isSelected) {
      this.previewSelected.alpha = 0.3;
    } else {
      this.previewSelected.alpha = 0;
    }

    // If Owned
    if (this.node.type === NodeType.OWNED) {
      this.circle.setTexture(this.getColorFromPlayerId());
      this.circle.alpha = 1;
      if (this.node.iSet) {
        this.ownerLabel.alpha = 0;
      } else {
        this.ownerLabel.alpha = 1;
        this.ownerLabel.setText(this.node.player.label);
        this.ownerLabel.setColor(this.node.player.color);
        this.ownerLabel.setScale(1);
      }
    }

    // If Chance
    if (this.node.type === NodeType.CHANCE) {
      this.circle.setTexture('square');
      this.ownerLabel.setScale(0.5);
      this.ownerLabel.alpha = 1;
      this.ownerLabel.setText('chance');
      this.ownerLabel.setColor('#000000');
    }

    // If Leaf
    if (this.node.type === NodeType.LEAF) {
      this.ownerLabel.alpha = 0;
      this.circle.setTexture('circle-black');
      if (zeroSumOn) {
        this.node.payoffs.convertToZeroSum();
      }
      if (areLeavesActive) {
        this.circle.alpha = 0;
        this.payoffsLabel.alpha = 1;
        const payoffsString = this.node.payoffs.toString();
        const labelsArray = payoffsString.split(' ');
        this.payoffsLabel.text = '';

        // this.payoffsLabel.clearColors();
        for (let i = 0; i < labelsArray.length; i++) {
          this.payoffsLabel.text += labelsArray[i] + '\n';
          // this.payoffsLabel.addColor(Phaser.Color.getWebRGB(PLAYER_COLORS[i]),
          //   (this.payoffsLabel.text.length - labelsArray[i].length - i - 1));
        }
        // this.payoffsLabel.text = this.payoffsLabel.text.slice(0, -1);
        this.payoffsLabel.alpha = 1;
        this.payoffsLabel.input.enabled = true;
      } else {
        this.circle.alpha = 1;
        this.payoffsLabel.setAlpha(0);
      }
    }

    // If Default
    if (this.node.type === NodeType.DEFAULT) {
      this.circle.alpha = 1;
      this.circle.setTexture('circle-black');
      this.ownerLabel.alpha = 0;
      this.payoffsLabel.alpha = 0;
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
    super.destroy();
  }
}

