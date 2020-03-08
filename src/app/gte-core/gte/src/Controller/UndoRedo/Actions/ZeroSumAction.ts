import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Node} from '../../../Model/Node';
import Fraction from 'fraction.js/fraction';

export class ZeroSumAction extends AbstractAction {
  savedPayoffs: Array<Array<Fraction>>;

  constructor(treeController: TreeController, payoffs: Array<Array<Fraction>>) {
    super(treeController);
   this.savedPayoffs = payoffs;
  }

  executeAction(undo: boolean) {
    this.treeController.treeView.properties.zeroSumOn = !this.treeController.treeView.properties.zeroSumOn;
    if (undo) {
      const leaves = this.treeController.tree.getLeaves();
      for (let i = 0; i < this.savedPayoffs.length; i++) {
        leaves[i].payoffs.outcomes = this.savedPayoffs[i].slice(0);
      }
    }
    this.treeController.resetTree(false, false);
  }

  destroy() {
    this.savedPayoffs = null;
  }

}
