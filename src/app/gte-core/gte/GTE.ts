/// <reference path="../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {MainScene} from './src/Controller/MainScene';

export class GTE extends Phaser.Game {
  game: Phaser.Game;

  constructor(width?: number, height?: number) {

    super(width, height, Phaser.CANVAS, 'phaser-div', null, false, true);

    this.game = this;
    // this.game.state.add('Boot', Boot, false);
    this.game.state.add('MainScene', MainScene, true);
    // this.game.state.start('Boot');
  }
}


