/**A class for handling the Undo/Redo functionality */
import {TreeController} from './TreeController';
import {Tree} from '../Model/Tree';
import {TreeParser} from '../Utils/TreeParser';
import {NodeView} from '../View/NodeView';

export class UndoRedoController {
  treeController: TreeController;
  treesList: Array<Tree>;
  currentTreeIndex: number;
  treeParser: TreeParser;
  treeCoordinatesList: Array<Array<{ x: number, y: number }>>;

  constructor(treeController: TreeController) {
    this.treeController = treeController;
    this.treesList = [];
    this.treeCoordinatesList = [];
    this.currentTreeIndex = 0;
    this.treeParser = new TreeParser();
    this.treesList.push(this.treeParser.parse(this.treeParser.stringify(this.treeController.tree)));

  }

  /**Undo-Redo method */
  changeTreeInController(undo: boolean) {
    if (undo && this.currentTreeIndex - 1 >= 0) {
      this.currentTreeIndex--;
    }
    else if (!undo && this.currentTreeIndex + 1 < this.treesList.length) {
      this.currentTreeIndex++;
    }
    else {
      return;
    }
    let newTree = this.treeParser.parse(this.treeParser.stringify(this.treesList[this.currentTreeIndex]));

    this.treeController.reloadTreeFromJSON(newTree, this.treeCoordinatesList[this.currentTreeIndex]);
  }

  saveNewTree(saveCoordinates?: boolean) {
    this.treesList.splice(this.currentTreeIndex + 1, this.treesList.length);
    this.treesList.push(this.treeParser.parse(this.treeParser.stringify(this.treeController.tree)));
    if (saveCoordinates) {
      const coordsArray = [];
      this.treeController.treeView.nodes.forEach((n: NodeView) => {
        coordsArray.push({x: n.position.x, y: n.position.y});
      });
      this.treeCoordinatesList[this.currentTreeIndex + 1] = coordsArray;
    }
    this.currentTreeIndex++;
  }
}

