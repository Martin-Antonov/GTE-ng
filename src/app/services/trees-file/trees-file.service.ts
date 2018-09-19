import {Injectable} from '@angular/core';
import {UserActionControllerService} from '../user-action-controller/user-action-controller.service';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';
import {TreeFile} from './TreeFile';
import {saveAs} from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class TreesFileService {

  userActionController: UserActionController;
  treeTabs: Array<TreeFile>;
  currentTabIndex: number;

  constructor(private uac: UserActionControllerService) {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
    this.treeTabs = [];
  }

  initiateFirstTree() {
    let initialTree = new TreeFile('My Tree 1');
    this.treeTabs.push(initialTree);
    this.currentTabIndex = 0;
  }

  addNewTree() {
    this.saveCurrentTree();
    this.userActionController.emptySelectedNodes();
    // Create the new tree and push it to tree tabs
    let newTree = new TreeFile('My Tree ' + (this.treeTabs.length + 1));
    this.treeTabs.push(newTree);
    this.currentTabIndex = this.treeTabs.length - 1;
    this.userActionController.createNewTree();
    this.userActionController.undoRedoController.treesList = [];
    this.userActionController.undoRedoController.treeCoordinatesList = [];
    this.userActionController.undoRedoController.currentTreeIndex = 0;

  }

  changeToTree(index: number) {
    if (index !== this.currentTabIndex) {
      this.saveCurrentTree();
      this.userActionController.emptySelectedNodes();
      this.userActionController.treeController.reloadTreeFromJSON(
        this.userActionController.undoRedoController.treeParser.parse(this.treeTabs[index].currentTree),
        this.treeTabs[index].coordsList[this.treeTabs[index].currentCoordinatesIndex]
      );
      this.currentTabIndex = index;
      this.userActionController.checkCreateStrategicForm();
    }
  }

  closeFile(index: number) {
    if (this.treeTabs.length === 1) {
      return;
    }

    this.treeTabs.splice(index, 1);
    if (index !== 0) {
      this.currentTabIndex--;
    }
    else {
      this.currentTabIndex = this.treeTabs.length - 1;
    }
    this.userActionController.emptySelectedNodes();
    this.userActionController.treeController.reloadTreeFromJSON(
      this.userActionController.undoRedoController.treeParser.parse(this.treeTabs[this.currentTabIndex].currentTree)
    );
  }

  private saveCurrentTree() {
    let currentFile = this.treeTabs[this.currentTabIndex];
    let undoRedoController = this.userActionController.undoRedoController;
    currentFile.coordsList = [];
    currentFile.treesList = [];

    // Stringify and save current tree
    currentFile.currentTree = undoRedoController.treeParser
      .stringify(undoRedoController.treeController.tree);

    // Save all trees in the undo redo controller
    undoRedoController.treesList.forEach(tree => {
      currentFile.treesList.push(undoRedoController.treeParser.stringify(tree));
    });

    // Save the coordinates for each tree in the undo redo controller
    undoRedoController.treeCoordinatesList.forEach(treeCoords => {
      let currentTreeCoordinates = [];
      treeCoords.forEach(coords => {
        currentTreeCoordinates.push({x: coords.x, y: coords.y});

      });
      currentFile.coordsList[undoRedoController.treeCoordinatesList.indexOf(treeCoords)] = currentTreeCoordinates;
    });
    // Save the Coordinates
    currentFile.currentCoordinatesIndex = undoRedoController.currentTreeIndex;
  }

  saveTreeToFile() {
    this.saveCurrentTree();
    let text = JSON.stringify(this.treeTabs[this.currentTabIndex]);
    let blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.txt');
  }

  loadTreeFromFile() {
    let input = event.target;

    let reader = new FileReader();
    reader.onload = () => {
      let text = reader.result;
      this.newTreeFromFile(text);
    };

    reader.readAsText((<any>input).files[0]);
  }

  private newTreeFromFile(text: string) {
    let newTree = JSON.parse(text);
    this.treeTabs.push(newTree);
    this.changeToTree(this.treeTabs.length - 1);
  }

  saveToImage() {
    setTimeout(() => {
      let cnvs = document.getElementsByTagName('canvas');
      (<any>cnvs[0]).toBlob(function (blob) {
        saveAs(blob, 'GTE_Tree' + '.png');
      });
    }, 100);
  }
}
