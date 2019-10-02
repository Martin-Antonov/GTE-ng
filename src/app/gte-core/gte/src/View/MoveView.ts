/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />


import {NodeType} from '../Model/Node';
import {NodeView} from './NodeView';
import {Move} from '../Model/Move';

/** A class which represents how the move looks like, it has a reference to the start and end points and the label text*/
export class MoveView extends Phaser.Sprite {
  game: Phaser.Game;
  from: NodeView;
  to: NodeView;
  label: Phaser.Text;
  subscript: Phaser.Text;
  move: Move;

  constructor(game: Phaser.Game, from: NodeView, to: NodeView) {
    super(game, from.x, from.y, game.cache.getBitmapData('move-line'));

    this.from = from;
    this.to = to;
    this.move = this.to.node.parentMove;

    this.position = this.from.position;
    this.tint = 0x000000;
    this.anchor.set(0.5, 0);

    this.rotation = Phaser.Point.angle(this.from.position, this.to.position) + Math.PI / 2;
    this.height = Phaser.Point.distance(this.from.position, this.to.position);

    this.label = this.game.add.text(0, 0, this.move.label, null);
    this.label.anchor.set(0.5, 0.5);
    this.label.padding.x = 3;
    this.label.align = 'center';
    this.label.fontWeight = 200;
    this.label.inputEnabled = true;
    this.label.events.onInputOver.add(() => {
      this.game.canvas.style.cursor = 'text';
    });
    this.label.events.onInputOut.add(() => {
      this.game.canvas.style.cursor = 'default';
    });


    this.subscript = this.game.add.text(0, 0, this.move.subscript, null);
    this.subscript.anchor.set(0, 0.5);
    this.subscript.padding.x = 3;
    this.subscript.align = 'center';
    this.subscript.fontWeight = 200;
    this.subscript.fontStyle = 'normal';
    this.subscript.fontSize = this.from.width * 0.75;

    this.game.add.existing(this);
    this.game.world.sendToBack(this);
  }

  /** A method for repositioning the Move, once we have changed the position of the start or finish node */
  updateMovePosition() {
    this.rotation = Phaser.Point.angle(this.from.position, this.to.position) + Math.PI / 2;
    this.height = Phaser.Point.distance(this.from.position, this.to.position);
    this.alpha = 1;
    this.label.alpha = 1;
    this.subscript.alpha = 1;
    this.tint = 0x000000;
    this.move.isBestInductionMove = false;
  }

  updateLabel(fractionOn: boolean, levelHeight: number) {
    // Set Label texts
    if (this.move.from.type === NodeType.CHANCE && this.move.probability !== null) {
      this.label.text = this.move.getProbabilityText(fractionOn);
      this.subscript.text = '';
    }
    else if (this.move.from.type === NodeType.OWNED && this.move.label) {
      this.label.text = this.move.label;
      if (this.move.subscript) {
        this.subscript.text = this.move.subscript;
      }
      else {
        this.subscript.text = '';
      }
    }
    else {
      this.label.text = '';
      this.label.alpha = 0;
      this.subscript.text = '';
      this.subscript.alpha = 0;
    }

    // Calculate positions of texts
    let labelPosition = this.from.position.clone();
    let direction = new Phaser.Point(this.to.position.x - this.from.position.x, this.to.position.y - this.from.position.y);
    direction.normalize();
    direction.setMagnitude(levelHeight * 0.6);
    labelPosition.add(direction.x, direction.y);
    if (this.rotation > 0) {
      labelPosition.x = labelPosition.x - this.label.width * 0.6 - this.subscript.width;
    }
    else {
      labelPosition.x = labelPosition.x + this.label.width * 0.6 + this.label.padding.x;
    }
    this.label.x = labelPosition.x;
    this.label.y = labelPosition.y - this.label.height * 0.3;
    this.subscript.x = this.label.x + this.label.width / 2 - 5;
    this.subscript.y = this.label.y + this.subscript.height / 2;

    // Set font styles of text
    if (this.move.from.type === NodeType.OWNED) {
      let colorRGB = Phaser.Color.getRGB(this.from.node.player.color);
      this.label.fill = Phaser.Color.RGBtoString(colorRGB.r, colorRGB.g, colorRGB.b);
      this.label.fontStyle = 'italic';
      this.label.fontSize = this.from.width * 1.28;
    }
    else if (this.move.from.type === NodeType.CHANCE) {
      this.label.fill = '#000';
      this.label.fontStyle = 'normal';
      this.label.fontSize = this.from.width * 1.05;
    }
    this.subscript.fill = this.label.fill;
  }

  destroy() {
    this.from = null;
    this.to = null;
    this.label.destroy();
    this.subscript.destroy();
    super.destroy();
  }
}

