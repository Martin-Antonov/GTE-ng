import {SELECTION_INNER_COLOR} from './Constants';

/** A class representing the rectangle which selects vertices*/
export class SelectionRectangle extends Phaser.GameObjects.Image {
  scene: Phaser.Scene;

  start: Phaser.Math.Vector2;
  isActive: boolean;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, null);
    this.setTexture('dot');

    this.start = new Phaser.Math.Vector2;
    this.isActive = false;
    this.alpha = 0;
    this.setOrigin(0, 0);
    this.active = true;
    // when we click and hold, we reset the rectangle.
    this.scene.input.on('pointerdown', () => {
      this.isActive = true;
      this.displayWidth = 0;
      this.displayHeight = 0;
      this.start.x = this.scene.input.activePointer.x;
      this.start.y = this.scene.input.activePointer.y;
      this.setPosition(this.start.x, this.start.y);
      this.alpha = 0.3;
      this.scene.time.addEvent({
        delay: 101,
        callback: () => {
          if (this.scene.input.activePointer.isDown) {
            this.scene.sys.canvas.style.cursor = 'crosshair';
          }
        }
      });
    });

    // When we release, reset the rectangle
    this.scene.input.on('pointerup', () => {
      this.scene.sys.canvas.style.cursor = 'default';
      if (this.isActive) {
        this.alpha = 0;
        this.displayWidth = 0;
        this.displayHeight = 0;
        this.isActive = false;
      }
    });
    this.scene.input.on('gameout', () => {
      this.scene.input.emit('pointerup');
    });
    // On dragging, update the transform of the rectangle*/
    this.scene.input.on('pointermove', () => {
      if (this.scene.input.activePointer.isDown && this.active && this.alpha !== 0) {
        this.displayWidth = Math.abs(this.scene.input.activePointer.x - this.start.x);
        this.displayHeight = Math.abs(this.scene.input.activePointer.y - this.start.y);

        this.displayOriginX = (this.scene.input.activePointer.x - this.start.x) < 0 ? 1 : 0;
        this.displayOriginY = (this.scene.input.activePointer.y - this.start.y) < 0 ? 1 : 0;
      }
    });
    this.scene.add.existing(this);
  }
}

