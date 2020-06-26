import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {NodeView} from '../../../View/NodeView';

export class AddNodeAction extends AbstractAction {
  private serializedNodes: Array<string>;

  constructor(treeController: TreeController, nodesV: Array<NodeView>) {
    super(treeController);

    this.serializedNodes = [];
    nodesV.forEach((nV: NodeView) => {
      this.serializedNodes.push(this.getNodeAddress(nV.node));
    });
  }

  executeAction(undo: boolean) {
    if (undo) {
      const nodesToDelete = [];
      this.serializedNodes.forEach((serializedNode: string) => {
        const node = this.getNodeFromAddress(serializedNode);
        if (node.children.length === 2) {
          nodesToDelete.push(this.treeController.treeView.findNodeView(node.children[0]));
          nodesToDelete.push(this.treeController.treeView.findNodeView(node.children[1]));
        } else {
          nodesToDelete.push(this.treeController.treeView.findNodeView(node.children[node.children.length - 1]));
        }
      });
      this.treeController.deleteNodeHandler(nodesToDelete);
    } else {
      const nodesToAdd = [];
      this.serializedNodes.forEach((serializedNode: string) => {
        const nodeToAdd = this.treeController.treeView.findNodeView(this.getNodeFromAddress(serializedNode));
        nodesToAdd.push(nodeToAdd);
      });
      this.treeController.addNodeHandler(nodesToAdd);
    }
  }

  destroy() {
    this.serializedNodes = null;
  }
}
