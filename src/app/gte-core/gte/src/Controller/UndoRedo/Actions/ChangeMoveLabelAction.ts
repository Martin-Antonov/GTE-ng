import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Move} from '../../../Model/Move';

export class ChangeMoveLabelAction extends AbstractAction {
  savedNode: string;
  oldLabel: string;
  newLabel: string;

  constructor(treeController: TreeController, oldLabel: string, move: Move, newLabel: string) {
    super(treeController);
    this.oldLabel = oldLabel;
    this.newLabel = newLabel;
    this.savedNode = this.getNodeAddress(move.to);
  }

  executeAction(undo: boolean) {
    const node = this.getNodeFromAddress(this.savedNode);
    const label = undo ? this.oldLabel : this.newLabel;

    this.treeController.tree.changeMoveLabel(node.parentMove, label);
  }

  destroy() {
  }
}
