/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />


import {ERROR_MESSAGE_COLOR} from './Constants';

/**A class for creating a pop-up error message*/
export class ErrorPopUp {
  game: Phaser.Game;
  fullScreenSprite: Phaser.Sprite;
  errorRectangle: Phaser.Sprite;
  errorMessage: Phaser.Text;

  fullScreenTween: Phaser.Tween;
  errorRectangleTween: Phaser.Tween;
  errorMessageTween: Phaser.Tween;

  constructor(game: Phaser.Game) {
    this.game = game;

    this.createSprites();
  }

  createSprites() {
    this.fullScreenSprite = this.game.add.sprite(0, 0, this.game.cache.getBitmapData('line'));
    this.fullScreenSprite.width = this.game.width;
    this.fullScreenSprite.height = this.game.height;
    this.fullScreenSprite.alpha = 0;
    this.fullScreenSprite.tint = 0x000000;

    this.errorRectangle = this.game.add.sprite(this.game.width / 2, this.game.height / 2, this.game.cache.getBitmapData('line'));
    this.errorRectangle.anchor.set(0.5, 0.5);

    this.errorRectangle.tint = ERROR_MESSAGE_COLOR;
    this.errorRectangle.alpha = 0;

    this.errorMessage = this.game.add.text(this.errorRectangle.x, this.errorRectangle.y, '', {font: 'bold 14pt Arial', align: 'center'});
    this.errorMessage.anchor.set(0.5, 0.5);
    this.errorMessage.alpha = 0;


  }

  show(text: string) {
    this.fullScreenSprite.bringToTop();
    this.errorRectangle.bringToTop();
    this.errorMessage.bringToTop();
    this.errorMessage.text = text;

    this.errorRectangle.width = this.errorMessage.width * 1.2;
    this.errorRectangle.height = this.errorMessage.height + 0.2 * this.errorMessage.width;

    this.fullScreenTween = this.game.add.tween(this.fullScreenSprite).to({alpha: 0.6}, 200, Phaser.Easing.Default, true, 0);
    this.errorRectangleTween = this.game.add.tween(this.errorRectangle).to({alpha: 1}, 300, Phaser.Easing.Default, true, 200);
    this.errorMessageTween = this.game.add.tween(this.errorMessage).to({alpha: 1}, 300, Phaser.Easing.Default, true, 200);

    this.fullScreenTween.yoyo(true, 1700);
    this.errorRectangleTween.yoyo(true, 1500);
    this.errorMessageTween.yoyo(true, 1500);
  }
}

