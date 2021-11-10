/** A class that stores the level height and initial width of whe tree
 * All properties are given a fractions of the game width and height!*/
import {Direction} from './Direction';

export class TreeViewProperties {
  levelHeight: number;
  treeWidth: number;
  zeroSumOn: boolean;
  fractionOn: boolean;
  automaticLevelAdjustment: boolean;
  treeDirection: Direction;

  constructor(levelHeight: number, initialLevelDistance: number) {
    this.levelHeight = levelHeight;
    this.treeWidth = initialLevelDistance;
    this.zeroSumOn = false;
    this.fractionOn = true;
    this.automaticLevelAdjustment = true;
    this.treeDirection = Direction.TB;
  }
}

