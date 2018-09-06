/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {
  CELL_STROKE_WIDTH, CELL_WIDTH,
  INTRO_RADIUS,
  LINE_WIDTH,
  NODE_RADIUS,
  NODE_SCALE
} from './Constants';

/** A class for the initial animation of the GTE software
 * This class shows a very simple usage of the Phaser Engine - sprites, colours, bitmaps, repositioning and tweens
 * Here we also preload all sprites that will be used*/
export class InitialBitmapsCreator {
  game: Phaser.Game;
  bmd: Phaser.BitmapData;
  text: Phaser.Text;
  distance: number;
  radius: number;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.stage.backgroundColor = '#fff';
    this.radius = this.game.height * INTRO_RADIUS;
    this.createTextures();
    this.createBitmapPoint();
    this.createBitmapLine();
    this.createCell();
    this.createHoverCircle();
  }


  createBitmapPoint() {
    this.bmd = this.game.make.bitmapData(this.game.height * 0.04, this.game.height * 0.04, 'point', true);
    this.bmd.ctx.fillStyle = '#000000';
    this.bmd.ctx.arc(this.bmd.width / 2, this.bmd.height / 2, this.radius, 0, Math.PI * 2);
    this.bmd.ctx.fill();
  }


  createBitmapLine() {
    this.bmd = this.game.make.bitmapData(1, 1, 'line', true);
    this.bmd.ctx.fillStyle = '#ffffff';
    this.bmd.ctx.fillRect(0, 0, 1, 1);
  }

  createTextures() {
    this.bmd = this.game.make.bitmapData(this.game.height * NODE_RADIUS * NODE_SCALE,
      this.game.height * NODE_RADIUS * NODE_SCALE, 'node-square', true);
    this.bmd.ctx.fillStyle = '#fff';
    this.bmd.ctx.fillRect(0, 0, this.game.height * NODE_RADIUS * NODE_SCALE,
      this.game.height * NODE_RADIUS * NODE_SCALE);

    this.bmd = this.game.make.bitmapData(Math.round(this.game.height * LINE_WIDTH),
      Math.round(this.game.height * LINE_WIDTH), 'move-line', true);
    this.bmd.ctx.fillStyle = '#fff';
    this.bmd.ctx.fillRect(0, 0, this.bmd.height, this.bmd.height);
  }

  createHoverCircle() {
    this.bmd = this.game.make.bitmapData(300, 300, 'hover-circle', true);
    this.bmd.ctx.fillStyle = '#ffffff';
    this.bmd.ctx.arc(this.bmd.width / 2, this.bmd.height / 2, 150, 0, Math.PI * 2);
    this.bmd.ctx.fill();
  }

  createCell() {
    const cellWidth = CELL_WIDTH * this.game.width;
    this.bmd = this.game.make.bitmapData(cellWidth, cellWidth, 'cell', true);
    this.bmd.ctx.strokeStyle = '#000000';
    this.bmd.ctx.lineWidth = cellWidth * CELL_STROKE_WIDTH;
    this.bmd.ctx.strokeRect(0, 0, cellWidth, cellWidth);
  }
}

