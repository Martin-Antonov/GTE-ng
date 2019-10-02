import {Injectable} from '@angular/core';
import {UserActionControllerService} from '../user-action-controller/user-action-controller.service';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';
import {TreeFile} from './TreeFile';
import {saveAs} from 'file-saver';
import {UiSettingsService} from '../ui-settings/ui-settings.service';
import {UndoRedoController} from '../../gte-core/gte/src/Controller/UndoRedoController';
import {Tree} from '../../gte-core/gte/src/Model/Tree';

@Injectable({
  providedIn: 'root'
})
export class TreesFileService {

  userActionController: UserActionController;
  treeTabs: Array<TreeFile>;
  currentTabIndex: number;

  constructor(private uac: UserActionControllerService, private uis: UiSettingsService) {
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
    this.userActionController.undoRedoController.destroy();
    this.userActionController.undoRedoController = new UndoRedoController(this.userActionController.treeController);
  }

  changeToTree(index: number) {
    if (index !== this.currentTabIndex) {
      this.saveCurrentTree();
      this.userActionController.emptySelectedNodes();
      this.userActionController.treeController.reloadTreeFromJSON(
        this.userActionController.treeController.treeParser.parse(this.treeTabs[index].currentTree),
        this.treeTabs[index].coordsList
      );
      this.currentTabIndex = index;
      this.userActionController.checkCreateStrategicForm();
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
    }
    else {
      this.currentTabIndex = this.treeTabs.length - 1;
    }
    this.userActionController.emptySelectedNodes();
    this.userActionController.treeController.reloadTreeFromJSON(
      this.userActionController.treeController.treeParser.parse(this.treeTabs[this.currentTabIndex].currentTree)
    );

    closedTree[0].destroy();
    closedTree = null;
  }

  private saveCurrentTree() {
    let currentFile = this.treeTabs[this.currentTabIndex];
    let undoRedoController = this.userActionController.undoRedoController;
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
    let treeToSave = this.treeTabs[this.currentTabIndex];
    treeToSave.urTreesList = null;
    treeToSave.urCurrentTreeIndex = null;
    let text = JSON.stringify(treeToSave);
    let blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.gte');
  }

  saveTreeToFig() {
    let figFile = this.userActionController.viewExporter.toFig();
    let blob = new Blob([figFile], {type: 'text/plain;charset=us-ascii'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.fig');
  }

  saveTreeToImage() {
    setTimeout(() => {
      let cnvs = document.getElementsByTagName('canvas');
      let name = this.treeTabs[this.currentTabIndex].fileName;

      (<any>cnvs[0]).toBlob(function (blob) {
        saveAs(blob, name + '.png');
      });
    }, 100);
  }

  saveTreeToSVG() {
    let svgFile = this.userActionController.viewExporter.toSVG();
    let blob = new Blob([svgFile], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, this.treeTabs[this.currentTabIndex].fileName + '.svg');
  }

  saveStrategicForm() {
    let stratFormFile = this.userActionController.strategicForm.serializer.toText(this.treeTabs[this.currentTabIndex].fileName);
    console.log(stratFormFile);
  }

  loadTreeFromFile(event) {
    let input = event.target;

    let reader = new FileReader();
    reader.onload = () => {
      let text = reader.result;
      this.newTreeFromFile(text);
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
