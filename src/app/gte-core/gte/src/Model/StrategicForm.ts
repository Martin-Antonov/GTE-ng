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
  p3Strategies: Array<Array<Move>>;
  p4Strategies: Array<Array<Move>>;

  // 4 dimensional array of strategies - 1 for each player
  payoffsMatrix: Array<Array<Array<Array<Payoffs>>>>;

  p1rows: Array<string>;
  p2cols: Array<string>;
  p3rows: Array<string>;
  p4cols: Array<string>;
  // Properties for the generation of payoffs matrix
  private movesToReachLeafP1: Array<Move>;
  private movesToReachLeafP2: Array<Move>;
  private movesToReachLeafP3: Array<Move>;
  private movesToReachLeafP4: Array<Move>;

  private probabilityPerPath: number;

  private reachableP1Rows: Array<number>;
  private reachableP2Cols: Array<number>;
  private reachableP3Rows: Array<number>;
  private reachableP4Cols: Array<number>;

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
    let p3InfoSets = [];
    let p4InfoSets = [];

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
      else if (n.player === this.tree.players[3]) {
        if (n.iSet && p3InfoSets.indexOf(n.iSet) === -1) {
          p3InfoSets.push(n.iSet);
        }
        else if (!n.iSet) {
          p3InfoSets.push(n);
        }
      }
      else if (n.player === this.tree.players[4]) {
        if (n.iSet && p4InfoSets.indexOf(n.iSet) === -1) {
          p4InfoSets.push(n.iSet);
        }
        else if (!n.iSet) {
          p4InfoSets.push(n);
        }
      }
    });
    this.p1Strategies = [];
    this.p2Strategies = [];
    this.p3Strategies = [];
    this.p4Strategies = [];

    this.generateStrategies(p1InfoSets);
    this.generateStrategies(p2InfoSets);
    this.generateStrategies(p3InfoSets);
    this.generateStrategies(p4InfoSets);
    this.generatePayoffs();

    this.p1rows = this.strategyToString(this.p1Strategies);
    this.p2cols = this.strategyToString(this.p2Strategies);
    this.p3rows = this.strategyToString(this.p3Strategies);
    this.p4cols = this.strategyToString(this.p4Strategies);

    this.calculateBestResponses();
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
      else if (iSets[0] && iSets[0].player === this.tree.players[3]) {
        this.p3Strategies.push(strategy.slice(0));
      }
      else if (iSets[0] && iSets[0].player === this.tree.players[4]) {
        this.p4Strategies.push(strategy.slice(0));
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
    let p1rows = this.p1Strategies.length;
    let p2cols = this.p2Strategies.length;
    let p3rows = this.p3Strategies.length;
    let p4cols = this.p4Strategies.length;
    if (p1rows === 0) {
      p1rows++;
    }
    if (p2cols === 0) {
      p2cols++;
    }
    if (p3rows === 0) {
      p3rows++;
    }
    if (p4cols === 0) {
      p4cols++;
    }
    this.payoffsMatrix = [];
    for (let i = 0; i < p1rows; i++) {
      this.payoffsMatrix[i] = [];
      for (let j = 0; j < p2cols; j++) {
        this.payoffsMatrix[i][j] = [];
        for (let k = 0; k < p3rows; k++) {
          this.payoffsMatrix[i][j][k] = [];
          for (let l = 0; l < p4cols; l++) {
            this.payoffsMatrix[i][j][k][l] = new Payoffs();
          }
        }
      }
    }
    let leaves = this.tree.getLeaves();
    leaves.forEach((leaf: Node) => {
      this.getMovesPathToRoot(leaf);
      this.reachableP1Rows = [];
      this.reachableP2Cols = [];
      this.reachableP3Rows = [];
      this.reachableP4Cols = [];

      // Vector - either a row or a column
      this.getReachableVectors(this.reachableP1Rows, this.p1Strategies, this.movesToReachLeafP1);
      this.getReachableVectors(this.reachableP2Cols, this.p2Strategies, this.movesToReachLeafP2);
      this.getReachableVectors(this.reachableP3Rows, this.p3Strategies, this.movesToReachLeafP3);
      this.getReachableVectors(this.reachableP4Cols, this.p4Strategies, this.movesToReachLeafP4);


      let payoffsToAdd = leaf.payoffs.outcomes.slice(0);
      for (let i = 0; i < payoffsToAdd.length; i++) {
        payoffsToAdd[i] = payoffsToAdd[i] * this.probabilityPerPath;
      }

      let rowsP1Length = this.reachableP1Rows.length;
      let colsP2Length = this.reachableP2Cols.length;
      let rowsP3Length = this.reachableP3Rows.length;
      let colsP4Length = this.reachableP4Cols.length;
      if (rowsP1Length === 0) {
        rowsP1Length++;
      }
      if (colsP2Length === 0) {
        colsP2Length++;
      }
      if (rowsP3Length === 0) {
        rowsP3Length++;
      }
      if (colsP4Length === 0) {
        colsP4Length++;
      }
      for (let i = 0; i < rowsP1Length; i++) {
        for (let j = 0; j < colsP2Length; j++) {
          for (let k = 0; k < rowsP3Length; k++) {
            for (let l = 0; l < colsP4Length; l++) {
              // if (this.reachableP1Rows.length !== 0 && this.reachableP2Cols.length !== 0) {
              //   this.payoffsMatrix[this.reachableP1Rows[i]][this.reachableP2Cols[j]].add(payoffsToAdd);
              // }
              // else if (this.reachableP1Rows.length !== 0 && this.reachableP2Cols.length === 0) {
              //   this.payoffsMatrix[this.reachableP1Rows[i]][j].add(payoffsToAdd);
              // }
              // else if (this.reachableP1Rows.length === 0 && this.reachableP2Cols.length !== 0) {
              //   this.payoffsMatrix[i][this.reachableP2Cols[j]].add(payoffsToAdd);
              // }
              // else {
              //   this.payoffsMatrix[i][j].add(payoffsToAdd);
              // }
              let p1Index = this.reachableP1Rows.length !== 0 ? this.reachableP1Rows[i] : i;
              let p2Index = this.reachableP2Cols.length !== 0 ? this.reachableP2Cols[j] : j;
              let p3Index = this.reachableP3Rows.length !== 0 ? this.reachableP3Rows[k] : k;
              let p4Index = this.reachableP4Cols.length !== 0 ? this.reachableP4Cols[l] : l;
              this.payoffsMatrix[p1Index][p2Index][p3Index][p4Index].add(payoffsToAdd);
            }
          }
        }
      }
    }, this);
    for (let i = 0; i < this.payoffsMatrix.length; i++) {
      for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
        for (let k = 0; k < this.payoffsMatrix[0][0].length; k++) {
          for (let l = 0; l < this.payoffsMatrix[0][0][0].length; l++) {
            this.payoffsMatrix[i][j][k][l].round();
          }
        }
      }
    }
  }

  /**A helper method for the generation of payoffs matrices*/
  private getMovesPathToRoot(leaf: Node) {
    this.movesToReachLeafP1 = [];
    this.movesToReachLeafP2 = [];
    this.movesToReachLeafP3 = [];
    this.movesToReachLeafP4 = [];
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
        else if (current.parent.player === this.tree.players[3]) {
          this.movesToReachLeafP3.push(current.parentMove);
        }
        else if (current.parent.player === this.tree.players[4]) {
          this.movesToReachLeafP4.push(current.parentMove);
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

  private calculateBestResponses() {
    // Player 4
    for (let i = 0; i < this.payoffsMatrix.length; i++) {
      for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
        for (let k = 0; k < this.payoffsMatrix[0][0].length; k++) {
          let maxPayoff = -1000000;
          let maxIndices = [];
          for (let l = 0; l < this.payoffsMatrix[0][0][0].length; l++) {
            if (maxPayoff < this.payoffsMatrix[i][j][k][l].outcomes[3]) {
              maxPayoff = this.payoffsMatrix[i][j][k][l].outcomes[3];
              maxIndices = [l];
            }
            else if (maxPayoff === this.payoffsMatrix[i][j][k][l].outcomes[3]) {
              maxIndices.push(l);
            }
          }
          maxIndices.forEach((index) => {
            this.payoffsMatrix[i][j][k][index].isBestResponce[3] = true;
          });
        }
      }
    }

    // Player 3
    for (let i = 0; i < this.payoffsMatrix.length; i++) {
      for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
        for (let l = 0; l < this.payoffsMatrix[0][0][0].length; l++) {
          let maxPayoff = -1000000;
          let maxIndices = [];
          for (let k = 0; k < this.payoffsMatrix[0][0].length; k++) {
            if (maxPayoff < this.payoffsMatrix[i][j][k][l].outcomes[2]) {
              maxPayoff = this.payoffsMatrix[i][j][k][l].outcomes[2];
              maxIndices = [k];
            }
            else if (maxPayoff === this.payoffsMatrix[i][j][k][l].outcomes[2]) {
              maxIndices.push(k);
            }
          }
          maxIndices.forEach((index) => {
            this.payoffsMatrix[i][j][index][l].isBestResponce[2] = true;
          });
        }
      }
    }

    for (let i = 0; i < this.payoffsMatrix.length; i++) {
      for (let l = 0; l < this.payoffsMatrix[0][0][0].length; l++) {
        for (let k = 0; k < this.payoffsMatrix[0][0].length; k++) {
          let maxPayoff = -1000000;
          let maxIndices = [];
          for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
            if (maxPayoff < this.payoffsMatrix[i][j][k][l].outcomes[1]) {
              maxPayoff = this.payoffsMatrix[i][j][k][l].outcomes[1];
              maxIndices = [j];
            }
            else if (maxPayoff === this.payoffsMatrix[i][j][k][l].outcomes[1]) {
              maxIndices.push(j);
            }
          }
          maxIndices.forEach((index) => {
            this.payoffsMatrix[i][index][k][l].isBestResponce[1] = true;
          });
        }
      }
    }

    for (let l = 0; l < this.payoffsMatrix[0][0][0].length; l++) {
      for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
        for (let k = 0; k < this.payoffsMatrix[0][0].length; k++) {
          let maxPayoff = -1000000;
          let maxIndices = [];
          for (let i = 0; i < this.payoffsMatrix.length; i++) {
            if (maxPayoff < this.payoffsMatrix[i][j][k][l].outcomes[0]) {
              maxPayoff = this.payoffsMatrix[i][j][k][l].outcomes[0];
              maxIndices = [i];
            }
            else if (maxPayoff === this.payoffsMatrix[i][j][k][l].outcomes[0]) {
              maxIndices.push(i);
            }
          }
          maxIndices.forEach((index) => {
            this.payoffsMatrix[index][j][k][l].isBestResponce[0] = true;
          });
        }
      }
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
    result += '\nReachable Rows: ' + this.reachableP1Rows.join(',');
    result += '\nReachable Cols: ' + this.reachableP2Cols.join(',');
    console.log(result);
  }

  // For debugging purposes:
  private matrixToString() {
    let result = '';
    for (let k = 0; k < this.payoffsMatrix[0][0].length; k++) {
      for (let i = 0; i < this.payoffsMatrix.length; i++) {
        for (let l = 0; l < this.payoffsMatrix[0][0][0].length; l++) {
          for (let j = 0; j < this.payoffsMatrix[0].length; j++) {
            result += '(' + this.payoffsMatrix[i][j][k][l].outcomes.join(',') + ')';
            result += ' ';
          }
          result += '    ';
        }
        result += '\n';
      }
      result += '\n\n\n';
    }

    console.log(result);
  }

  destroy() {
    this.p1Strategies = null;
    this.p2Strategies = null;
    this.p3Strategies = null;
    this.p4Strategies = null;
  }
}

