import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';

export class RandomPayoffsAction extends AbstractAction {
  payoffsBefore: Array<Array<number>>;
  payoffsAfter: Array<Array<number>>;

  constructor(treeController: TreeController, payoffsBefore: Array<Array<number>>, payoffsAfter: Array<Array<number>>) {
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

    this.treeController.resetTree(false, false);
  }

  destroy() {
    this.payoffsBefore = null;
    this.payoffsAfter = null;
  }
}
