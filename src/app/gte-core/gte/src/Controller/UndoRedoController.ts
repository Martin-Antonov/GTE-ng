/**A class for handling the Undo/Redo functionality */
import {TreeController} from './TreeController';
import {Tree} from '../Model/Tree';
import {NodeView} from '../View/NodeView';

export class UndoRedoController {
  treeController: TreeController;
  treesList: Array<Tree>;
  currentTreeIndex: number;
  treeCoordinatesList: Array<Array<{ x: number, y: number }>>;

  constructor(treeController: TreeController) {
    this.treeController = treeController;
    this.treesList = [];
    this.treeCoordinatesList = [];
    this.currentTreeIndex = 0;
    this.treesList.push(this.treeController.treeParser.parse(this.treeController.treeParser.stringify(this.treeController.tree)));
  }

  /**Undo-Redo method */
  changeTreeInController(undo: boolean) {
    if (undo && this.currentTreeIndex - 1 >= 0) {
      this.currentTreeIndex--;
    } else if (!undo && this.currentTreeIndex + 1 < this.treesList.length) {
      this.currentTreeIndex++;
    } else {
      return;
    }
    const newTree = this.treeController.treeParser.parse(this.treeController.treeParser.stringify(this.treesList[this.currentTreeIndex]));

    this.treeController.reloadTreeFromJSON(newTree, this.treeCoordinatesList[this.currentTreeIndex]);
  }

  saveNewTree(saveCoordinates?: boolean) {
    this.treesList.splice(this.currentTreeIndex + 1, this.treesList.length);
    this.treesList.push(this.treeController.treeParser.parse(this.treeController.treeParser.stringify(this.treeController.tree)));
    if (saveCoordinates) {
      const coordsArray = [];
      this.treeController.treeView.nodes.forEach((nV: NodeView) => {
        const roundedX = Math.round(nV.x * 100) / 100;
        const roundedY = Math.round(nV.y * 100) / 100;
        coordsArray.push({x: roundedX, y: roundedY});
      });
      this.treeCoordinatesList[this.currentTreeIndex + 1] = coordsArray;
    }
    this.currentTreeIndex++;
  }

  destroy() {
    this.treeController = null;
    this.currentTreeIndex = null;
    this.treeCoordinatesList = null;
    this.treesList = null;
  }
}

