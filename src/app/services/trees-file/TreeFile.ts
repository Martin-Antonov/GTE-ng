export class TreeFile {
  fileName: string;
  currentTree: string;
  coordsList: Array<{ x: number, y: number }>;
  constructor(fileName: string) {
    this.fileName = fileName;
  }
}
