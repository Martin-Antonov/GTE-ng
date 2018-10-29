/**The class which will calculate the strategic form from the given tree */
import {STRATEGIC_FORM_DELIMITER, STRATEGIC_NOT_LABELED_ERROR_TEXT, STRATEGIC_PLAYERS_ERROR_TEXT} from '../Utils/Constants';
import {Move} from './Move';
import {Node, NodeType} from './Node';
import {Tree} from './Tree';
import {Payoffs} from './Payoffs';
import {ISet} from './ISet';

export class StrategicForm {
  tree: Tree;

  p1Strategies: Array<Array<Move>>;
  p2Strategies: Array<Array<Move>>;
  payoffsMatrix: Array<Array<Payoffs>>;

  rows: Array<string>;
  cols: Array<string>;

  // Properties for the generation of payoffs matrix
  private movesToReachLeafP1: Array<Move>;
  private movesToReachLeafP2: Array<Move>;
  private probabilityPerPath: number;
  private reachableRows: Array<number>;
  private reachableCols: Array<number>;

  constructor(tree: Tree) {
    this.tree = tree;

    this.generateStrategicForm();
  }

  // region Generate strategies
  /**Generates the strategic form, which is stored in two arrays of strategies for P1 and P2*/
  generateStrategicForm() {
    this.checkStrategicFormPossible();

    // The order of information sets is breadth-first. If at some point we wish to change this - swap with dfs.
    let nodes = this.tree.BFSOnTree();
    let p1InfoSets = [];
    let p2InfoSets = [];

    // Get all P1 and P2 information sets and singletons from the BFS order
    nodes.forEach(n => {
      if (n.player === this.tree.players[1]) {
        if (n.iSet && p1InfoSets.indexOf(n.iSet) === -1) {
          p1InfoSets.push(n.iSet);
        }
        else if (!n.iSet) {
          p1InfoSets.push(n);
        }
      }
      else if (n.player === this.tree.players[2]) {
        if (n.iSet && p2InfoSets.indexOf(n.iSet) === -1) {
          p2InfoSets.push(n.iSet);
        }
        else if (!n.iSet) {
          p2InfoSets.push(n);
        }
      }
    });
    this.p1Strategies = [];
    this.p2Strategies = [];
    this.generateStrategies(p1InfoSets);
    this.generateStrategies(p2InfoSets);
    this.generatePayoffs();

    this.rows = this.strategyToString(this.p1Strategies);
    this.cols = this.strategyToString(this.p2Strategies);
  }

  /**A method which checks whether the conditions for generating a strategic form are kept*/
  private checkStrategicFormPossible() {

    if (!this.tree.checkAllNodesLabeled()) {
      throw new Error(STRATEGIC_NOT_LABELED_ERROR_TEXT);
    }
    this.tree.perfectRecallCheck();
  }

  /**A method which generates the strategies for a specific player, given his collection of iSets*/
  generateStrategies(iSets: Array<any>) {
    let currentStrategy = [];
    this.recurseStrategies(iSets, 0, currentStrategy);
  }

  /**A method for the recursive generation of strategies*/
  // We create combinations of all moves, given their specific slot (index) which corresponds to the current
  // node or an information set we are looking at. "Strategy" stores the moves that are played in the recursion.
  private recurseStrategies(iSets, index, strategy) {
    // If we have reached the last slot for the combinations, save it and go back in the recursion.
    if (index === iSets.length) {
      if (iSets[0] && iSets[0].player === this.tree.players[1]) {
        this.p1Strategies.push(strategy.slice(0));
      }
      else if (iSets[0] && iSets[0].player === this.tree.players[2]) {
        this.p2Strategies.push(strategy.slice(0));
      }
      return;
    }

    // Depending on whether the current iSet is a singleton (node) or not, we take the moves and save the nodes
    // of the iSet in an array
    let currentISet;
    let moves = [];

    if (iSets[index] instanceof Node) {
      currentISet = [iSets[index]];
      moves = currentISet[0].childrenMoves;
    }
    else if (iSets[index] instanceof ISet) {
      currentISet = iSets[index].nodes;
      moves = currentISet[0].childrenMoves;
    }

    // We perform a check of whether the node is reachable from the previously played moves by the player
    let isReachable = false;
    if (index !== 0) {
      let nodesToCheckReachability = [];
      strategy.forEach((move: Move) => {
        if (move !== null) {
          if (move.from.iSet === null) {
            nodesToCheckReachability.push(move.to);
          }
          else {
            move.from.iSet.nodes.forEach((n: Node) => {
              n.childrenMoves.forEach((m: Move) => {
                if (m.label === move.label) {
                  nodesToCheckReachability.push(m.to);
                }
              });
            });
          }
        }
      });

      isReachable = this.isReachable(currentISet, nodesToCheckReachability);
    }
    // If the move is the first that a player has played or is reachable, we save it to "strategies" and move on
    if (this.isFirstMove(currentISet[0]) || isReachable) {
      for (let i = 0; i < moves.length; i++) {
        strategy.push(moves[i]);
        this.recurseStrategies(iSets, index + 1, strategy);
        strategy.pop();
      }
    }
    // If the move is not reachable, we push "null" which will later be transformed into a "*"
    else {
      strategy.push(null);
      this.recurseStrategies(iSets, index + 1, strategy);
      strategy.pop();
    }
  }

  /**A helper method for the recursion*/
  private isFirstMove(node: Node) {
    let current = node.parent;
    while (current) {
      if (current.player === node.player) {
        return false;
      }
      current = current.parent;
    }
    return true;
  }

  /**A helper method for the recursion*/
  private findFirstNonNullIndex(strategy, index) {
    for (let i = index - 1; i >= 0; i--) {
      if (strategy[i]) {
        return i;
      }
    }
    return 0;
  }

  /**A helper method to check whether a collection of nodes is reachable from another collection*/
  // "From" is the lower (in terms of the tree) move
  private isReachable(from: Array<Node>, to: Array<Node>) {
    for (let i = 0; i < from.length; i++) {
      let fromNode = from[i];
      for (let j = 0; j < to.length; j++) {
        let toNode = to[j];
        if (this.checkTwoNodesReachable(fromNode, toNode)) {
          return true;
        }
      }
    }
    return false;
  }

  /**A helper method which checks whether a given node is reachable from another given node (used above)*/
  private checkTwoNodesReachable(from: Node, to: Node) {
    // current is the node of the move we start from
    if (from === to) {
      return true;
    }
    let current: Node = from;
    while (current.parent) {
      if (current.parent === to) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  // endregion

  // region Payoff matrices generation
  /**A method for generating the payoffs matrices, to be used in the View. Called after strat form is done*/
  generatePayoffs() {
    let rows = this.p1Strategies.length;
    let cols = this.p2Strategies.length;
    if (rows === 0) {
      rows++;
    }
    if (cols === 0) {
      cols++;
    }
    this.payoffsMatrix = [];
    for (let i = 0; i < rows; i++) {
      this.payoffsMatrix[i] = [];
      for (let j = 0; j < cols; j++) {
        this.payoffsMatrix[i][j] = new Payoffs();
      }
    }
    let leaves = this.tree.getLeaves();
    leaves.forEach((leaf: Node) => {
      this.getMovesPathToRoot(leaf);
      this.reachableRows = [];
      this.reachableCols = [];

      // Vector - either a row or a column
      this.getReachableVectors(this.reachableRows, this.p1Strategies, this.movesToReachLeafP1);
      this.getReachableVectors(this.reachableCols, this.p2Strategies, this.movesToReachLeafP2);

      let payoffsToAdd = leaf.payoffs.outcomes.slice(0);
      for (let i = 0; i < payoffsToAdd.length; i++) {
        payoffsToAdd[i] = payoffsToAdd[i] * this.probabilityPerPath;
      }

      let rowsLength = this.reachableRows.length;
      let colsLength = this.reachableCols.length;
      if (rowsLength === 0) {
        rowsLength++;
      }
      if (colsLength === 0) {
        colsLength++;
      }
      for (let i = 0; i < rowsLength; i++) {
        for (let j = 0; j < colsLength; j++) {
          if (this.reachableRows.length !== 0 && this.reachableCols.length !== 0) {
            this.payoffsMatrix[this.reachableRows[i]][this.reachableCols[j]].add(payoffsToAdd);
          }
          else if (this.reachableRows.length !== 0 && this.reachableCols.length === 0) {
            this.payoffsMatrix[this.reachableRows[i]][j].add(payoffsToAdd);
          }
          else if (this.reachableRows.length === 0 && this.reachableCols.length !== 0) {
            this.payoffsMatrix[i][this.reachableCols[j]].add(payoffsToAdd);
          }
          else {
            this.payoffsMatrix[i][j].add(payoffsToAdd);
          }
        }
      }
    }, this);
    for (let i = 0; i < this.payoffsMatrix.length; i++) {
      for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
        this.payoffsMatrix[i][j].round();
      }
    }
  }

  /**A helper method for the generation of payoffs matrices*/
  private getMovesPathToRoot(leaf: Node) {
    this.movesToReachLeafP1 = [];
    this.movesToReachLeafP2 = [];
    this.probabilityPerPath = 1;
    let current = leaf;
    while (current.parent) {
      if (current.parent.type === NodeType.CHANCE) {
        this.probabilityPerPath *= current.parentMove.probability;
      }
      else if (current.parent.type === NodeType.OWNED) {
        if (current.parent.player === this.tree.players[1]) {
          this.movesToReachLeafP1.push(current.parentMove);
        }
        else if (current.parent.player === this.tree.players[2]) {
          this.movesToReachLeafP2.push(current.parentMove);
        }
      }
      current = current.parent;
    }
  }

  /**A helper method for the generation of payoffs matrices*/
  private getReachableVectors(vector: Array<number>, allStrategies: Array<Array<Move>>, strategiesOnPath: Array<Move>) {
    for (let i = 0; i < allStrategies.length; i++) {
      let currentStrategy = allStrategies[i];
      let containsAllOnPath = true;
      for (let j = 0; j < strategiesOnPath.length; j++) {
        let moveOnPath = strategiesOnPath[j];
        if (this.checkUnreachableMove(currentStrategy, moveOnPath)) {
          containsAllOnPath = false;
          break;
        }
      }
      if (containsAllOnPath) {
        vector.push(i);
      }
    }

    if (vector.length === 0) {
      for (let i = 0; i < allStrategies.length; i++) {
        vector.push(i);
      }
    }
  }

  /**A helper method for the getReachableVectors method*/
  private checkUnreachableMove(strategy: Array<Move>, move: Move) {
    if (strategy.indexOf(move) !== -1) {
      return false;
    }
    else if (move.from.iSet === null) {
      return true;
    }
    else {
      let moveIndex = move.from.childrenMoves.indexOf(move);
      let iSetNodes = move.from.iSet.nodes;
      for (let i = 0; i < iSetNodes.length; i++) {
        if (strategy.indexOf(iSetNodes[i].childrenMoves[moveIndex]) !== -1) {
          return false;
        }
      }
      return true;
    }
  }

  // endregion


  strategyToString(strategies: Array<Array<Move>>) {
    if (strategies.length === 0) {
      return [' '];
    }
    let strategyAsString = [];
    for (let i = 0; i < strategies.length; i++) {
      let str = '';
      for (let j = 0; j < strategies[i].length; j++) {
        let current = strategies[i][j];
        if (current) {
          str += current.label + STRATEGIC_FORM_DELIMITER;
        }
        else {
          str += '*' + STRATEGIC_FORM_DELIMITER;
        }

      }
      strategyAsString.push(str.substring(0, str.length - 1));
    }
    return strategyAsString;
  }

  // For debugging purposes
  private currentPathToString(leaf: Node) {
    let result = '' + leaf.payoffs.outcomes + '-> ';
    this.movesToReachLeafP1.forEach(m => {
      result += m.label + ' ';
    });
    result += '|| ';
    this.movesToReachLeafP2.forEach(m => {
      result += m.label + ' ';
    });
    result += '\nReachable Rows: ' + this.reachableRows.join(',');
    result += '\nReachable Cols: ' + this.reachableCols.join(',');
    console.log(result);
  }

  destroy() {
    this.p1Strategies = null;
    this.p2Strategies = null;
  }
}

