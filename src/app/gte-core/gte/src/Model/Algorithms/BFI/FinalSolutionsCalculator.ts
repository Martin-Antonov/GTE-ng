import {Node, NodeType} from '../../Node';
import {INodeCoalitionSolution} from './INodeCoalitionSolution';
import {Tree} from '../../Tree';
import {CoalitionsCalculator} from './CoalitionsCalculator';
import {Payoffs} from '../../Payoffs';
import {Player} from '../../Player';

export class FinalSolutionsCalculator {
  finalSolutions: Map<Node, Array<INodeCoalitionSolution>>;
  private nodeAllSolutions: Map<Node, Array<INodeCoalitionSolution>>;
  private coalitionsCalculator: CoalitionsCalculator;

  constructor(coalitionsCalculator: CoalitionsCalculator) {
    this.coalitionsCalculator = coalitionsCalculator;
  }

  calculate(nodeAllSolutions: Map<Node, Array<INodeCoalitionSolution>>, tree: Tree): Map<Node, Array<INodeCoalitionSolution>> {
    this.nodeAllSolutions = nodeAllSolutions;
    this.finalSolutions = new Map();
    this.createFinalSolutions(tree);
    this.saveStrategies(tree);
    return this.finalSolutions;
  }

  private createFinalSolutions(tree: Tree) {
    this.nodeAllSolutions.forEach((sln: Array<INodeCoalitionSolution>, n: Node) => {
      this.finalSolutions.set(n, []);
      const branchChildren = tree.getBranchChildren(n);
      const players = [n.player.id];
      branchChildren.forEach((c: Node) => {
        if (c.player && !players.includes(c.player.id)) {
          players.push(c.player.id);
        }
      });
      players.sort((x: number, y: number) => {
        return x - y;
      });

      // get all possible coalitions which are under the given node.
      const coalitions = this.coalitionsCalculator.getSetOfSubsets(players);
      const convertedCoalitions = this.coalitionsCalculator.calculateSubsetsShorthand(coalitions).split('\n', coalitions.length).reverse();
      // If it is the last decision node, mark it as best
      if (convertedCoalitions.length === 1) {
        this.finalSolutions.get(n).push({
          coalition: sln[0].coalition,
          move: sln[0].move,
          payoffs: sln[0].payoffs,
          isBest: true,
          isRational: true
        });
      } else { // If there are 2 players under the given node, take only both coalitions and calculate best and rational
        sln.forEach((singleSolution: INodeCoalitionSolution) => {
          for (let i = 0; i < convertedCoalitions.length; i++) {
            if (!this.checkCoalitionInclusion(singleSolution.coalition, n.player.id.toString()) &&
              this.checkCoalitionInclusion(singleSolution.coalition, convertedCoalitions[i]) &&
              !this.coalitionAlreadyExists(n, convertedCoalitions[i])) {

              this.finalSolutions.get(n).push({
                coalition: singleSolution.coalition,
                move: singleSolution.move,
                payoffs: singleSolution.payoffs,
                isBest: false,
                isRational: false
              });
            }
          }
        });
        this.pushAlonePlayerSolution(n);
        this.removeSameCoalitions(n);
        const allSolutionCoalitions = [];
        this.finalSolutions.get(n).forEach((singleSolution: INodeCoalitionSolution) => {
          allSolutionCoalitions.push(singleSolution.coalition);
        });

        this.checkRationalityAndBestResponse(allSolutionCoalitions, this.finalSolutions.get(n), tree.players);
      }
    });
  }
  private pushAlonePlayerSolution(n: Node) {
    const bestSolutions = [];
    n.children.forEach((c: Node) => {
      if (c.type === NodeType.LEAF) {
        bestSolutions.push({
          child: c, sln: {
            coalition: this.nodeAllSolutions.get(n)[0].coalition,
            move: c.parentMove,
            payoffs: c.payoffs,
            isRational: false,
            isBest: false,
          }
        });
        return;
      }
      const bestSolution = this.finalSolutions.get(c).find((sln: INodeCoalitionSolution) => {
        return sln.isBest;
      });
      bestSolutions.push({child: c, sln: bestSolution});
    });

    bestSolutions.sort((x: { child: Node, sln: INodeCoalitionSolution }, y: { child: Node, sln: INodeCoalitionSolution }) => {
      return y.sln.payoffs.outcomesAsDecimals[n.player.id - 1] - x.sln.payoffs.outcomesAsDecimals[n.player.id - 1];
    });

    const best: { child: Node, sln: INodeCoalitionSolution } = bestSolutions[0];

    this.finalSolutions.get(n).unshift({
      coalition: best.sln.coalition,
      move: best.child.parentMove,
      payoffs: best.sln.payoffs,
      isRational: true,
      isBest: false,
    });
  }

  // Removes repeated coalitions for nodes with more players and further down the tree (e.g.) Could be removed, but shouldn't be touched really...
  private coalitionAlreadyExists(n: Node, convertedCoalition: string) {
    let result = false;

    this.finalSolutions.get(n).forEach((singleSolution: INodeCoalitionSolution) => {
      if (this.checkCoalitionInclusion(singleSolution.coalition, convertedCoalition)) {
        result = true;
      }
    });
    return result;
  }

  // region Remove unnecessary coalitions for active player
  // Main Method
  private removeSameCoalitions(n: Node) {
    const solutions = this.finalSolutions.get(n);
    for (let i = 1; i < solutions.length; i++) {
      for (let j = i + 1; j < solutions.length; j++) {
        if (this.checkActivePlayerSameCoalition(solutions[i].coalition, solutions[j].coalition, n.player.id)) {
          const secondSolution = solutions[j];
          this.finalSolutions.get(n).splice(j, 1);
          j--;
          if (secondSolution.payoffs !== solutions[i].payoffs && this.isSecondSolutionBetterForNonActivePlayers(solutions[i], secondSolution, n.player.id)) {
            solutions[i] = secondSolution;
          }
        }
      }
    }
  }
  // Checks whether the two coalitions are actually the same for the active player
  private checkActivePlayerSameCoalition(coalitions1: string, coalitions2: string, id: number) {
    const coalition1WithPlayer = coalitions1.split(' ').find((x: string) => {
      return x.includes(id.toString());
    });
    const coalition2WithPLayer = coalitions2.split(' ').find((x: string) => {
      return x.includes(id.toString());
    });
    return coalition1WithPlayer === coalition2WithPLayer;
  }

  // Checks whether we should replace the first occurrence of the same coalitions for the active player with the next found (if better for non-active players)
  private isSecondSolutionBetterForNonActivePlayers(sol1: INodeCoalitionSolution, sol2: INodeCoalitionSolution, id: number): boolean {
    const sol1CoalitionWithoutActivePlayer = sol1.coalition
      .split(' ')
      .filter((x: string) => {
        return !x.includes(id.toString());
      })
      .join(' ');

    const nonActivePlayers = [];
    for (let i = 0; i < sol1CoalitionWithoutActivePlayer.length; i++) {
      const player = sol1CoalitionWithoutActivePlayer[i];
      if (player !== ' ') {
        nonActivePlayers.push(player);
      }
    }
    let isSecondRational = true;
    nonActivePlayers.forEach((playerID: string) => {
      if (!this.isNewSolutionRationalForPlayer(playerID, sol1.payoffs, sol2.payoffs)) {
        isSecondRational = false;
      }
    });

    return isSecondRational;
  }
  // endregion

  // region Rationality and Best Response checks
  // Main Method - checks pairwise whether the "next" solution is rational and better than the previous rational solution
  private checkRationalityAndBestResponse(coalitions: Array<string>, sln: Array<INodeCoalitionSolution>, playersFromTree: Array<Player>) {
    let i = 0;
    let j = 1;
    sln[0].isRational = true;
    const players = [];
    playersFromTree.forEach((player: Player) => {
      if (coalitions[0].includes(player.id.toString())) {
        players.push(player.id.toString());
      }
    });
    while (i < coalitions.length && j < coalitions.length) {
      const coalition1 = coalitions[i];
      const coalition2 = coalitions[j];
      let isRational = true;
      players.forEach((playerID: string) => {
        if (this.checkCoalitionInclusion(coalition1, playerID) && !this.checkCoalitionInclusion(coalition2, playerID)) {
          const playersInCoalition = coalition2.split(' ').find((coal: string) => {
            return coal.includes(playerID);
          }).split('');
          for (let k = 0; k < playersInCoalition.length; k++) {
            const pID = playersInCoalition[k];
            if (!this.isNewSolutionRationalForPlayer(pID, sln[i].payoffs, sln[j].payoffs)) {
              isRational = false;
              return;
            }
          }
        }
      });
      if (isRational) {
        sln[j].isRational = true;
        i = j;
        j = i + 1;
      } else {
        j++;
      }
    }
    sln[i].isBest = true;
  }

  // A simple method for checking whether the payoff is better for a given player in 2 payoffs.
  private isNewSolutionRationalForPlayer(playerID: string, payoffsOld: Payoffs, payoffsNew: Payoffs) {
    return payoffsOld.outcomesAsDecimals[Number(playerID) - 1] < payoffsNew.outcomesAsDecimals[Number(playerID) - 1];
  }

  // Checks whether the "converted" coalition for the active player is included in the main coalition.
  private checkCoalitionInclusion(coalition: string, convertedCoalition: string): boolean {
    const separatePlayers = convertedCoalition.split(' ');
    // If players are separate
    if (separatePlayers.length * 2 - 1 === convertedCoalition.length && convertedCoalition.length > 1) {
      for (let i = 0; i < separatePlayers.length; i++) {
        if (!this.checkCoalitionInclusion(coalition, separatePlayers[i])) {
          return false;
        }
      }
      return true;
    } else {
      return coalition.startsWith(convertedCoalition + ' ') ||
        coalition.endsWith(' ' + convertedCoalition) ||
        coalition.includes(' ' + convertedCoalition + ' ') ||
        coalition === convertedCoalition;
    }
  }
  // endregion

  // The rest is for logging final solution purposes
  private saveStrategies(tree: Tree) {
    const leaves = tree.getLeaves();
    this.finalSolutions.forEach((sln: Array<INodeCoalitionSolution>, n: Node) => {
      sln.forEach((singleSolution: INodeCoalitionSolution) => {
        const leaf = leaves.find((l: Node) => {
          return l.payoffs === singleSolution.payoffs;
        });
        singleSolution.strategy = this.getStrategyFromNode(leaf);
      });
    });
  }


  private getStrategyFromNode(leaf: Node) {
    let strategy = '';
    while (leaf.parent) {
      strategy += leaf.parentMove.label + ' ';
      leaf = leaf.parent;
    }

    strategy = strategy.split('').reverse().join('');
    strategy = strategy.trim();
    return strategy;
  }


}
