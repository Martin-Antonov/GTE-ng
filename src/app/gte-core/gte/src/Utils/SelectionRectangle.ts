/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {SELECTION_INNER_COLOR} from './Constants';

/** A class representing the rectangle which selects vertices*/
export class SelectionRectangle extends Phaser.Sprite {
  start: Phaser.Point;
  active: boolean;

  constructor(game: Phaser.Game) {
    super(game, 0, 0);
    this.loadTexture(this.game.cache.getBitmapData('line'));

    this.start = new Phaser.Point();
    this.tint = SELECTION_INNER_COLOR;

    this.alpha = 0;

    this.active = true;
    // when we click and hold, we reset the rectangle.
    this.game.input.onDown.add(() => {
      if (this.active) {
        this.game.canvas.style.cursor = 'crosshair';
        this.width = 0;
        this.height = 0;
        this.start.x = this.game.input.activePointer.position.x;
        this.start.y = this.game.input.activePointer.position.y;
        this.position = this.start;
        this.alpha = 0.3;
      }
    }, this);


    // When we release, reset the rectangle
    this.game.input.onUp.add(() => {
      this.game.canvas.style.cursor = 'default';
      if (this.active) {
        this.alpha = 0;
        this.width = 0;
        this.height = 0;
      }
    });
    // On dragging, update the transform of the rectangle*/
    this.game.input.addMoveCallback(this.onDrag, this);
    this.game.add.existing(this);
  }

  /** The method which resizes the rectangle as we drag*/
  onDrag() {
    if (this.game.input.activePointer.isDown && this.active && this.alpha !== 0) {
      this.height = this.game.input.activePointer.y - this.start.y;
      this.width = this.game.input.activePointer.x - this.start.x;
    }
  }
}

