import {
  INTRO_RADIUS,
  LINE_WIDTH,
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
    this.radius = this.height * INTRO_RADIUS;
    this.createTextures();
  }

  createTextures() {
    // Nodes (originally node-circle, also check hover-circle)
    const nodeRadius = this.height * 0.04;
    this.graphics = this.scene.make.graphics({x: 0, y: 0});
    this.graphics.fillStyle(0x000000);
    this.graphics.fillCircle(nodeRadius / 2, nodeRadius / 2, this.radius);
    this.graphics.generateTexture('circle-black', nodeRadius, nodeRadius);
    this.graphics.fillStyle(0xff0000);
    this.graphics.generateTexture('circle-red', nodeRadius, nodeRadius);
    this.graphics.fillStyle(0x0000ff);
    this.graphics.generateTexture('circle-blue', nodeRadius, nodeRadius);
    this.graphics.fillStyle(0x00ff00);
    this.graphics.generateTexture('circle-green', nodeRadius, nodeRadius);
    this.graphics.fillStyle(0xff00ff);
    this.graphics.generateTexture('circle-purple', nodeRadius, nodeRadius);
    this.graphics.fillStyle(0x0389df);
    this.graphics.generateTexture('circle-preview', nodeRadius, nodeRadius);
    this.graphics.clear();

    // Square
    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(0, 0, nodeRadius, nodeRadius);
    this.graphics.generateTexture('square', nodeRadius, nodeRadius);
    this.graphics.clear();

    // Dot
    this.graphics.fillStyle(0x0389df);
    this.graphics.fillRect(0, 0, 1, 1);
    this.graphics.generateTexture('dot', 1, 1);
    this.graphics.clear();

    // Line (originally move-line)
    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(0, 0, this.height * LINE_WIDTH, this.height * LINE_WIDTH);
    this.graphics.generateTexture('line-black', this.height * LINE_WIDTH, this.height * LINE_WIDTH);
    this.graphics.fillStyle(0xff0000);
    this.graphics.generateTexture('line-red', this.height * LINE_WIDTH, this.height * LINE_WIDTH);
    this.graphics.fillStyle(0x0000ff);
    this.graphics.generateTexture('line-blue', this.height * LINE_WIDTH, this.height * LINE_WIDTH);
    this.graphics.fillStyle(0x00ff00);
    this.graphics.generateTexture('line-green', this.height * LINE_WIDTH, this.height * LINE_WIDTH);
    this.graphics.fillStyle(0xff00ff);
    this.graphics.generateTexture('line-purple', this.height * LINE_WIDTH, this.height * LINE_WIDTH);
  }
}

