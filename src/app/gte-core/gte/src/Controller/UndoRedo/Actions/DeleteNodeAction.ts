import {AbstractAction} from './AbstractAction';
import {NodeView} from '../../../View/NodeView';
import {TreeController} from '../../Main/TreeController';

export class DeleteNodeAction extends AbstractAction {

  private serializedNodes: Array<string>;
  private serializedTreeBefore: string;

  constructor(treeController: TreeController, nodesV: Array<NodeView>, serializedTreeBefore: string) {
    super(treeController);
    this.serializedTreeBefore = serializedTreeBefore;
    this.serializedNodes = [];
    nodesV.forEach((nV: NodeView) => {
      this.serializedNodes.push(this.getNodeAddress(nV.node));
    });
  }

  executeAction(undo: boolean) {
    if (undo) {
      const clonedTree = this.treeController.treeParser.parse(this.serializedTreeBefore);
      this.treeController.reloadTreeFromJSON(clonedTree);
    } else {
      const nodesToDelete = [];
      this.serializedNodes.forEach((nodeAsString: string) => {
        nodesToDelete.push(this.treeController.treeView.findNodeView(this.getNodeFromAddress(nodeAsString)));
      });
      this.treeController.deleteNodeHandler(nodesToDelete);
    }
  }

  destroy() {
  }
}
