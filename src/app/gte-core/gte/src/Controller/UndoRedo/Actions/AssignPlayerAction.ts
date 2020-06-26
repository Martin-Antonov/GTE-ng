import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {NodeView} from '../../../View/NodeView';

export class AssignPlayerAction extends AbstractAction {
  serializedNodes: Array<string>;
  playerID: number;

  constructor(treeController: TreeController, nodesV: Array<NodeView>, playerID: number) {
    super(treeController);
    this.playerID = playerID;
    this.serializedNodes = [];
    nodesV.forEach((nV: NodeView) => {
      this.serializedNodes.push(this.getNodeAddress(nV.node));
    });
  }

  executeAction(undo: boolean) {
    if (undo) {
      this.serializedNodes.forEach((serializedNode: string) => {
        const node = this.getNodeFromAddress(serializedNode);
        node.convertToDefault();
      });
    } else {
      const nodesToAssignPlayer = [];
      this.serializedNodes.forEach((serializedNode: string) => {
        const node = this.getNodeFromAddress(serializedNode);
        nodesToAssignPlayer.push(this.treeController.treeView.findNodeView(node));
      });
      if (this.playerID === 0) {
        this.treeController.assignChancePlayerToNode(nodesToAssignPlayer);
      } else {
        this.treeController.assignPlayerToNode(this.playerID, nodesToAssignPlayer);
      }
    }
  }

  destroy() {
    this.serializedNodes = null;
  }

}
