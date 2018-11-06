/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {TreeView} from '../View/TreeView';
import {Node, NodeType} from '../Model/Node';
import {ISet} from '../Model/ISet';
import {ISetView} from '../View/ISetView';
import {NodeView} from '../View/NodeView';

export class CrossingsMinimizer {
  treeView: TreeView;

  constructor(treeView: TreeView) {
    this.treeView = treeView;
  }

  equalizeInfoSetsLevels() {
    // For each ISet, check how many nodes in the DFS order of the tree are "between" the nodes in the iSet (not including children)
    // of the iSet Nodes. Find the largest depth of among these nodes, and push the iSet down.
    this.treeView.tree.iSets.forEach((iSet: ISet) => {
      // debugger;
      let DFSnodes = this.treeView.tree.DFSOnTree();
      let maxIndex = -1;
      let minIndex = 1000000;
      let maxDepth = -1;
      let allChildren = [];
      iSet.nodes.forEach((n: Node) => {
        let index = DFSnodes.indexOf(n);
        if (index > maxIndex) {
          maxIndex = index;
        }

        if (index < minIndex) {
          minIndex = index;
        }
        if (maxDepth < n.depth) {
          maxDepth = n.depth;
        }
        allChildren = allChildren.concat(this.treeView.tree.getBranchChildren(n));
      });
      let maxDepthNotInInfoSet = -1;
      for (let i = minIndex + 1; i < maxIndex; i++) {
        let current = DFSnodes[i];
        if (allChildren.indexOf(current) === -1 && maxDepthNotInInfoSet < current.depth) {
          maxDepthNotInInfoSet = current.depth;
        }
      }
      let newLevelForInfoSetNodes = maxDepthNotInInfoSet >= maxDepth ? maxDepthNotInInfoSet + 1 : maxDepth;

      iSet.nodes.forEach((n: Node) => {
        this.pushBranchDown(n, newLevelForInfoSetNodes);
      });
    });
  }

  private pushBranchDown(n: Node, newLevel: number) {
    let branchNodes = this.treeView.tree.getBranchChildren(n);
    branchNodes.forEach((bNode: Node) => {
      this.treeView.findNodeView(bNode).level = newLevel + bNode.depth - n.depth;
    });
  }

  adjustHorizontally() {
    let leavesLength = this.treeView.tree.getLeaves().length;
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      iSetV.nodes.forEach((nV: NodeView) => {
        let sign = 0;
        let nodeInChildrenIndex = nV.node.parent.children.indexOf(nV.node);
        if (nV.node.parent.children.length / 2 - 0.5 === nodeInChildrenIndex) {
          return;
        }
        // Goes left
        else if (nodeInChildrenIndex < nV.node.parent.children.length / 2) {
          sign = -1;
        }
        else {
          sign = 1;
        }

        let allBranchNodes = this.treeView.tree.getBranchChildren(nV.node);
        allBranchNodes.forEach((n: Node) => {
          let nodeView = this.treeView.findNodeView(n);
          if (nodeView.level !== nodeView.node.depth) {
            let multiplier = nodeView.level - nodeView.node.depth;
            nodeView.position.add(sign * multiplier * (this.treeView.properties.treeWidth / leavesLength), 0);
          }
        });
      });
    });
  }
}
