import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Node} from '../../../Model/Node';


export class DecreasePlayersAction extends AbstractAction {

  savedNodes: Array<string>;
  playerID: number;

  constructor(treeController: TreeController, nodesWithDeletedPlayer: Array<Node>, playerID: number) {
    super(treeController);
    this.playerID = playerID;
    this.savedNodes = [];
    nodesWithDeletedPlayer.forEach((n: Node) => {
      this.savedNodes.push(this.getNodeAddress(n));
    });
  }

  executeAction(undo: boolean) {
    if (undo) {
      const nodesV = [];
      this.savedNodes.forEach((savedNode: string) => {
        nodesV.push(this.treeController.treeView.findNodeView(this.getNodeFromAddress(savedNode)));
      });
      this.treeController.assignPlayerToNode(this.playerID, nodesV);
    } else {
      this.treeController.tree.removePlayer(this.treeController.tree.players[this.playerID]);
    }
  }

  destroy() {
  }
}
