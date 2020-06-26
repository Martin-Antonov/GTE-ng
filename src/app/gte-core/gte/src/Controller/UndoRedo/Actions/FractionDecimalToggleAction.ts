import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';

export class FractionDecimalToggleAction extends AbstractAction {

  constructor(treeController: TreeController) {
    super(treeController);
  }

  executeAction(undo: boolean) {
    this.treeController.treeView.properties.fractionOn = !this.treeController.treeView.properties.fractionOn;
    this.treeController.events.emit('fraction-decimal-undo');
  }

  destroy() {
  }
}
