import {TreeView} from '../View/TreeView';
import {Node} from '../Model/Node';
import {ISetView} from '../View/ISetView';
import {NodeView} from '../View/NodeView';

export class CrossingsMinimizer {
  treeView: TreeView;

  constructor(treeView: TreeView) {
    this.treeView = treeView;
  }

  equalizeInfoSetsLevels() {
    this.treeView.nodes.forEach((nV: NodeView) => {
      nV.level = nV.node.depth;
    });

    this.treeView.iSets.forEach((iSetV: ISetView) => {
      let maxDepth = -1;
      iSetV.nodes.forEach((nV: NodeView) => {
        if (maxDepth < nV.level) {
          maxDepth = nV.level;
        }
      });
      iSetV.nodes.forEach((nV: NodeView) => {
        const newLevelForInfoSetNodes = maxDepth - nV.level;
        if (newLevelForInfoSetNodes !== 0) {
          this.pushBranchDown(nV, newLevelForInfoSetNodes);
        }
      });
    });
  }

  minimizeCrossingsBetweenInfoSets() {
    // Check how much we should push an information set down
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      const levelsToPushDown = this.getNumberOfLevelsToPushDown(iSetV);
      iSetV.nodes.forEach((nV: NodeView) => {
        this.pushBranchDown(nV, levelsToPushDown);
      });
    });


    // If after the base algorithm, some information sets are not horizontal, we reset
    if (this.checkNonHorizontalInfoSets()) {
      this.treeView.nodes.forEach((nV: NodeView) => {
        nV.level = nV.node.depth;
      });
    } else {
      // Obscure case check when IS1 is under and wider than IS2
      this.iSetContainmentCase();
    }

    this.treeView.setYCoordinates();
    this.treeView.updateLeavesPositions();
    this.treeView.centerParents();

    this.adjustHorizontally();
  }

  private pushBranchDown(nV: NodeView, newLevel: number) {
    const branchNodes = this.treeView.tree.getBranchChildren(nV.node);
    branchNodes.forEach((bNode: Node) => {
      const bNodeView = this.treeView.findNodeView(bNode);
      bNodeView.level = newLevel + bNodeView.level;
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
            maxLevelDifference = nV.level - iSetLevel;
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

  private iSetContainmentCase() {
    // pair of iset containment
    let iSet = this.getLargerSetToPushDown();
    while (iSet) {
      iSet.nodes.forEach((nV: NodeView) => {
        this.pushBranchDown(nV, 2);
      });
      iSet = this.getLargerSetToPushDown();
    }
  }

  private getLargerSetToPushDown() {
    for (let i = 0; i < this.treeView.iSets.length; i++) {
      const iSetV1 = this.treeView.iSets[i];
      const iSet1Params = this.getISetParams(iSetV1);
      for (let j = i + 1; j < this.treeView.iSets.length; j++) {
        const iSetV2 = this.treeView.iSets[j];
        const iSet2Params = this.getISetParams(iSetV2);
        if (iSetV1.nodes[0].level === iSetV2.nodes[0].level) {
          if (iSet1Params.left < iSet2Params.left && iSet1Params.right > iSet2Params.right) {
            return iSetV1;
          } else if (iSet1Params.left > iSet2Params.left && iSet1Params.right < iSet2Params.right) {
            return iSetV2;
          }
        }
      }
    }
    return null;
  }

  private getISetParams(iSetV: ISetView): { left: number, right: number } {
    let leftMost = iSetV.nodes[0].x;
    let rightMost = iSetV.nodes[0].x;
    iSetV.nodes.forEach((nV: NodeView) => {
      if (leftMost > nV.x) {
        leftMost = nV.x;
      }
      if (rightMost < nV.x) {
        rightMost = nV.x;
      }
    });
    return {left: leftMost, right: rightMost};
  }

  private checkNonHorizontalInfoSets() {
    let shouldResetTree = false;
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      const iSetLevel = iSetV.nodes[0].level;
      iSetV.nodes.forEach((nV: NodeView) => {
        if (nV.level !== iSetLevel) {
          shouldResetTree = true;
        }
      });
    });

    return shouldResetTree;
  }

  private adjustHorizontally() {
    const leavesLength = this.treeView.tree.getLeaves().length;
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      iSetV.nodes.forEach((nV: NodeView) => {
        let sign = 0;
        const nodeInChildrenIndex = nV.node.parent.children.indexOf(nV.node);
        if (nV.node.parent.children.length / 2 - 0.5 === nodeInChildrenIndex) {
          return;
          // Goes left
        } else if (nodeInChildrenIndex < nV.node.parent.children.length / 2) {
          sign = -1;
        } else {
          sign = 1;
        }

        const allBranchNodes = this.treeView.tree.getBranchChildren(nV.node);
        allBranchNodes.forEach((n: Node) => {
          const nodeView = this.treeView.findNodeView(n);
          if (nodeView.level !== nodeView.node.depth) {
            const multiplier = nodeView.level - nodeView.node.depth;
            nodeView.setPosition(nodeView.x + sign * multiplier * (this.treeView.properties.treeWidth / leavesLength), nodeView.y);
          }
        });
      });
    });
  }
}
