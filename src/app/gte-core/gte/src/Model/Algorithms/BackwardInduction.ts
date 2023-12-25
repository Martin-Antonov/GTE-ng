import {IAlgorithm} from './IAlgorithm';
import {Tree} from '../Tree';
import {BACKWARDS_INDUCTION_NOT_ALL_LABELED, BACKWARDS_INDUCTION_PERFECT_INFORMATION} from '../../Utils/Constants';
import {Node, NodeType} from '../Node';
import Fraction from 'fraction.js/fraction';
import {Move} from '../Move';

export class BackwardInduction implements IAlgorithm {
  /**
   * @returns A boolean array, which shows whether every move in the tree is best or not.
   */
  execute(tree: Tree): Array<boolean> {
    if (!tree.checkAllNodesLabeled()) {
      throw new Error(BACKWARDS_INDUCTION_NOT_ALL_LABELED);
    }
    if (tree.iSets.length !== 0) {
      throw new Error(BACKWARDS_INDUCTION_PERFECT_INFORMATION);
    }

    let movesCloned = tree.moves.slice(0);
    const result = movesCloned.map((move: Move) => {
      return false;
    });
    while (tree.nodes.length !== 1) {
      const leaves = tree.getLeaves();
      const parentNodes = [];
      leaves.forEach((leaf: Node) => {
        if (parentNodes.indexOf(leaf.parent) === -1) {
          parentNodes.push(leaf.parent);
        }
      });

      parentNodes.sort((x: Node, y: Node) => {
        return x.depth > y.depth ? -1 : 1;
      });

      parentNodes.forEach((n: Node) => {
        if (n.type === NodeType.CHANCE) {
          n.payoffs.reset();
          n.children.forEach((c: Node) => {
            c.payoffs.multiply(c.parentMove.probability);
            n.payoffs.add(c.payoffs.outcomes);
          });
          n.convertToLeaf();
        } else if (n.type === NodeType.OWNED) {
          let maxLeaf: Node = null;
          let maxPayoff = new Fraction(-100000);
          const playerIndex = tree.players.indexOf(n.player);
          n.payoffs.reset();
          n.children.forEach((c: Node) => {
            if (c.payoffs.outcomes[playerIndex - 1].compare(maxPayoff) > 0) {
              maxPayoff = c.payoffs.outcomes[playerIndex - 1];
              maxLeaf = c;
            }
          });
          n.payoffs.outcomes = maxLeaf.payoffs.outcomes.slice(0);
          result[movesCloned.indexOf(maxLeaf.parentMove)] = true;
        }

        const childrenContainNonLeaves = n.children.some((c: Node) => c.children.length !== 0);
        if (childrenContainNonLeaves) {
          return;
        }
        for (let i = 0; i < n.children.length; i++) {
          tree.removeNode(n.children[i]);
          i--;
        }
      });
    }
    movesCloned = null;
    return result;
  }
}
