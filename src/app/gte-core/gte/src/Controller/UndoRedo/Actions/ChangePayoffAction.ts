import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Node} from '../../../Model/Node';

export class ChangePayoffAction extends AbstractAction {
  oldPayoffs: string;
  newPayoffs: string;
  savedNode: string;

  constructor(treeController: TreeController, oldPayoffs: string, newPayoffs: string, node: Node) {
    super(treeController);
    this.oldPayoffs = oldPayoffs;
    this.newPayoffs = newPayoffs;
    this.savedNode = this.getNodeAddress(node);
  }

  executeAction(undo: boolean) {
    const payoffs = undo ? this.oldPayoffs : this.newPayoffs;
    const node = this.getNodeFromAddress(this.savedNode);
    node.payoffs.saveFromString(payoffs);
  }

  destroy() {
  }
}
