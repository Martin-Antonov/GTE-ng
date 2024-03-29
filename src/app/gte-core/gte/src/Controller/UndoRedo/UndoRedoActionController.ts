import {TreeController} from '../Main/TreeController';
import {NodeView} from '../../View/NodeView';
import {ACTION} from './ActionsEnum';
import {AddNodeAction} from './Actions/AddNodeAction';
import {AbstractAction} from './Actions/AbstractAction';
import {AssignPlayerAction} from './Actions/AssignPlayerAction';
import {ZeroSumAction} from './Actions/ZeroSumAction';
import {FractionDecimalToggleAction} from './Actions/FractionDecimalToggleAction';
import {RandomPayoffsAction} from './Actions/RandomPayoffsAction';
import {IncreasePlayersAction} from './Actions/IncreasePlayersAction';
import {ChangeTreeWidthAction} from './Actions/ChangeTreeWidthAction';
import {ChangeTreeHeightAction} from './Actions/ChangeTreeHeightAction';
import {ChangePlayerMovesList} from './Actions/ChangePlayerMovesList';
import {ChangeMoveLabelAction} from './Actions/ChangeMoveLabelAction';
import {ChangePlayerLabel} from './Actions/ChangePlayerLabel';
import {ChangePayoffAction} from './Actions/ChangePayoffAction';
import {MoveTreeAction} from './Actions/MoveTreeAction';
import {DecreasePlayersAction} from './Actions/DecreasePlayersAction';
import {ChangeISetAction} from './Actions/ChangeISetAction';
import {TREE_TWEEN_DURATION} from '../../Utils/Constants';
import Fraction from 'fraction.js/fraction';
import {DeleteNodeAction} from './Actions/DeleteNodeAction';


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
    this.treeController.treeView.nodes.forEach((nV: NodeView) => {
      nV.level = nV.node.depth;
    });
    this.treeController.resetTree(true, true);
  }

  saveAction(action: ACTION, data?: any) {
    let actionsToDelete = this.actionsList.splice(this.currentIndex + 1, this.actionsList.length);
    actionsToDelete.forEach((actionToDelete: AbstractAction) => {
      actionToDelete.destroy();
    });
    actionsToDelete = null;

    switch (action) {
      case ACTION.ADD_NODE:
        this.actionsList.push(new AddNodeAction(this.treeController, data as Array<NodeView>));
        break;
      case ACTION.DELETE_NODE:
        this.actionsList.push(new DeleteNodeAction(this.treeController, data[0] as Array<NodeView>, data[1] as string));
        break;
      case ACTION.ASSIGN_PLAYER:
        this.actionsList.push(new AssignPlayerAction(this.treeController, data.nodesV, data.playerID));
        break;
      case ACTION.CHANGE_INFO_SETS:
        this.actionsList.push(new ChangeISetAction(this.treeController, data[0], data[1], data[2]));
        break;
      case ACTION.ZERO_SUM_TOGGLE:
        this.actionsList.push(new ZeroSumAction(this.treeController, data as Array<Array<Fraction>>));
        break;
      case ACTION.ASSIGN_RANDOM_PAYOFFS:
        this.actionsList.push(new RandomPayoffsAction(this.treeController, data[0] as Array<Array<Fraction>>, data[1] as Array<Array<Fraction>>));
        break;
      case ACTION.FRACTION_DECIMAL_TOGGLE:
        this.actionsList.push(new FractionDecimalToggleAction(this.treeController));
        break;
      case ACTION.INCREASE_PLAYERS_COUNT:
        this.actionsList.push(new IncreasePlayersAction(this.treeController));
        break;
      case ACTION.DECREASE_PLAYERS_COUNT:
        this.actionsList.push(new DecreasePlayersAction(this.treeController, data[0], data[1]));
        break;
      case ACTION.CHANGE_WIDTH:
        this.actionsList.push(new ChangeTreeWidthAction(this.treeController, data[0], data[1]));
        break;
      case ACTION.CHANGE_HEIGHT:
        this.actionsList.push(new ChangeTreeHeightAction(this.treeController, data[0], data[1]));
        break;
      case ACTION.CHANGE_PLAYER_MOVES_LIST:
        this.actionsList.push(new ChangePlayerMovesList(this.treeController, data[0], data[1], data[2]));
        break;
      case ACTION.CHANGE_MOVE_LABEL:
        this.actionsList.push(new ChangeMoveLabelAction(this.treeController, data[0], data[1], data[2]));
        break;
      case ACTION.CHANGE_PLAYER_LABEL:
        this.actionsList.push(new ChangePlayerLabel(this.treeController, data[0], data[1], data[2]));
        break;
      case ACTION.CHANGE_PAYOFF:
        this.actionsList.push(new ChangePayoffAction(this.treeController, data[0], data[1], data[2]));
        break;
      case ACTION.MOVE_TREE:
        this.actionsList.push(new MoveTreeAction(this.treeController, data[0], data[1], data[2]));
        break;
    }

    this.currentIndex++;
  }

  playFromBeginning() {
    for (let i = this.currentIndex; i >= 0; i--) {
      this.actionsList[i].executeAction(true);
    }

    for (let i = 0; i <= this.currentIndex; i++) {
      this.treeController.scene.time.addEvent({
        delay: i * TREE_TWEEN_DURATION * 0.8,
        callback: () => {
          this.actionsList[i].executeAction(false);
        }
      });
    }
  }
}
