import {Node, NodeType} from './Node';
import {Move} from './Move';

export class LabelSetter {
  labels: Array<Array<string>>;
  initiallyAssigned: boolean;

  constructor() {
    this.labels = [];
    this.labels[0] = 'ABCDEFGHIJK'.split('');
    this.labels[1] = 'abcdefghijklmno'.split('');
    this.labels[2] = 'LMNOPQRSTUVWXYZ'.split('');
    this.labels[3] = 'pqrstuvwxyz'.split('');
    this.initiallyAssigned = false;
  }

  /** Calculates and sets the labels for moves in a BFS order*/
  calculateLabels(bfsNodes: Array<Node>, moves: Array<Move>) {
    bfsNodes.forEach((n: Node) => {
      if (n.parentMove && !n.parentMove.manuallyAssigned) {
        n.parentMove.label = '';
      }
    });
    bfsNodes.forEach((n: Node) => {
      if (n.type === NodeType.OWNED) {
        // reference the labels depending on the player
        let labelsForPlayer = this.labels[n.player.id - 1];
        // If it is not in an information set, give the moves labels
        if (n.iSet === null) {
          n.children.forEach((c: Node) => {
            // Assign new label only if not manually assigned
            if (!c.parentMove.manuallyAssigned) {
              let label = this.getFirstUnassignedLabel(labelsForPlayer, moves, n.player.id);
              c.parentMove.convertToLabeled(label);
            }
          });
        }
        // If it is an information set and it is the 1st such node in the set, give labels
        // to all moves in the information set
        else if (n === n.iSet.nodes[0]) {
          n.children.forEach((c: Node) => {
            // Assign new move label only if not manually assigned
            if (!c.parentMove.manuallyAssigned) {
              let label = this.getFirstUnassignedLabel(labelsForPlayer, moves, n.player.id);
              c.parentMove.convertToLabeled(label);
            }
          });

          for (let i = 1; i < n.iSet.nodes.length; i++) {
            let iSetNode = n.iSet.nodes[i];
            for (let j = 0; j < iSetNode.children.length; j++) {
              iSetNode.children[j].parentMove.label = n.children[j].parentMove.label;
            }
          }
        }
      }
    });
  }

  getFirstUnassignedLabel(labelsForPlayer: Array<string>, moves: Array<Move>, playerID: number) {
    let allMoveLabelsByCurrentPlayer = [];
    moves.forEach((m: Move) => {
      if (m.from.type === NodeType.OWNED && m.from.player.id === playerID) {
        allMoveLabelsByCurrentPlayer.push(m.label);
      }
    });
    for (let i = 0; i < labelsForPlayer.length; i++) {
      if (allMoveLabelsByCurrentPlayer.indexOf(labelsForPlayer[i]) === -1) {
        return labelsForPlayer[i];
      }
    }
  }
}

