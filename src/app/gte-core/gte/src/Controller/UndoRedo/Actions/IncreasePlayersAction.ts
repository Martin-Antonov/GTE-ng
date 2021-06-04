import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';

export class IncreasePlayersAction extends AbstractAction {

  constructor(treeController: TreeController) {
    super(treeController);
  }

  executeAction(undo: boolean) {
    const numberOfPlayers = this.treeController.tree.players.length - 1;
    if (undo) {
      this.treeController.tree.removePlayer(this.treeController.tree.players[numberOfPlayers]);
    } else {
      this.treeController.addPlayer(numberOfPlayers + 1);
    }
  }

  destroy() {
  }
}
