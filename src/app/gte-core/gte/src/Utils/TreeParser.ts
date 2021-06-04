import {Move} from '../Model/Move';
import {Tree} from '../Model/Tree';
import {Player} from '../Model/Player';
import {Node, NodeType} from '../Model/Node';
import {ISet} from '../Model/ISet';

import Fraction from 'fraction.js/fraction';
import {PLAYER_COLORS} from './Constants';

export class TreeParser {

  private copyWithoutCircularReferences(tree: Tree) {
    const strippedTree = {
      players: [],
      nodes: [],
      iSets: [],
      moves: [],
      nodePlayerPair: []
    };

    // Copy players
    tree.players.forEach((p: Player) => {
      strippedTree.players.push(new Player(p.id, p.label, PLAYER_COLORS[p.id - 1]));
    });

    // Copy the nodes without any connection to other nodes
    tree.nodes.forEach((n: Node) => {
      const node = new Node();
      node.type = n.type;
      node.depth = n.depth;
      if (node.type === NodeType.OWNED || node.type === NodeType.CHANCE) {
        const ownerIndex = tree.players.indexOf(n.player);
        strippedTree.nodePlayerPair.push({nodeIndex: tree.nodes.indexOf(n), playerIndex: ownerIndex});
      }
      if (n.payoffs) {
        node.payoffs.outcomes = n.payoffs.outcomes;
      }

      strippedTree.nodes.push(node);
    });

    // Copy moves
    tree.moves.forEach((m: Move) => {
      const move = {
        type: null,
        fromIndex: null,
        toIndex: null,
        label: null,
        subscript: null,
        probability: null,
        manuallyAssigned: null
      };

      if (m.label) {
        move.label = m.label;
      }
      if (m.subscript) {
        move.subscript = m.subscript;
      }
      if (m.probability) {
        move.probability = m.probability;
      }
      move.fromIndex = tree.nodes.indexOf(m.from);
      move.toIndex = tree.nodes.indexOf(m.to);
      move.manuallyAssigned = m.manuallyAssigned;

      strippedTree.moves.push(move);
    });

    // Copy iSets
    tree.iSets.forEach((is: ISet) => {
      const iSet = {
        label: null,
        nodeIndexes: []
      };
      is.nodes.forEach((n: Node) => {
        iSet.nodeIndexes.push(tree.nodes.indexOf(n));
      });
      strippedTree.iSets.push(iSet);
    });

    return strippedTree;
  }


  stringify(tree: Tree) {
    const decircularTree = this.copyWithoutCircularReferences(tree);
    return JSON.stringify(decircularTree);
  }

  parse(jsonTree: string) {
    const strippedTree = JSON.parse(jsonTree);

    const clonedTree = new Tree();
    strippedTree.players.forEach((pl: Player) => {
      clonedTree.players.push(new Player(pl.id, pl.label, PLAYER_COLORS[pl.id - 1]));
    });

    strippedTree.nodes.forEach((n: Node) => {
      const node = new Node();
      node.type = n.type;
      node.depth = n.depth;
      node.payoffs.outcomes = [];
      n.payoffs.outcomes.forEach((outcome) => {
        node.payoffs.outcomes.push(new Fraction(outcome));
      });
      clonedTree.nodes.push(node);
    });

    strippedTree.nodePlayerPair.forEach(pair => {
      clonedTree.nodes[pair.nodeIndex].player = clonedTree.players[pair.playerIndex];
    });

    strippedTree.iSets.forEach(is => {
      const iSet = new ISet();
      is.nodeIndexes.forEach(i => {
        iSet.nodes.push(clonedTree.nodes[i]);
        clonedTree.nodes[i].iSet = iSet;
      });
      iSet.player = iSet.nodes[0].player;
      clonedTree.iSets.push(iSet);
    });

    strippedTree.moves.forEach(m => {
      const move = new Move();
      move.label = m.label;
      move.subscript = m.subscript;
      move.probability = new Fraction(m.probability);
      move.manuallyAssigned = m.manuallyAssigned;
      move.from = clonedTree.nodes[m.fromIndex];
      move.to = clonedTree.nodes[m.toIndex];

      move.from.children.push(move.to);
      move.to.parent = move.from;
      move.from.childrenMoves.push(move);
      move.to.parentMove = move;
      clonedTree.moves.push(move);
    });

    clonedTree.root = clonedTree.nodes[0];
    clonedTree.getLeaves();

    return clonedTree;
  }

  fromXML(xmlTree: string) {
    // const jsonTree = converter.xml2json(xmlTree, {compact: true, spaces: 2});
    // console.log(jsonTree);
  }
}

