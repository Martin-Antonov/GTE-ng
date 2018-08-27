/** A class that stores the level height and initial width of whe tree
 * All properties are given a fractions of the game width and height!*/
export class TreeViewProperties {
  levelHeight: number;
  treeWidth: number;
  zeroSumOn: boolean;
  fractionOn: boolean;

  constructor(levelHeight: number, initialLevelDistance: number) {
    this.levelHeight = levelHeight;
    this.treeWidth = initialLevelDistance;
    this.zeroSumOn = false;
    this.fractionOn = true;
  }
}

