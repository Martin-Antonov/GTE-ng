import {
  CHANCE_NODE_SCALE, LINE_WIDTH, NODE_RADIUS, PREVIEW_CIRCLE_COLOR, PREVIEW_CIRCLE_SCALE,
} from './Constants';

/** A class for the initial animation of the GTE software
 * This class shows a very simple usage of the Phaser Engine - sprites, colours, bitmaps, repositioning and tweens
 * Here we also preload all sprites that will be used*/
export class InitialBitmapsCreator {
  scene: Phaser.Scene;
  graphics: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  radius: number;
  width: number;
  height: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.width = this.scene.sys.canvas.width;
    this.height = this.scene.sys.canvas.height;

    this.radius = this.height * NODE_RADIUS;
    this.createTextures();
  }

  createTextures() {
    // 1 extra pixel on each side, just in case
    this.graphics = this.scene.make.graphics({x: 0, y: 0});
    this.generateCircle(0x000000, 'circle-black');
    this.generateCircle(0xff0000, 'circle-red');
    this.generateCircle(0x0000ff, 'circle-blue');
    this.generateCircle(0x00bb00, 'circle-green');
    this.generateCircle(0xff00ff, 'circle-purple');

    this.graphics.clear();
    const previewRadius = this.radius * PREVIEW_CIRCLE_SCALE;
    const diameter = previewRadius * 2 + 4;
    this.graphics.fillStyle(PREVIEW_CIRCLE_COLOR);
    this.graphics.fillCircle(previewRadius + 2, previewRadius + 2, previewRadius);
    this.graphics.generateTexture('circle-preview', diameter, diameter);

    // Square
    this.graphics.clear();
    const squareWidth = this.radius * CHANCE_NODE_SCALE;
    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(1, 1, squareWidth, squareWidth);
    this.graphics.generateTexture('square', squareWidth + 1, squareWidth + 1);

    // Dot
    this.graphics.clear();
    this.graphics.fillStyle(0x0389df);
    this.graphics.fillRect(0, 0, 1, 1);
    this.graphics.generateTexture('dot', 1, 1);

    // Line (originally move-line)
    this.generateLine(0x000000, 'line-black');
    this.generateLine(0xff0000, 'line-red');
    this.generateLine(0x0000ff, 'line-blue');
    this.generateLine(0x00bb00, 'line-green');
    this.generateLine(0xff00ff, 'line-purple');
  }

  private generateCircle(color: number, texture: string) {
    const diameter = this.radius * 2 + 4;
    this.graphics.clear();
    this.graphics.fillStyle(color);
    this.graphics.fillCircle(this.radius + 2, this.radius + 2, this.radius);
    this.graphics.generateTexture(texture, diameter, diameter);
  }

  private generateLine(color: number, texture: string) {
    this.graphics.clear();
    this.graphics.fillStyle(color);
    this.graphics.fillRect(0, 0, this.height * LINE_WIDTH, this.height * LINE_WIDTH);
    this.graphics.generateTexture(texture, this.height * LINE_WIDTH, this.height * LINE_WIDTH);
  }
}

