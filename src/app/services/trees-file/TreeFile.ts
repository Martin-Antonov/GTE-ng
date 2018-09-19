export class TreeFile {
  fileName: string;
  currentTree: string;
  treesList: Array<string>;
  coordsList: Array<Array<{ x: number, y: number }>>;
  currentCoordinatesIndex: number;

  constructor(fileName: string) {
    this.fileName = fileName;
  }
}
