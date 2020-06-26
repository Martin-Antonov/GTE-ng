import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Node} from '../../../Model/Node';
import {ISet} from '../../../Model/ISet';

export class ChangeISetAction extends AbstractAction {
  oldISetsSerialized: Array<Array<{ node: string, player: number }>>;
  newISetsSerialized: Array<Array<{ node: string, player: number }>>;
  unassignedSelectedNodes: Array<string>;

  constructor(treeController: TreeController, oldISets: Array<Array<Node>>, newISets: Array<Array<Node>>, unassignedSelectedNodes?: Array<Node>) {
    super(treeController);
    this.oldISetsSerialized = this.saveISets(oldISets);
    this.newISetsSerialized = this.saveISets(newISets);
    if (unassignedSelectedNodes) {
      this.unassignedSelectedNodes = [];
      unassignedSelectedNodes.forEach((n: Node) => {
        this.unassignedSelectedNodes.push(this.getNodeAddress(n));
      });
    }
  }

  private saveISets(oldISets: Array<Array<Node>>): Array<Array<{ node: string, player: number }>> {
    const result = [];
    oldISets.forEach((iSetNodes: Array<Node>) => {
      const serializedISets = [];
      iSetNodes.forEach((n: Node) => {
        let player = null;
        if (n.player) {
          player = n.player.id;
        }
        serializedISets.push({node: this.getNodeAddress(n), player: player});
      });
      result.push(serializedISets);
    });

    return result;
  }

  executeAction(undo: boolean) {
    this.removeAllISets();
    const serializedISets = undo ? this.oldISetsSerialized : this.newISetsSerialized;
    serializedISets.forEach((iSetNodes: Array<{ node: string, player: number }>) => {
      const nodesForISet = [];
      iSetNodes.forEach((nodeSerialized: { node: string, player: number }) => {
        nodesForISet.push(this.treeController.treeView.findNodeView(this.getNodeFromAddress(nodeSerialized.node)));
      });
      this.treeController.createISet(nodesForISet);
    });

    if (undo && this.unassignedSelectedNodes) {
      this.unassignedSelectedNodes.forEach((serializedNode: string) => {
        const node = this.getNodeFromAddress(serializedNode);
        node.convertToDefault();
      });
    }
  }

  private removeAllISets() {
    this.treeController.tree.iSets.forEach((iSet: ISet) => {
      this.treeController.removeISetHandler(iSet);
    });
  }

  destroy() {
    this.newISetsSerialized = null;
    this.oldISetsSerialized = null;
  }
}
