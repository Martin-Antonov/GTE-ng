/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />


import {ISetView} from './ISetView';
import {ISet} from '../Model/ISet';
import {NodeView} from './NodeView';
import {Move} from '../Model/Move';
import {MoveView} from './MoveView';
import {Node} from '../Model/Node';
import {Tree} from '../Model/Tree';
import {TreeViewProperties} from './TreeViewProperties';
import {TreeTweenManager} from '../Utils/TreeTweenManager';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH, TREE_TWEEN_DURATION} from '../Utils/Constants';
import {CrossingsMinimizer} from '../Utils/CrossingsMinimizer';

/** A class for the graphical representation of the tree. The main algorithm for drawing and repositioning
 * the tree is in this class*/
export class TreeView {
  game: Phaser.Game;
  tree: Tree;
  // The properties field determines the horizontal and vertical offsets between each level.
  properties: TreeViewProperties;
  nodes: Array<NodeView>;
  moves: Array<MoveView>;
  iSets: Array<ISetView>;
  private treeTweenManager: TreeTweenManager;
  private crossingsMinimizer: CrossingsMinimizer;

  constructor(game: Phaser.Game, tree: Tree) {
    this.game = game;
    this.tree = tree;
    this.nodes = [];
    this.moves = [];
    this.iSets = [];
    this.properties = new TreeViewProperties(this.game.height * INITIAL_TREE_HEIGHT, this.game.width * INITIAL_TREE_WIDTH);
    this.treeTweenManager = new TreeTweenManager(this.game);
    this.crossingsMinimizer = new CrossingsMinimizer(this);
    this.initializeTree();
  }

  /**Given a tree from the Model, we initialize the treeView by adding the corresponding sprites*/
  private initializeTree() {
    this.tree.nodes.forEach((n: Node) => {
      let nodeView = new NodeView(this.game, n);
      this.nodes.push(nodeView);
      if (n !== this.tree.root) {
        let parent = this.findNodeView(n.parent);
        this.moves.push(new MoveView(this.game, parent, nodeView));
      }
    });
    this.tree.iSets.forEach((iSet: ISet) => {
      this.addISetView(iSet);
    });
    this.drawTree(true, false);

    this.updateMoves();
  }


  // region Tree Drawing Algorithm
  /**This method contains the algorithm for drawing the tree in different scenarios*/
  drawTree(fullReset: boolean, startAnimations: boolean) {
    this.treeTweenManager.oldCoordinates = this.getOldCoordinates();

    if (this.properties.automaticLevelAdjustment && fullReset && this.iSets.length !== 0) {
      this.crossingsMinimizer.equalizeInfoSetsLevels();
    }

    if (!this.properties.automaticLevelAdjustment) {
      this.nodes.forEach((nV: NodeView) => {
        nV.level = nV.node.depth;
      });
    }

    let maxDepth = this.getMaxDepth();
    if (maxDepth * this.properties.levelHeight > this.game.height * 0.75) {
      this.properties.levelHeight = ((1 / (maxDepth + 2)) * this.game.height);
    }

    if (fullReset) {
      this.setYCoordinates();
      this.updateLeavesPositions();
      this.centerParents();
      if (this.properties.automaticLevelAdjustment && this.iSets.length > 0) {
        this.crossingsMinimizer.minimizeCrossingsBetweenInfoSets();
      }
      this.centerGroupOnScreen();
      this.drawISets();
    }
    if (startAnimations) {
      this.treeTweenManager.startTweens(this.nodes, this.moves, this.tree.checkAllNodesLabeled(), this.properties);

      // this.game.time.events.add(TREE_TWEEN_DURATION +, () => {
      this.resetNodesAndMovesDisplay();
      // });
    }
    else {
      this.updateMoves();
      this.resetNodesAndMovesDisplay();
      this.drawISets();
    }
  }

  /**In order to tween the nodes, we need to save the old coordinates for each node*/
  getOldCoordinates() {
    let oldCoordinates = [];
    this.nodes.forEach((nV: NodeView) => {
      oldCoordinates.push({x: nV.position.x, y: nV.position.y});
    });
    return oldCoordinates;
  }

  /**Sets the Y-coordinates for the tree nodes*/
  setYCoordinates() {
    this.nodes.forEach((nV: NodeView) => {
      nV.y = nV.level * this.properties.levelHeight;
    });
  }

  /**Update the leaves' x coordinate first*/
  updateLeavesPositions() {
    let leaves = this.tree.getLeaves();
    let widthPerNode = this.properties.treeWidth / leaves.length;

    for (let i = 0; i < leaves.length; i++) {
      let nodeView = this.findNodeView(leaves[i]);
      nodeView.x = (widthPerNode * i);
    }
  }

  /**Update the parents' x coordinate*/
  centerParents() {
    this.tree.BFSOnTree().reverse().forEach((n: Node) => {
      if (n.children.length !== 0) {
        let currentNodeView = this.findNodeView(n);
        let leftChildNodeView = this.findNodeView(n.children[0]);
        let rightChildNodeView = this.findNodeView(n.children[n.children.length - 1]);
        currentNodeView.x = (leftChildNodeView.x + rightChildNodeView.x) / 2;
      }
    });
  }

  /**A method which updates the rotation and position of the moves with regards to the parent and child nodes*/
  updateMoves() {
    this.moves.forEach((mV: MoveView) => {
      mV.updateMovePosition();
      mV.updateLabel(this.properties.fractionOn, this.properties.levelHeight);
    });
  }

  /**ISets need to be redrawn at each step*/
  drawISets() {
    this.iSets.forEach(is => {
      is.resetISet();
    });
  }

  /** A method which resets the nodes and moves drawing*/
  resetNodesAndMovesDisplay() {
    let areAllNodesLabeled = this.tree.checkAllNodesLabeled();
    this.nodes.forEach(n => {
      n.resetNodeDrawing(areAllNodesLabeled, this.properties.zeroSumOn);
    });

    if (areAllNodesLabeled) {
      this.tree.resetLabels();
      this.moves.forEach((mV: MoveView) => {
        mV.label.alpha = 1;
        mV.subscript.alpha = 1;
        mV.updateLabel(this.properties.fractionOn, this.properties.levelHeight);
      });
    }

  }

  /**Re-centers the tree on the screen*/
  centerGroupOnScreen() {
    let left = this.game.width * 5;
    let right = -this.game.width * 5;
    let top = this.game.height * 5;
    let bottom = -this.game.height * 5;

    this.nodes.forEach(n => {
      if (n.x < left) {
        left = n.x;
      }
      if (n.x > right) {
        right = n.x;
      }
      if (n.y < top) {
        top = n.y;
      }
      if (n.y > bottom) {
        bottom = n.y;
      }
    });

    let width = right - left;
    let height = bottom - top;


    let treeCenterX = left + width / 2;
    let treeCenterY = top + height / 1.8;

    let offsetX = (this.game.width / 2 - treeCenterX);
    let offsetY = (this.game.height / 2 - treeCenterY);

    this.nodes.forEach(n => {
      n.position.set(n.x + offsetX, n.y + offsetY);
    });
  }

  // endregion

  // region Nodes
  /** Adds a child to a specified node*/
  addChildToNode(nodeV: NodeView) {
    let node = nodeV.node;
    let child = new Node();
    this.tree.addChildToNode(node, child);

    let childV = new NodeView(this.game, child, nodeV.x, nodeV.y);
    childV.level = nodeV.level + 1;
    let move = new MoveView(this.game, nodeV, childV);

    this.nodes.push(childV);
    this.moves.push(move);
    return childV;
  }

  /** A helper method for finding the nodeView, given a Node*/
  findNodeView(node: Node): NodeView {
    for (let i = 0; i < this.nodes.length; i++) {
      let nodeView = this.nodes[i];
      if (nodeView.node === node) {
        return nodeView;
      }
    }
    return null;
  }

  /**A helper method for finding the moveView, given a Move*/
  findMoveView(move: Move): MoveView {
    for (let i = 0; i < this.moves.length; i++) {
      let moveView = this.moves[i];
      if (moveView.move === move) {
        return moveView;
      }
    }
    return null;
  }

  /**A method which removes the given nodeView from the treeView*/
  removeNodeView(nodeV: NodeView) {
    if (this.nodes.indexOf(nodeV) !== -1) {
      // Delete the associated moves.
      this.moves.forEach(m => {
        if (m.to === nodeV) {
          this.moves.splice(this.moves.indexOf(m), 1);
          m.destroy();
        }
      });
      // Remove the nodeView from the treeView and destroy it
      this.nodes.splice(this.nodes.indexOf(nodeV), 1);
      nodeV.events.onInputOut.dispatch(nodeV);
      nodeV.destroy();
    }
  }

  // endregion

  // region ISets
  /**A method for adding an iSetView*/
  addISetView(iSet: ISet) {
    let nodes = [];
    iSet.nodes.forEach(n => {
      nodes.push(this.findNodeView(n));
    });
    let iSetV = new ISetView(this.game, iSet, nodes);
    this.iSets.push(iSetV);
    return iSetV;
  }

  /**A helper method for finding the iSetView, given iSet*/
  findISetView(iSet: ISet): ISetView {
    for (let i = 0; i < this.iSets.length; i++) {
      let iSetView = this.iSets[i];
      if (iSetView.iSet === iSet) {
        return iSetView;
      }
    }
    return null;
  }

  /**A method which removes the given iSetView from the treeView*/
  removeISetView(iSetView: ISetView) {
    if (this.iSets.indexOf(iSetView) !== -1) {
      this.iSets.splice(this.iSets.indexOf(iSetView), 1);
      iSetView.nodes.forEach(n => {
        if (n.node && n.node.player) {
          n.ownerLabel.alpha = 1;
        }
      });
      iSetView.destroy();
    }
  }

  /**A method which removes broken iSets*/
  cleanISets() {
    for (let i = 0; i < this.iSets.length; i++) {
      let iSetV = this.iSets[i];
      if (!iSetV.iSet || !iSetV.iSet.nodes) {
        this.removeISetView(iSetV);
        i--;
      }
    }
  }

  // endregion

  getMaxDepth() {
    let maxDepth = -1;
    this.nodes.forEach((nV: NodeView) => {
      if (maxDepth < nV.level) {
        maxDepth = nV.level;
      }
    });
    return maxDepth;
  }
}

