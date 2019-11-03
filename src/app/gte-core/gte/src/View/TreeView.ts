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
  scene: Phaser.Scene;
  tree: Tree;
  // The properties field determines the horizontal and vertical offsets between each level.
  properties: TreeViewProperties;
  nodes: Array<NodeView>;
  moves: Array<MoveView>;
  iSets: Array<ISetView>;
  private treeTweenManager: TreeTweenManager;
  private crossingsMinimizer: CrossingsMinimizer;

  constructor(scene: Phaser.Scene, tree: Tree) {
    this.scene = scene;
    this.tree = tree;
    this.nodes = [];
    this.moves = [];
    this.iSets = [];
    this.properties = new TreeViewProperties(this.scene.sys.canvas.height * INITIAL_TREE_HEIGHT, this.scene.sys.canvas.width * INITIAL_TREE_WIDTH);
    this.treeTweenManager = new TreeTweenManager(this.scene);
    this.crossingsMinimizer = new CrossingsMinimizer(this);
    this.initializeTree();
  }

  /**Given a tree from the Model, we initialize the treeView by adding the corresponding sprites*/
  private initializeTree() {
    this.tree.nodes.forEach((n: Node) => {
      const nodeView = new NodeView(this.scene, n);
      this.nodes.push(nodeView);
      if (n !== this.tree.root) {
        const parent = this.findNodeView(n.parent);
        this.moves.push(new MoveView(this.scene, parent, nodeView));
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

    const maxDepth = this.getMaxDepth();
    if (maxDepth * this.properties.levelHeight > this.scene.sys.canvas.height * 0.75) {
      this.properties.levelHeight = ((1 / (maxDepth + 2)) * this.scene.sys.canvas.height);
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
    } else {
      this.updateMoves();
    }

    if (startAnimations) {
      this.treeTweenManager.startTweens(this.nodes, this.moves, this.tree.checkAllNodesLabeled(), this.properties);
      this.resetNodesAndMovesDisplay();
    } else {
      this.updateMoves();
      this.resetNodesAndMovesDisplay();
      this.drawISets();
    }
  }

  /**In order to tween the nodes, we need to save the old coordinates for each node*/
  getOldCoordinates() {
    const oldCoordinates = [];
    this.nodes.forEach((nV: NodeView) => {
      oldCoordinates.push({x: nV.x, y: nV.y});
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
    const leaves = this.tree.getLeaves();
    const widthPerNode = this.properties.treeWidth / leaves.length;

    for (let i = 0; i < leaves.length; i++) {
      const nodeView = this.findNodeView(leaves[i]);
      nodeView.x = (widthPerNode * i);
    }
  }

  /**Update the parents' x coordinate*/
  centerParents() {
    this.tree.BFSOnTree().reverse().forEach((n: Node) => {
      if (n.children.length !== 0) {
        const currentNodeView = this.findNodeView(n);
        const leftChildNodeView = this.findNodeView(n.children[0]);
        const rightChildNodeView = this.findNodeView(n.children[n.children.length - 1]);
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
    const areAllNodesLabeled = this.tree.checkAllNodesLabeled();
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
    let left = this.scene.sys.canvas.width * 5;
    let right = -this.scene.sys.canvas.width * 5;
    let top = this.scene.sys.canvas.height * 5;
    let bottom = -this.scene.sys.canvas.height * 5;

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

    const width = right - left;
    const height = bottom - top;


    const treeCenterX = left + width / 2;
    const treeCenterY = top + height / 1.8;

    const offsetX = (this.scene.sys.canvas.width / 2 - treeCenterX);
    const offsetY = (this.scene.sys.canvas.height / 2 - treeCenterY);

    this.nodes.forEach((n: NodeView) => {
      n.setPosition(n.x + offsetX, n.y + offsetY);
    });
  }

  // endregion

  // region Nodes
  /** Adds a child to a specified node*/
  addChildToNode(nodeV: NodeView) {
    const node = nodeV.node;
    const child = new Node();
    this.tree.addChildToNode(node, child);

    const childV = new NodeView(this.scene, child, nodeV.x, nodeV.y);
    childV.level = nodeV.level + 1;
    const move = new MoveView(this.scene, nodeV, childV);

    this.nodes.push(childV);
    this.moves.push(move);
    return childV;
  }

  /** A helper method for finding the nodeView, given a Node*/
  findNodeView(node: Node): NodeView {
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeView = this.nodes[i];
      if (nodeView.node === node) {
        return nodeView;
      }
    }
    return null;
  }

  /**A helper method for finding the moveView, given a Move*/
  findMoveView(move: Move): MoveView {
    for (let i = 0; i < this.moves.length; i++) {
      const moveView = this.moves[i];
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
      // Remove the NodeView from any iSets it could be a part of
      this.iSets.forEach((iSetV: ISetView) => {
        const indexOfNodeView = iSetV.nodes.indexOf(nodeV);
        if (indexOfNodeView !== -1) {
          iSetV.nodes.splice(indexOfNodeView, 1);
        }
      });
      // Remove the nodeView from the treeView and destroy it
      this.nodes.splice(this.nodes.indexOf(nodeV), 1);
      nodeV.emit('pointerout');
      nodeV.destroy();
    }
  }

  // endregion

  // region ISets
  /**A method for adding an iSetView*/
  addISetView(iSet: ISet) {
    const nodes = [];
    iSet.nodes.forEach(n => {
      nodes.push(this.findNodeView(n));
    });
    const iSetV = new ISetView(this.scene, iSet, nodes);
    this.iSets.push(iSetV);
    return iSetV;
  }

  /**A helper method for finding the iSetView, given iSet*/
  findISetView(iSet: ISet): ISetView {
    for (let i = 0; i < this.iSets.length; i++) {
      const iSetView = this.iSets[i];
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
      const iSetV = this.iSets[i];
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

