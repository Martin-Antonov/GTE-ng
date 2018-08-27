/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {CELL_NUMBER_SIZE, PLAYER_COLORS} from './Constants';

export class SCell extends Phaser.Sprite {

  game: Phaser.Game;
  p1Text: Phaser.Text;
  p2Text: Phaser.Text;

  constructor(game: Phaser.Game, x: number, y: number, p1Payoff: string, p2Payoff: string, group: Phaser.Group) {
    super(game, x, y, game.cache.getBitmapData('cell'));
    group.add(this);
    this.game = game;
    this.anchor.set(0, 0);

    this.p1Text = this.game.add.text(this.position.x + this.width * 0.1, this.position.y + this.width * 0.9, p1Payoff, null);
    this.p1Text.anchor.set(0, 1);
    this.p1Text.fontSize = this.width * CELL_NUMBER_SIZE;
    this.p1Text.fontWeight = 100;
    this.p1Text.fill = Phaser.Color.getWebRGB(PLAYER_COLORS[0]);

    this.p2Text = this.game.add.text(this.position.x + this.width * 0.9, this.position.y + this.width * 0.1, p2Payoff, null);
    this.p2Text.anchor.set(1, 0);
    this.p2Text.fontSize = this.width * CELL_NUMBER_SIZE;
    this.p2Text.fontWeight = 100;
    this.p2Text.fill = Phaser.Color.getWebRGB(PLAYER_COLORS[1]);

    group.addMultiple([this.p1Text, this.p2Text]);
  }
}

