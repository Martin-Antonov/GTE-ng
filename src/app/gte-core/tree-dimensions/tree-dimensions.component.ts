import {Component, OnInit} from '@angular/core';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';
import {UserActionController} from '../gte/src/Controller/Main/UserActionController';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH} from '../gte/src/Utils/Constants';
import {ACTION} from '../gte/src/Controller/UndoRedo/ActionsEnum';

@Component({
  selector: 'app-tree-dimensions',
  templateUrl: './tree-dimensions.component.html',
  styleUrls: ['./tree-dimensions.component.scss']
})
export class TreeDimensionsComponent implements OnInit {

  userActionController: UserActionController;
  treeWidth: number;
  treeHeight: number;
  options: Array<number> = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  initialHeight: number;
  initialWidth: number;

  constructor(private uac: UserActionControllerService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
  }

  updateTreeWidth() {
    this.userActionController.treeController.treeView.properties.treeWidth =
      this.userActionController.scene.sys.canvas.width * INITIAL_TREE_WIDTH * this.treeWidth * 2 / 100;
    this.userActionController.treeController.resetTree(true, true);
  }

  updateTreeHeight() {
    this.userActionController.treeController.treeView.properties.levelHeight =
      this.userActionController.scene.sys.canvas.height * INITIAL_TREE_HEIGHT * this.treeHeight * 2 / 100;
    this.userActionController.treeController.resetTree(true, true);
  }

  saveInitialHeight() {
    this.initialHeight = this.userActionController.treeController.treeView.properties.levelHeight;
  }

  saveHeightToUndo(event) {
    const newHeight = this.userActionController.treeController.treeView.properties.levelHeight;
    this.userActionController.undoRedoActionController.saveAction(ACTION.CHANGE_HEIGHT, [this.initialHeight, newHeight]);
    event.target.blur();

  }

  saveInitialWidth() {
    this.initialWidth = this.userActionController.treeController.treeView.properties.treeWidth;
  }

  saveWidthToUndo(event) {
    const newWidth = this.userActionController.treeController.treeView.properties.treeWidth;
    this.userActionController.undoRedoActionController.saveAction(ACTION.CHANGE_WIDTH, [this.initialWidth, newWidth]);
    event.target.blur();
  }
}
