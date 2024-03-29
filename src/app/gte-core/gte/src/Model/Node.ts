/**The types of Node. If a node does not have type, it can be deleted */
import {Move} from './Move';
import {ISet} from './ISet';
import {Player} from './Player';
import {Payoffs} from './Payoffs';

export enum NodeType {DEFAULT = 1, CHANCE, OWNED, LEAF}

/**The class Node. Each Node has a type, parent, parentMove, children, childrenMoves, iSet, player, depth and payoff */
export class Node {
  type: NodeType;
  parent: Node;
  parentMove: Move;
  children: Array<Node>;
  childrenMoves: Array<Move>;
  iSet: ISet;
  player: Player;
  depth: number;
  payoffs: Payoffs;

  constructor(depth?: number, type?: NodeType, parent?: Node) {
    this.depth = depth || 0;
    this.type = type || NodeType.DEFAULT;
    this.parent = parent || null;
    this.children = [];
    this.childrenMoves = [];
    this.player = null;
    this.iSet = null;
    this.payoffs = new Payoffs();
  }

  /**The method adds a child to the current Node. */
  addChild(node?: Node) {
    const child = node || new Node();

    child.parent = this;
    child.type = NodeType.DEFAULT;
    child.depth = this.depth + 1;

    this.children.push(child);
    const move = new Move(this, child);
    child.parentMove = move;
    this.childrenMoves.push(move);
  }

  /**The method removes a given child from the Node (currently not used anywhere)*/
  removeChild(node: Node) {
    if (this.children.indexOf(node) !== -1) {
      this.children.splice(this.children.indexOf(node), 1);
      node.destroy();
    }
  }

  /**Converts the current Node to a default Node. If the node is in iSet, convert all nodes in the iSet */
  convertToDefault() {
    const nodesToConvert = [];
    if (this.iSet) {
      this.iSet.nodes.forEach((n: Node) => {
        nodesToConvert.push(n);
      });
      this.iSet.player = null;
    } else {
      nodesToConvert.push(this);
    }

    nodesToConvert.forEach((n: Node) => {
      n.type = NodeType.DEFAULT;
      n.player = null;
      n.childrenMoves.forEach((m: Move) => m.convertToDefault());
    });
  }

  /**Converts the current Node to a labeled, by setting an player */
  convertToLabeled(player: Player) {
    if (this.children.length > 0) {
      if (this.iSet && this.iSet.nodes) {
        this.iSet.player = player;
        for (let i = 0; i < this.iSet.nodes.length; i++) {
          const n = this.iSet.nodes[i];
          n.type = NodeType.OWNED;
          n.player = player;
          for (let j = 0; j < n.childrenMoves.length; j++) {
            const m = n.childrenMoves[j];
            m.convertToLabeled(this.iSet.nodes[0].childrenMoves[j].label);
          }
        }
      } else {
        const playerTheSame = this.player === player;
        this.type = NodeType.OWNED;
        this.player = player;
        this.childrenMoves.forEach((m: Move) => {
            if (!playerTheSame) {
              m.manuallyAssigned = false;
              m.convertToLabeled();
            } else {
              m.convertToLabeled(m.label);
            }
          }
        );
      }
    }
  }

  /**Converts the current Node to a leaf node, by setting payoffs */
  convertToLeaf() {
    this.type = NodeType.LEAF;
    this.player = null;
    if (this.iSet) {
      this.iSet.removeNode(this);
    }
  }

  /**Converts the current Node to a chance Node, setting the player to the chancePlayer and assigning probabilities to children moves*/
  convertToChance(chancePlayer: Player, probabilities?: Array<number>) {
    if (this.children.length > 0 && this.iSet === null) {
      this.type = NodeType.CHANCE;

      if (chancePlayer.id === 0) {
        this.player = chancePlayer;
      } else {
        throw new Error('Given player is not a chance player');
      }

      if (this.iSet) {
        this.iSet.removeNode(this);
      }

      if (probabilities && this.childrenMoves.length === probabilities.length) {
        for (let i = 0; i < this.childrenMoves.length; i++) {
          this.childrenMoves[i].convertToChance(1 / probabilities[i]);
        }
      } else if (probabilities && this.childrenMoves.length !== probabilities.length) {
        throw new SyntaxError('Number of probabilities does not match number of moves!');
      } else {
        this.childrenMoves.forEach((m: Move) => m.convertToChance(1 / this.childrenMoves.length));
      }
    }
  }

  /**A method which returns the path from a given node to the root*/
  getPathToRoot() {
    const path = [];
    let node = <Node>this;
    while (node.parent !== null) {
      path.push(node.parent);
      node = node.parent;
    }
    return path;
  }

  /**Destroy ensures that there are no memory-leaks. */
  destroy() {
    this.type = null;
    this.depth = null;
    this.player = null;
    if (this.parent) {
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }
    if (this.iSet) {
      this.iSet.removeNode(this);
      this.iSet = null;
    }
    if (this.payoffs) {
      this.payoffs.destroy();
      this.payoffs = null;
    }
    if (this.children.length > 0) {
      this.children.forEach((c: Node) => c.destroy());
      this.children = null;
    }
    if (this.childrenMoves.length > 0) {
      this.childrenMoves.forEach((m: Move) => {
        m.destroy();
      });
      this.childrenMoves = null;
    }
  }
}
