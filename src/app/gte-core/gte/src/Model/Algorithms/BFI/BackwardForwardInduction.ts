import {IAlgorithm} from '../IAlgorithm';
import {Tree} from '../../Tree';
import {Node, NodeType} from '../../Node';
import {CoalitionsCalculator} from './CoalitionsCalculator';
import {INodeCoalitionSolution} from './INodeCoalitionSolution';
import {Payoffs} from '../../Payoffs';
import {FinalSolutionsCalculator} from './FinalSolutionsCalculator';
import {BACKWARDS_INDUCTION_NOT_ALL_LABELED, BACKWARDS_INDUCTION_PERFECT_INFORMATION} from '../../../Utils/Constants';


export class BackwardForwardInduction implements IAlgorithm {
  coalitionsCalculator: CoalitionsCalculator;
  // Represents the solutions for all coalitions in each node.
  nodeAllSolutions: Map<Node, Array<INodeCoalitionSolution>>;
  finalSolutionsCalculator: FinalSolutionsCalculator;

  constructor() {
    this.coalitionsCalculator = new CoalitionsCalculator();
    this.finalSolutionsCalculator = new FinalSolutionsCalculator(this.coalitionsCalculator);
  }

  execute(tree: Tree, utility: string): any {
    if (!tree.checkAllNodesLabeled()) {
      throw new Error(BACKWARDS_INDUCTION_NOT_ALL_LABELED);
    }
    if (tree.iSets.length !== 0) {
      throw new Error(BACKWARDS_INDUCTION_PERFECT_INFORMATION);
    }
    const coalitions = this.coalitionsCalculator.calculate(tree);
    const nodes = this.getNodeOrder(tree);
    this.nodeAllSolutions = new Map();
    // For every node, check every possible coalition and find the best move for the given coalition
    nodes.forEach((n: Node) => {
      this.nodeAllSolutions.set(n, []);
      coalitions.forEach((coalition: string) => {
        const payoffs = [];
        n.children.forEach((c: Node) => {
          // if the child is a leaf, save the payoffs object
          if (c.type === NodeType.LEAF) {
            payoffs.push(c.payoffs);
          } else { // If the child is not a leaf, then the best response would have already been calculated.
            const childSolution = this.nodeAllSolutions.get(c).find((solution) => {
              return solution.coalition === coalition;
            });
            payoffs.push(childSolution.payoffs);
          }
        });
        // Find the best payoff.
        const bestPayoffIndex = this.getBestPayoff(payoffs, coalition, utility, tree.players.indexOf(n.player));
        this.nodeAllSolutions.get(n).push({
          coalition: coalition,
          move: n.children[bestPayoffIndex].parentMove,
          payoffs: payoffs[bestPayoffIndex],
        });
      });
    });
    this.sortCoalitionsPerNode();
    const finalSolution = this.finalSolutionsCalculator.calculate(this.nodeAllSolutions, tree);
    this.logResult(nodes, finalSolution);
    return finalSolution;
  }

  // region Calculation ALL coalition solutions per node

  /**Get the correct order of nodes - reverse BFS from left to right, without leaves*/
  private getNodeOrder(tree: Tree): Array<Node> {
    let nodes = tree.BFSOnTree();
    nodes = nodes.filter((n: Node) => {
      return n.type === NodeType.OWNED;
    });
    nodes = nodes.sort((n1: Node, n2: Node) => {
      return n2.depth - n1.depth;
    });

    return nodes;
  }

  private getBestPayoff(payoffs: Array<Payoffs>, coalition: string, utility: string, currentPlayerIndex: number) {
    const coalitionPayoffs = [];
    payoffs.forEach((payoff: Payoffs) => {
      coalitionPayoffs.push(this.getTransformedPayoffPerUtility(payoff, coalition, utility, currentPlayerIndex));
    });

    let maxPayoff = -100000;
    let maxPayoffIndex = -1;
    for (let i = 0; i < coalitionPayoffs.length; i++) {
      if (maxPayoff <= coalitionPayoffs[i]) {
        maxPayoff = coalitionPayoffs[i];
        maxPayoffIndex = i;
      }
    }
    return maxPayoffIndex;
  }

  // Calculates the payoff per coalition w.r.t. "min" or "sum"
  private getTransformedPayoffPerUtility(payoff: Payoffs, coalition: string, utility: string, currentPlayerIndex: number) {
    const separateCoalitions = coalition.split(' ');
    payoff.setOutcomes();
    const clonedOutcomes = payoff.outcomesAsDecimals.slice(0);
    separateCoalitions.forEach((separateCoalition: string) => {
      // Assuming less than 9 players, otherwise add commas.
      const separatePlayers = separateCoalition.split('');
      if (separatePlayers.length > 1) {
        const payoffsPerCoalition = [];
        separatePlayers.forEach((player: string) => {
          payoffsPerCoalition.push(clonedOutcomes[Number(player) - 1]);
        });
        const payoffForCoalition = this.getPayoffForCoalition(payoffsPerCoalition, utility);
        separatePlayers.forEach((player: string) => {
          clonedOutcomes[Number(player) - 1] = payoffForCoalition;
        });
      }
    });
    return clonedOutcomes[currentPlayerIndex - 1];
  }

  // Either take the minimum or the sum, when calculating coalitions
  private getPayoffForCoalition(payoffsPerCoalition: Array<number>, utility: string): number {
    if (utility === 'min') {
      return Math.min(...payoffsPerCoalition);
    } else if (utility === 'sum') {
      return payoffsPerCoalition.reduce((a, b) => a + b, 0);
    }
  }

  // The first item has no coalitions. The reset are sorted by payoffs for the player.
  private sortCoalitionsPerNode() {
    this.nodeAllSolutions.forEach((sln: Array<INodeCoalitionSolution>, n: Node) => {
      const firstCoalition = sln.shift();
      const playerPayoffIndex = n.player.id - 1;
      sln.sort((x: INodeCoalitionSolution, y: INodeCoalitionSolution) => {
        return x.payoffs.outcomesAsDecimals[playerPayoffIndex] - y.payoffs.outcomesAsDecimals[playerPayoffIndex];
      });
      sln.unshift(firstCoalition);
    });
  }

  // endregion
  private logResult(nodes: Array<Node>, solutions: Map<Node, Array<INodeCoalitionSolution>>) {
    let result = '';
    solutions.forEach((sln: Array<INodeCoalitionSolution>, n: Node) => {
      result += 'x_' + (nodes.indexOf(n) + 1) + '\n';
      sln.forEach((singleSolution: INodeCoalitionSolution) => {
        result += '  coalition: ' + singleSolution.coalition + ' move: ' + singleSolution.move.label +
          ' payoffs: ' + singleSolution.payoffs.toString() + ' rational: ' + singleSolution.isRational + ' best: ' + singleSolution.isBest + '\n';
      });
      result += '\n';
    });
    return result;
  }

  private logResultHTML() {

  }
}
