import {AbstractAction} from './AbstractAction';
import {TreeController} from '../../Main/TreeController';
import {Node} from '../../../Model/Node';

export class ChangePlayerLabel extends AbstractAction {
  oldLabel: string;
  newLabel: string;
  playerIndex: number;

  constructor(treeController: TreeController, oldLabel: string, newLabel: string, playerIndex: number) {
    super(treeController);
    this.oldLabel = oldLabel;
    this.newLabel = newLabel;
    this.playerIndex = playerIndex;
  }

  executeAction(undo: boolean) {
    this.treeController.tree.players[this.playerIndex].label = undo ? this.oldLabel : this.newLabel;
    this.treeController.tree.nodes.forEach((n: Node) => {
      if (n.player === this.treeController.tree.players[this.playerIndex]) {
        const nV = this.treeController.treeView.findNodeView(n);
        nV.ownerLabel.setText(n.player.label);
        nV.updateLabelPosition();

        if (n.iSet) {
          const iSetV = this.treeController.treeView.findISetView(n.iSet);
          if (iSetV.label.text !== n.iSet.player.label) {
            iSetV.label.setText(n.iSet.player.label);
          }
        }
      }
    });
  }

  destroy() {
  }

}
