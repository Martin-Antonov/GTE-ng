import {ISetView} from '../View/ISetView';
import {CUT_SPRITE_TINT, ISET_LINE_WIDTH} from './Constants';

export class CutSpriteHandler {
  scene: Phaser.Scene;

  cutSprite: Phaser.GameObjects.Sprite;
  cutInformationSet: ISetView;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.cutSprite = this.scene.add.sprite(0, 0, 'scissors');
    this.cutSprite.alpha = 0;
    // P3: What to do?
    // this.cutSprite.tint = CUT_SPRITE_TINT;
    this.cutSprite.displayWidth = this.scene.sys.canvas.height * ISET_LINE_WIDTH;
    this.cutSprite.displayWidth = this.scene.sys.canvas.height * ISET_LINE_WIDTH;
  }

  update() {
    if (!this.cutInformationSet) {
      this.cutSprite.alpha = 0;
      return;
    } else if (this.cutSprite.alpha > 0 && this.cutInformationSet) {
      let mouseXPosition = this.scene.input.mousePointer.x;
      let finalPosition = new Phaser.Math.Vector2();
      let nodeWidth = this.cutInformationSet.nodes[0].displayWidth * 0.5;

      // Limit from the left for X coordinate
      if (mouseXPosition - nodeWidth < this.cutInformationSet.nodes[0].x) {
        finalPosition.x = this.cutInformationSet.nodes[0].x + nodeWidth;
        // Limit from the right for X coordinate
      } else if (mouseXPosition + nodeWidth > this.cutInformationSet.nodes[this.cutInformationSet.nodes.length - 1].x) {
        finalPosition.x = this.cutInformationSet.nodes[this.cutInformationSet.nodes.length - 1].x - nodeWidth;
        // Or just follow the mouse (X coordinate)
      } else {
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
      const closestLeftNodePosition = new Phaser.Math.Vector2(this.cutInformationSet.nodes[closestLeftNodeIndex].x,
        this.cutInformationSet.nodes[closestLeftNodeIndex].y);
      const closestRightNodePosition = new Phaser.Math.Vector2(this.cutInformationSet.nodes[closestLeftNodeIndex + 1].x,
        this.cutInformationSet.nodes[closestLeftNodeIndex + 1].y);
      const proportionInX = (finalPosition.x - closestLeftNodePosition.x) /
        (closestRightNodePosition.x - closestLeftNodePosition.x);
      finalPosition.y = closestLeftNodePosition.y + proportionInX * (closestRightNodePosition.y - closestLeftNodePosition.y);

      this.cutSprite.setPosition(finalPosition.x, finalPosition.y);
      finalPosition = null;
      mouseXPosition = null;
      nodeWidth = null;
    }
  }
}
