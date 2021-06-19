import {Injectable} from '@angular/core';
import {UserActionControllerService} from '../user-action-controller/user-action-controller.service';
import {UserActionController} from '../../gte-core/gte/src/Controller/Main/UserActionController';
import {TreeFile} from './TreeFile';
import {saveAs} from 'file-saver';
import {UndoRedoController} from '../../gte-core/gte/src/Controller/UndoRedo/UndoRedoController';

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
    const initialTree = new TreeFile('MyTree1');
    this.treeTabs.push(initialTree);
    this.currentTabIndex = 0;
  }

  addNewTree() {
    this.saveCurrentTree();
    // this.userActionController.deselectNodesHandler();
    // Create the new tree and push it to tree tabs
    const newTree = new TreeFile('MyTree' + (this.treeTabs.length + 1));
    this.treeTabs.push(newTree);
    this.currentTabIndex = this.treeTabs.length - 1;
    this.userActionController.createNewTree();
    this.userActionController.undoRedoController.destroy();
    this.userActionController.undoRedoController = new UndoRedoController(this.userActionController.treeController);
  }

  changeToTree(index: number) {
    if (index !== this.currentTabIndex) {
      this.saveCurrentTree();
      // this.userActionController.deselectNodesHandler();
      this.userActionController.treeController.reloadTreeFromJSON(
        this.userActionController.treeController.treeParser.parse(this.treeTabs[index].currentTree),
        this.treeTabs[index].coordsList
      );
      this.currentTabIndex = index;
      this.userActionController.undoRedoController.destroy();
      this.userActionController.undoRedoController = new UndoRedoController(this.userActionController.treeController);
      if (this.treeTabs[index].urTreesList) {
        this.userActionController.undoRedoController.currentTreeIndex = this.treeTabs[index].urCurrentTreeIndex;
        this.userActionController.undoRedoController.treesList = this.treeTabs[index].urTreesList;
      }
    }
  }

  closeFile(index: number) {
    this.saveCurrentTree();
    if (this.treeTabs.length === 1) {
      return;
    }

    let closedTree = this.treeTabs.splice(index, 1);
    if (index !== 0) {
      this.currentTabIndex = index - 1;
    } else {
      this.currentTabIndex = this.treeTabs.length - 1;
    }
    // this.userActionController.deselectNodesHandler();
    this.userActionController.treeController.reloadTreeFromJSON(
      this.userActionController.treeController.treeParser.parse(this.treeTabs[this.currentTabIndex].currentTree)
    );

    closedTree[0].destroy();
    closedTree = null;
  }

  private saveCurrentTree() {
    const currentFile = this.treeTabs[this.currentTabIndex];
    const undoRedoController = this.userActionController.undoRedoController;
    currentFile.coordsList = [];

    // Stringify and save current tree
    currentFile.currentTree = this.userActionController.treeController.treeParser
      .stringify(undoRedoController.treeController.tree);

    // Save the coordinates if any
    if (undoRedoController.treeCoordinatesList[undoRedoController.currentTreeIndex]) {
      undoRedoController.treeCoordinatesList[undoRedoController.currentTreeIndex].forEach(coords => {
        currentFile.coordsList.push({x: coords.x, y: coords.y});
      });
    }
    currentFile.urTreesList = undoRedoController.treesList.slice(0);
    currentFile.urCurrentTreeIndex = undoRedoController.currentTreeIndex;
  }

  saveTreeToFile() {
    this.saveCurrentTree();
    const treeToSave = this.treeTabs[this.currentTabIndex];
    treeToSave.urTreesList = null;
    treeToSave.urCurrentTreeIndex = null;
    const text = JSON.stringify(treeToSave);
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.gte');
  }

  saveTreeToFig() {
    const figFile = this.userActionController.viewExporter.toFig();
    const blob = new Blob([figFile], {type: 'text/plain;charset=us-ascii'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.fig');
  }

  saveTreeToImage() {
    setTimeout(() => {
      const cnvs = document.getElementsByTagName('canvas');
      const name = this.treeTabs[this.currentTabIndex].fileName;

      (<any>cnvs[0]).toBlob(function (blob) {
        saveAs(blob, name + '.png');
      });
    }, 100);
  }

  saveTreeToSVG() {
    const svgFile: any = this.userActionController.viewExporter.toSVG();
    const blob = new Blob([svgFile], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.svg');
  }

  saveTreeToEF() {
    const efFile = this.userActionController.viewExporter.toEf();
    const blob = new Blob([efFile], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.ef');
  }

  saveStrategicFormToSTF() {
    const stratFormFile = this.userActionController.strategicForm.serializer.toText(this.treeTabs[this.currentTabIndex].fileName);
    const blob = new Blob([stratFormFile], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.stf');
  }

  saveStrategicFormToTEX() {
    const stratFormTex = this.userActionController.strategicForm.serializer.toTex();
    const blob = new Blob([stratFormTex], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.tex');
  }

  loadTreeFromFile(event) {
    const input = event.target;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      this.newTreeFromFile(text as any);
    };

    reader.readAsText((<any>input).files[0]);
  }

  private newTreeFromFile(text: string) {
    const parsedTree: TreeFile = JSON.parse(text);
    const newTree = new TreeFile(parsedTree.fileName);
    newTree.currentTree = parsedTree.currentTree;
    newTree.coordsList = parsedTree.coordsList;
    newTree.urTreesList = parsedTree.urTreesList;
    newTree.urCurrentTreeIndex = parsedTree.urCurrentTreeIndex;

    this.treeTabs.push(newTree);
    this.changeToTree(this.treeTabs.length - 1);
    // this.userActionController.treeController.treeParser.fromXML(text);
  }
}
