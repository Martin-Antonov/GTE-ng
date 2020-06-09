import {Tree} from '../../Tree';
import {Node} from '../../Node';
import {Player} from '../../Player';

export class CoalitionsCalculator {
  private coalitions: Array<Array<Array<number>>>;
  private coalitionsAsString: Array<string>;

  /**A subset is coalition is represented as a string "12 34", for example*/
  calculate(tree: Tree): Array<string> {
    // Players which are present in the tree, but not chance, given by their indexes in the tree players array
    const activePlayersIndexes = this.getTreePlayers(tree);

    // Triply nested array to represent coops e.g {[(1),(2),(3)], [(1,2),(3)],...}
    this.coalitions = this.getSetOfSubsets(activePlayersIndexes);
    const coalitionsAsString = this.calculateSubsetsShorthand(this.coalitions);
    this.coalitionsAsString = coalitionsAsString.split('\n', this.coalitions.length);

    return this.coalitionsAsString.reverse();
  }

  private getTreePlayers(tree: Tree) {
    const result = [];
    tree.nodes.forEach((n: Node) => {
      if (n.player && n.player.id !== 0 && !result.includes(n.player)) {
        result.push(n.player);
      }
    });

    return result.map((player: Player) => {
      return tree.players.indexOf(player);
    });
  }


  getSetOfSubsets(elements: Array<number>) {
    // outer array
    const coalitions = [];
    // const dummySubsets to be filled within the recursion loop with a final viable option of cooperation.
    const dummySubsets = [];
    for (let i = 0; i < elements.length; i++) {
      dummySubsets.push([]);
    }
    this.recurseSubsets(coalitions, dummySubsets, elements, 0);
    return coalitions;
  }

  private recurseSubsets(coalitions: Array<Array<Array<number>>>, dummySubsets: Array<Array<number>>, elements: Array<number>, i: number) {
    // Recursion Bottom: save elements
    if (i === elements.length) {
      this.saveDummyArrayToResult(coalitions, dummySubsets, elements);
      return;
    }
    for (let j = 0; j < dummySubsets.length; j++) {
      if (j === 0 || dummySubsets[j - 1].length !== 0) {
        dummySubsets[j].push(i);
        this.recurseSubsets(coalitions, dummySubsets, elements, i + 1);
        dummySubsets[j].pop();
      }
    }
  }

  private saveDummyArrayToResult(coalitions: Array<Array<Array<number>>>, dummySubsets: Array<Array<number>>, elements: Array<number>) {
    const cloned = [];
    dummySubsets.forEach((subset: Array<number>) => {
      if (subset.length !== 0) {
        const clonedSubArray = [];
        subset.forEach((playerIndex: number) => {
          clonedSubArray.push(elements[playerIndex]);
        });
        cloned.push(clonedSubArray);
      }
    });
    cloned.forEach((subArray: Array<number>) => {
      subArray.sort((x, y) => {
        return x - y;
      });
    });
    coalitions.push(cloned);
  }

  private logSubsets() {
    let result = '';
    for (let i = 0; i < this.coalitions.length; i++) {
      for (let j = 0; j < this.coalitions[i].length; j++) {
        result += '(' + this.coalitions[i][j].join(',') + ')';
      }
      result += '\n';
    }
    return result;
  }

  calculateSubsetsShorthand(coalitions: Array<Array<Array<number>>>) {
    let result = '';
    for (let i = 0; i < coalitions.length; i++) {
      let row = '';
      for (let j = 0; j < coalitions[i].length; j++) {
        const extraSpace = j === coalitions[i].length - 1 ? '' : ' ';
        row += coalitions[i][j].join('') + extraSpace;
      }
      row = row.split(' ').sort().join(' ');
      result += row + '\n';
    }
    return result;
  }
}
