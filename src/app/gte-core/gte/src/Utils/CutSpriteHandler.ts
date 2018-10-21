/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
import {ISetView} from '../View/ISetView';
import {CUT_SPRITE_TINT, ISET_LINE_WIDTH} from './Constants';

export class CutSpriteHandler {
  cutSprite: Phaser.Sprite;
  cutInformationSet: ISetView;
  game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;

    this.cutSprite = this.game.add.sprite(0, 0, 'scissors');
    this.cutSprite.anchor.set(0.5, 0.5);
    this.cutSprite.alpha = 0;
    this.cutSprite.tint = CUT_SPRITE_TINT;
    this.cutSprite.width = this.game.height * ISET_LINE_WIDTH;
    this.cutSprite.height = this.game.height * ISET_LINE_WIDTH;
  }

  update() {
    if (!this.cutInformationSet) {
      this.cutSprite.alpha = 0;
      return;
    }
    else if (this.cutSprite.alpha > 0 && this.cutInformationSet) {
      let mouseXPosition = this.game.input.mousePointer.x;
      let finalPosition = new Phaser.Point();
      let nodeWidth = this.cutInformationSet.nodes[0].width * 0.5;

      // Limit from the left for X coordinate
      if (mouseXPosition - nodeWidth < this.cutInformationSet.nodes[0].x) {
        finalPosition.x = this.cutInformationSet.nodes[0].x + nodeWidth;
      }
      // Limit from the right for X coordinate
      else if (mouseXPosition + nodeWidth > this.cutInformationSet.nodes[this.cutInformationSet.nodes.length - 1].x) {
        finalPosition.x = this.cutInformationSet.nodes[this.cutInformationSet.nodes.length - 1].x - nodeWidth;
      }
      // Or just follow the mouse (X coordinate)
      else {
        finalPosition.x = mouseXPosition;
      }

      let closestLeftNodeIndex;

      // Find the two consecutive nodes where the sprite is
      for (let i = 0; i < this.cutInformationSet.nodes.length - 1; i++) {
        if (finalPosition.x >= this.cutInformationSet.nodes[i].x && finalPosition.x <= this.cutInformationSet.nodes[i + 1].x) {
          closestLeftNodeIndex = i;
        }
      }

      // set the y difference to be proportional to the x difference
      const closestLeftNodePosition = this.cutInformationSet.nodes[closestLeftNodeIndex].position;
      const closestRightNodePosition = this.cutInformationSet.nodes[closestLeftNodeIndex + 1].position;
      const proportionInX = (finalPosition.x - closestLeftNodePosition.x) /
        (closestRightNodePosition.x - closestLeftNodePosition.x);
      // console.log(proportionInX);
      finalPosition.y = closestLeftNodePosition.y + proportionInX * (closestRightNodePosition.y - closestLeftNodePosition.y);

      this.cutSprite.position.x = finalPosition.x;
      this.cutSprite.position.y = finalPosition.y;

      finalPosition = null;
      mouseXPosition = null;
      nodeWidth = null;
    }
  }
}
