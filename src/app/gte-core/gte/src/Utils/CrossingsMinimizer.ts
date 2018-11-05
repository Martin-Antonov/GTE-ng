/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {TreeView} from '../View/TreeView';
import {ISetView} from '../View/ISetView';
import {NodeView} from '../View/NodeView';
import {Node} from '../Model/Node';

export class CrossingsMinimizer {
  treeView: TreeView;

  constructor(treeView: TreeView) {
    this.treeView = treeView;
  }

  equalizeInfoSetsLevels() {
    /** A method for changing depth of nodes in order to minimize crossings for information sets*/
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      let maxDepthOfISet = -1;
      iSetV.nodes.forEach((nV: NodeView) => {
        if (nV.level > maxDepthOfISet) {
          maxDepthOfISet = nV.level;
        }
      });

      iSetV.nodes.forEach((nV: NodeView) => {
        if (nV.level !== maxDepthOfISet) {
          let branchChildren = this.treeView.tree.getBranchChildren(nV.node);
          let difference = maxDepthOfISet - nV.level;

          branchChildren.forEach((c: Node) => {
            this.treeView.findNodeView(c).level += difference;
          });
        }
      });
    });
  }

  checkISetNodeOverlapping() {
    let hasBeenPushedDown = false;
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      let shouldPushDown = false;
      for (let i = 0; i < this.treeView.nodes.length; i++) {
        let nodeV = this.treeView.nodes[i];
        // Check if the node is not in the information set, has the same level, and intersects the information set
        if (iSetV.nodes.indexOf(nodeV) === -1 && nodeV.level === iSetV.nodes[0].level
          && nodeV.x > iSetV.nodes[0].x && nodeV.x && nodeV.x < iSetV.nodes[iSetV.nodes.length - 1].x) {
          shouldPushDown = true;
        }
      }
      if (shouldPushDown) {
        hasBeenPushedDown = true;
        iSetV.nodes.forEach((nV: NodeView) => {
          let branchChildren = this.treeView.tree.getBranchChildren(nV.node);
          branchChildren.forEach((c) => {
            this.treeView.findNodeView(c).level++;
          });
        });
      }
    });

    if (hasBeenPushedDown) {
      this.treeView.setYCoordinates();
    }
  }

  horizontalAdjustment() {
    let hasBeenAdjusted = false;
    let leavesLength = this.treeView.tree.getLeaves().length;
    this.treeView.nodes.forEach((nV: NodeView) => {
      if (nV.level !== nV.node.depth) {
        let multiplier = nV.level - nV.node.depth;
        if (Math.abs(nV.x - this.treeView.game.width / 2) >= 10) {
          hasBeenAdjusted = true;
          let sign = nV.x - this.treeView.game.width / 2 > 0 ? 1 : -1;
          nV.position.add(sign * multiplier * (this.treeView.properties.treeWidth / leavesLength), 0);
        }
      }
    });
  }
}
