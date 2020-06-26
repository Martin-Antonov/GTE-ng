import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';

export class ChangeTreeHeightAction extends AbstractAction {

  newHeight: number;
  oldHeight: number;

  constructor(treeController: TreeController, oldHeight: number, newHeight: number) {
    super(treeController);
    this.oldHeight = oldHeight;
    this.newHeight = newHeight;
  }

  executeAction(undo: boolean) {
    if (undo) {
      this.treeController.treeView.properties.levelHeight = this.oldHeight;
    } else {
      this.treeController.treeView.properties.levelHeight = this.newHeight;
    }
  }

  destroy() {
  }
}
