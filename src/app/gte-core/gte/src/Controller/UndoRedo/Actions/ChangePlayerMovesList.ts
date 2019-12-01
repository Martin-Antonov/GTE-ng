import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Move} from '../../../Model/Move';

export class ChangePlayerMovesList extends AbstractAction {
  oldList: Array<string>;
  newList: Array<string>;
  playerId: number;

  constructor(treeController: TreeController, oldList: Array<string>, newList: Array<string>, playerID: number) {
    super(treeController);
    this.oldList = oldList;
    this.newList = newList;
    this.playerId = playerID;

  }

  executeAction(undo: boolean) {
    this.treeController.tree.labelSetter.labels[this.playerId] = undo ? this.oldList.slice(0) : this.newList.slice(0);
    this.treeController.tree.moves.forEach((m: Move) => {
      if (m.from.player && m.from.player.id === this.playerId + 1) {
        m.manuallyAssigned = false;
      }
    });
    this.treeController.resetTree(false, false);
  }

  destroy() {
  }

}
