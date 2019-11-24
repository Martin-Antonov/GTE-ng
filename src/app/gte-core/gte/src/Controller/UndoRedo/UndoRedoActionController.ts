import {TreeController} from '../Main/TreeController';
import {NodeView} from '../../View/NodeView';
import {ACTION} from './ActionsEnum';
import {AddNodeAction} from './Actions/AddNodeAction';
import {AbstractAction} from './Actions/AbstractAction';
import {AssignPlayerAction} from './Actions/AssignPlayerAction';


export class UndoRedoActionController {
  treeController: TreeController;
  currentIndex: number;
  actionsList: Array<AbstractAction>;

  constructor(treeController: TreeController) {
    this.treeController = treeController;
    this.actionsList = [];
    this.currentIndex = -1;
  }

  changeTree(undo: boolean) {
    if ((this.currentIndex === -1 && undo) ||
      (!undo && !this.actionsList[this.currentIndex + 1])) {
      return;
    }
    const indexToUse = undo ? this.currentIndex : this.currentIndex + 1;

    this.actionsList[indexToUse].executeAction(undo);
    const indexChange = undo ? -1 : 1;
    this.currentIndex += indexChange;
  }

  saveAction(action: ACTION, data: any) {
    let actionsToDelete = this.actionsList.splice(this.currentIndex + 1, this.actionsList.length);
    actionsToDelete.forEach((actionToDelete: AbstractAction) => {
      actionToDelete.destroy();
    });
    actionsToDelete = null;

    switch (action) {
      case ACTION.ADD_NODE:
        this.actionsList.push(new AddNodeAction(this.treeController, (data as Array<NodeView>)));
        break;
      case ACTION.DELETE_NODE:
        break;
      case ACTION.ASSIGN_PLAYER:
        this.actionsList.push(new AssignPlayerAction(this.treeController, data.nodesV, data.playerID));
        break;
      case ACTION.CREATE_INFO_SET:
        break;
      case ACTION.UNLINK_INFO_SET:
        break;
      case ACTION.CUT_INFO_SET:
        break;
      case ACTION.ZERO_SUM_TOGGLE:
        break;
      case ACTION.ASSIGN_RANDOM_PAYOFFS:
        break;
      case ACTION.FRACTION_DECIMAL_TOGGLE:
        break;
      case ACTION.INCREASE_PLAYERS_COUNT:
        break;
      case ACTION.DECREASE_PLAYERS_COUNT:
        break;
      case ACTION.CHANGE_WIDTH:
        break;
      case ACTION.CHANGE_HEIGHT:
        break;
      case ACTION.CHANGE_PLAYERS_MOVE_LIST:
        break;
      case ACTION.CHANGE_MOVE:
        break;
      case ACTION.CHANGE_PAYOFF:
        break;
      case ACTION.MOVE_TREE:
        break;
    }

    this.currentIndex++;
  }
}
