import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import Fraction from 'fraction.js/fraction';

export class RandomPayoffsAction extends AbstractAction {
  payoffsBefore: Array<Array<Fraction>>;
  payoffsAfter: Array<Array<Fraction>>;

  constructor(treeController: TreeController, payoffsBefore: Array<Array<Fraction>>, payoffsAfter: Array<Array<Fraction>>) {
    super(treeController);
    this.payoffsBefore = payoffsBefore;
    this.payoffsAfter = payoffsAfter;
  }

  executeAction(undo: boolean) {
    const leaves = this.treeController.tree.getLeaves();
    const payoffsToUse = undo ? this.payoffsBefore : this.payoffsAfter;

    for (let i = 0; i < this.payoffsBefore.length; i++) {
      leaves[i].payoffs.outcomes = payoffsToUse[i].slice(0);
    }
  }

  destroy() {
    this.payoffsBefore = null;
    this.payoffsAfter = null;
  }
}
