import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {NodeView} from '../../../View/NodeView';

export class MoveTreeAction extends AbstractAction {
  hDistance: number;
  vDistance: number;
  savedNodes: Array<string>;

  constructor(treeController: TreeController, hDistance: number, vDistance: number, nodes: Array<NodeView>) {
    super(treeController);
    this.hDistance = hDistance;
    this.vDistance = vDistance;
    this.savedNodes = [];
    nodes.forEach((nV: NodeView) => {
      this.savedNodes.push(this.getNodeAddress(nV.node));
    });
  }

  executeAction(undo: boolean) {
    const hDistance = undo ? -this.hDistance : this.hDistance;
    const vDistance = undo ? -this.vDistance : this.vDistance;

    this.savedNodes.forEach((savedNode: string) => {
      const node = this.getNodeFromAddress(savedNode);
      const nV = this.treeController.treeView.findNodeView(node);
      nV.x += hDistance;
      nV.y += vDistance;
    });
  }

  destroy() {
  }

}
