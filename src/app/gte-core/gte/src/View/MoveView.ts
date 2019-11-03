import {NodeType} from '../Model/Node';
import {NodeView} from './NodeView';
import {Move} from '../Model/Move';
import {LABEL_METRICS, SUBSCRIPT_METRICS} from '../Utils/Constants';

/** A class which represents how the move looks like, it has a reference to the start and end points and the label text*/
export class MoveView extends Phaser.GameObjects.Image {
  scene: Phaser.Scene;
  from: NodeView;
  to: NodeView;
  label: Phaser.GameObjects.Text;
  subscript: Phaser.GameObjects.Text;
  move: Move;

  constructor(scene: Phaser.Scene, from: NodeView, to: NodeView) {
    super(scene, from.x, from.y, 'line-black');

    this.from = from;
    this.to = to;
    this.move = this.to.node.parentMove;

    this.setPosition(this.from.x, this.from.y);

    this.setOrigin(0.5, 0);

    this.rotation = Phaser.Math.Angle.Between(this.from.x, this.from.y, this.to.x, this.to.y) - Math.PI / 2;
    this.displayHeight = Phaser.Math.Distance.Between(this.from.x, this.from.y, this.to.x, this.to.y);

    this.label = this.scene.add.text(0, 0, this.move.label, {
      align: 'center',
      fontFamily: 'Arial',
      fontStyle: 'bold italics',
      fontSize: this.from.circle.displayWidth,
      metrics: LABEL_METRICS
    }).setOrigin(0.5, 0.5)
      .setPadding(3, 0, 3, 0);

    this.label.setInteractive();
    this.subscript = this.scene.add.text(0, 0, this.move.subscript, {
      align: 'center',
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fontSize: this.from.circle.displayWidth * 0.75,
      metrics: SUBSCRIPT_METRICS
    })
      .setOrigin(0, 0.5)
      .setPadding(0, 0, 3, 0);
    this.setDepth(-1);
    this.scene.add.existing(this);
  }

  /** A method for repositioning the Move, once we have changed the position of the start or finish node */
  updateMovePosition() {
    this.rotation = Phaser.Math.Angle.Between(this.from.x, this.from.y, this.to.x, this.to.y) - Math.PI / 2;
    this.displayHeight = Phaser.Math.Distance.Between(this.from.x, this.from.y, this.to.x, this.to.y);
    this.setPosition(this.from.x, this.from.y);
    this.alpha = 1;
    this.label.alpha = 1;
    this.subscript.alpha = 1;
    this.setTexture('line-black');
    this.move.isBestInductionMove = false;
  }

  updateLabel(fractionOn: boolean, levelHeight: number) {
    // Set Label texts
    if (this.move.from.type === NodeType.CHANCE && this.move.probability !== null) {
      this.label.text = this.move.getProbabilityText(fractionOn);
      this.subscript.text = '';
    } else if (this.move.from.type === NodeType.OWNED && this.move.label) {
      this.label.text = this.move.label;
      if (this.move.subscript) {
        this.subscript.text = this.move.subscript;
      } else {
        this.subscript.text = '';
      }
    } else {
      this.label.text = '';
      this.label.alpha = 0;
      this.subscript.text = '';
      this.subscript.alpha = 0;
    }

    // Calculate positions of texts
    let labelPos = new Phaser.Math.Vector2(this.from.x, this.from.y);
    let direction = new Phaser.Math.Vector2(this.to.x - this.from.x, this.to.y - this.from.y);
    direction = direction.normalize();
    direction = direction.scale(levelHeight * 0.6);
    labelPos = labelPos.add(direction);
    if (this.rotation > 0) {
      labelPos.x = labelPos.x - this.label.displayWidth * 0.6 - this.subscript.displayWidth;
    } else {
      // 3 is the padding of the label
      labelPos.x = labelPos.x + this.label.displayWidth * 0.6 + 3;
    }
    this.label.x = labelPos.x;
    this.label.y = labelPos.y - this.label.displayHeight * 0.3;
    this.subscript.x = this.label.x + this.label.displayWidth / 2 - 5;
    this.subscript.y = this.label.y + this.subscript.displayHeight / 2;

    // Set font styles of text
    let color = '#000';
    if (this.move.from.type === NodeType.OWNED) {
      this.label.setColor(this.from.node.player.color.toString())
        .setFontStyle('italic')
        .setFontSize(this.from.circle.displayWidth * 1.28);
      color = this.from.node.player.color.toString();
    } else if (this.move.from.type === NodeType.CHANCE) {
      this.label.setColor('#000')
        .setFontStyle('normal')
        .setFontSize(this.from.circle.displayWidth * 1.05);
    }
    this.subscript.setColor(color);
  }

  setOwnerColor() {
    let result = '';
    switch (this.from.node.player.id) {
      case 1:
        result = 'line-red';
        break;
      case 2:
        result = 'line-blue';
        break;
      case 3:
        result = 'line-green';
        break;
      case 4:
        result = 'line-purple';
        break;
      default:
        result = 'line-black';
        break;
    }
    this.setTexture(result);
  }

  destroy() {
    this.from = null;
    this.to = null;
    this.label.destroy();
    this.subscript.destroy();
    super.destroy();
  }
}

