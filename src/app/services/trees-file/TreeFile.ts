import {Tree} from '../../gte-core/gte/src/Model/Tree';

export class TreeFile {
  fileName: string;
  currentTree: string;
  coordsList: Array<{ x: number, y: number }>;
  urTreesList: Array<Tree>;
  urCurrentTreeIndex: number;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.coordsList = [];
    this.urTreesList = [];
  }

  destroy() {
    this.coordsList = null;
    this.urTreesList = null;
    this.coordsList = null;
    this.currentTree = null;
    this.fileName = null;
  }
}
