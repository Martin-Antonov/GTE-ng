import {TreeController} from '../../Main/TreeController';
import {Node} from '../../../Model/Node';


export abstract class AbstractAction {
  treeController: TreeController;

  constructor(treeController: TreeController) {
    this.treeController = treeController;
  }

  abstract executeAction(undo: boolean);

  abstract destroy();

  getNodeAddress(node: Node): string {
    let currentNode = node;
    let result = '';
    while (currentNode.parent !== null) {
      result += currentNode.parent.children.indexOf(currentNode) + ' ';
      currentNode = currentNode.parent;

    }
    result = result.substr(0, result.length - 1);
    result = result.split('').reverse().join('');

    return result;
  }

  getNodeFromAddress(nodeAddress: string): Node {
    const nodeAddressSteps = nodeAddress.split(' ');
    let currentNode = this.treeController.tree.nodes[0];
    for (let i = 0; i < nodeAddressSteps.length; i++) {
      const index = Number(nodeAddressSteps[i]);
      currentNode = currentNode.children[index];
    }

    return currentNode;
  }
}
