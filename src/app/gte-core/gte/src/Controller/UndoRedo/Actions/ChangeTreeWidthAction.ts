import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';

export class ChangeTreeWidthAction extends AbstractAction {

  newWidth: number;
  oldWidth: number;

  constructor(treeController: TreeController, oldWidth: number, newWidth: number) {
    super(treeController);
    this.oldWidth = oldWidth;
    this.newWidth = newWidth;
  }

  executeAction(undo: boolean) {
    if (undo) {
      this.treeController.treeView.properties.treeWidth = this.oldWidth;
    } else {
      this.treeController.treeView.properties.treeWidth = this.newWidth;
    }
  }

  destroy() {
  }
}
