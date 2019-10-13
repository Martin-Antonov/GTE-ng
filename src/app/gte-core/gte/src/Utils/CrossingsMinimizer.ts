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
    this.treeView.nodes.forEach((nV: NodeView) => {
      nV.level = nV.node.depth;
    });
    this.treeView.tree.iSets.forEach((iSet: ISet) => {
      let maxDepth = -1;
      iSet.nodes.forEach((n: Node) => {
        if (maxDepth < n.depth) {
          maxDepth = n.depth;
        }
      });

      iSet.nodes.forEach((n: Node) => {
        const newLevelForInfoSetNodes = maxDepth - n.depth;
        if (newLevelForInfoSetNodes !== 0) {
          this.pushBranchDown(n, newLevelForInfoSetNodes);
        }
      });
    });
  }

  private pushBranchDown(n: Node, newLevel: number) {
    let branchNodes = this.treeView.tree.getBranchChildren(n);
    branchNodes.forEach((bNode: Node) => {
      const bNodeView = this.treeView.findNodeView(bNode);
      bNodeView.level = newLevel + bNodeView.level;
    });
  }

  minimizeCrossingsBetweenInfoSets() {
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      const levelsToPushDown = this.getNumberOfLevelsToPushDown(iSetV);
      iSetV.nodes.forEach((nV: NodeView) => {
        this.pushBranchDown(nV.node, levelsToPushDown);
      });
    });

    let maxDepth = this.treeView.getMaxDepth();
    if (maxDepth * this.treeView.properties.levelHeight > this.treeView.game.height * 0.75) {
      this.treeView.properties.levelHeight = ((1 / (maxDepth + 2)) * this.treeView.game.height);
    }

    this.treeView.setYCoordinates();
    this.treeView.updateLeavesPositions();
    this.treeView.centerParents();

    this.adjustHorizontally();
  }

  private adjustHorizontally() {
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

  private getNumberOfLevelsToPushDown(iSetV: ISetView) {
    let nodesViewFromISet = [];
    let leftMostX = iSetV.nodes[0].x;
    let rightMostX = iSetV.nodes[0].x;
    iSetV.nodes.forEach((nV: NodeView) => {
      // Get the leftMost and RightMost x coordinate of the infoSet
      if (nV.x < leftMostX) {
        leftMostX = nV.x;
      }
      if (nV.x > rightMostX) {
        rightMostX = nV.x;
      }
      // Get Branch children as Node
      const branchChildren = this.treeView.tree.getBranchChildren(nV.node);
      nodesViewFromISet = nodesViewFromISet.concat(branchChildren);
    });
    // Convert to NodeView
    for (let i = 0; i < nodesViewFromISet.length; i++) {
      nodesViewFromISet[i] = this.treeView.findNodeView(nodesViewFromISet[i]);
    }

    // Get all nodes which are between and under the iSet nodes
    const iSetLevel = iSetV.nodes[0].level;
    let maxLevelDifference = -1;
    let shouldPushDown = false;
    this.treeView.nodes.forEach((nV: NodeView) => {
        // If the node is not part of the iset AND the node is between the iset
        if (!nodesViewFromISet.includes(nV) && nV.x >= leftMostX && nV.x <= rightMostX) {
          // If the level is the same as the iSet level, then we should push down
          if (nV.level === iSetLevel) {
            shouldPushDown = true;
          }
          // If the level is bigger, we calculate the number of levels to push down
          if (nV.level > iSetLevel && maxLevelDifference < nV.level - iSetLevel) {
            maxLevelDifference = nV.level - iSetLevel;
          }
        }
      }
    );
    if (!shouldPushDown || maxLevelDifference === -1) {
      return 0;
    } else {
      return maxLevelDifference + 1;
    }
  }
}
