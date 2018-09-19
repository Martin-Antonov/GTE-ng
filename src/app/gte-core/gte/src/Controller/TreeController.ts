/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />


import {Tree} from '../Model/Tree';
import {TreeView} from '../View/TreeView';
import {TreeViewProperties} from '../View/TreeViewProperties';
import {Player} from '../Model/Player';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH, NODE_RADIUS, PLAYER_COLORS} from '../Utils/Constants';
import {NodeView} from '../View/NodeView';
import {ISetView} from '../View/ISetView';
import {MoveView} from '../View/MoveView';
import {ISet} from '../Model/ISet';
import {Node} from '../Model/Node';


/**A class which connects the TreeView and the Tree Model.
 * This class is used mainly through UserActionController.ts*/
export class TreeController {
  game: Phaser.Game;
  bmd: Phaser.BitmapData;
  tree: Tree;
  treeView: TreeView;
  treeViewProperties: TreeViewProperties;

  // An array used to list all nodes that need to be deleted
  private nodesToDelete: Array<Node>;
  labelInputSignal: Phaser.Signal;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.setCircleBitmapData(1);
    this.nodesToDelete = [];
    this.createInitialTree();
    this.attachHandlersToNodes();
    this.labelInputSignal = new Phaser.Signal();
  }

  /**A method which creates the initial 3-node tree in the scene*/
  createInitialTree() {
    this.tree = new Tree();
    this.tree.addNode();
    this.tree.addPlayer(new Player(0, 'chance', 0x000000));
    this.tree.addPlayer(new Player(1, '1', PLAYER_COLORS[0]));
    this.tree.addPlayer(new Player(2, '2', PLAYER_COLORS[1]));

    this.treeViewProperties = new TreeViewProperties(this.game.height * INITIAL_TREE_HEIGHT, this.game.width * INITIAL_TREE_WIDTH);
    this.treeView = new TreeView(this.game, this.tree, this.treeViewProperties);
    this.addNodeHandler([this.treeView.nodes[0]]);
    this.resetTree(true, true);
  }

  /**A method for creating the circle for the nodes.
   * This method will imitate the zoom-in/zoom-out functionality*/
  setCircleBitmapData(scale: number) {
    this.bmd = this.game.make.bitmapData(this.game.height * NODE_RADIUS * scale,
      this.game.height * NODE_RADIUS * scale, 'node-circle', true);
    this.bmd.ctx.fillStyle = '#ffffff';
    this.bmd.ctx.beginPath();
    this.bmd.ctx.arc(this.bmd.width / 2, this.bmd.width / 2, this.bmd.width * 0.45, 0, Math.PI * 2);
    this.bmd.ctx.fill();
  }

  // region Input Handlers and Signals
  /**Attaching listeners, that will listen for specific actions from the user*/
  attachHandlersToNodes() {
    this.treeView.nodes.forEach(n => {
      this.attachHandlersToNode(n);
    });
  }

  /** The node specific method for attaching handlers
   * Also when we add node we attach the handler for the parent move label*/
  private attachHandlersToNode(n: NodeView) {
    n.events.onInputOver.add(() => {
      this.handleInputOverNode(n);
    });
    n.events.onInputDown.add(() => {
      this.handleInputDownNode(n);
    });
    n.events.onInputOut.add(() => {
      this.handleInputOutNode(n);
    });

    n.ownerLabel.events.onInputDown.add(() => {
      this.labelInputSignal.dispatch(n);
    }, this);

    n.payoffsLabel.events.onInputDown.add(() => {
      this.labelInputSignal.dispatch(n);
    }, this);

    if (n.node.parentMove) {
      const move = this.treeView.findMoveView(n.node.parentMove);
      move.label.events.onInputDown.add(() => {
        this.labelInputSignal.dispatch(move);
      }, this);
    }
  }

  /**The iSet specific method for attaching handlers*/
  attachHandlersToISet(iSet: ISetView) {
    iSet.events.onInputOver.add(function () {
      let iSet = <ISetView>arguments[0];
      this.handleInputOverISet(iSet);
    }, this);
  }

  /**Handler for the signal HOVER on a Node*/
  private handleInputOverNode(nodeV: NodeView) {

  }

  /**Handler for the signal HOVER_OUT on a Node*/
  private handleInputOutNode(nodeV?: NodeView) {

  }

  /**Handler for the signal CLICK on a Node*/
  private handleInputDownNode(nodeV: NodeView) {

  }

  /**Handler for the signal HOVER on an ISet*/
  private handleInputOverISet(iSetV: ISetView) {

  }

  // endregion

  // region Nodes Logic
  /**Adding child or children to a node*/
  addNodeHandler(nodesV: Array<NodeView>) {
    nodesV.forEach((nodeV: NodeView) => {
      this.handleInputOutNode(nodeV);
      if (nodeV.node.children.length === 0) {
        const child1 = this.treeView.addChildToNode(nodeV);
        const child2 = this.treeView.addChildToNode(nodeV);
        this.attachHandlersToNode(child1);
        this.attachHandlersToNode(child2);
      }
      else {
        const child1 = this.treeView.addChildToNode(nodeV);
        this.attachHandlersToNode(child1);
      }
    });
    this.tree.cleanISets();
    this.treeView.cleanISets();
    this.resetTree(true, true);
  }

  /**A method for deleting a node - 2 step deletion.*/
  deleteNodeHandler(nodesV: Array<NodeView>) {
    nodesV.forEach((nodeV: NodeView) => {
      const node = nodeV.node;
      if (this.tree.nodes.indexOf(node) === -1) {
        return;
      }
      if (node.children.length === 0 && node !== this.tree.root) {
        this.deleteNode(node);
      }
      else {
        this.nodesToDelete = [];
        this.getAllBranchChildren(node);
        this.nodesToDelete.pop();
        this.nodesToDelete.forEach(n => {
          this.deleteNode(n);
        });
        this.nodesToDelete = [];
        node.convertToDefault();
      }
    });
    this.tree.cleanISets();
    this.treeView.cleanISets();
    this.resetTree(true, true);
  }

  // endregion

  // region Players Logic
  /** A method for assigning a player to a given node.*/
  assignPlayerToNode(playerID: number, nodesV: Array<NodeView>) {
    // if someone adds player 4 before adding player 3, we will add player 3 instead.
    if (playerID > this.tree.players.length) {
      playerID--;
    }

    this.addPlayer(playerID);
    nodesV.forEach((nodeV: NodeView) => {
      nodeV.node.convertToLabeled(this.tree.findPlayerById(playerID));
      // If the node is in an iset, change the owner of the iSet to the new player
      if (nodeV.node.iSet && nodeV.node.iSet.nodes.length > 1) {
        nodeV.node.iSet.player = this.tree.players[playerID];
        let iSetView = this.treeView.findISetView(nodeV.node.iSet);
        iSetView.tint = iSetView.iSet.player.color;
      }
    });

    this.resetTree(false, false);
  }

  /**A method for assigning chance player to a given node*/
  assignChancePlayerToNode(nodesV: Array<NodeView>) {
    nodesV.forEach((nodeV: NodeView) => {
      nodeV.node.convertToChance(this.tree.players[0]);
    });

    this.resetTree(false, false);
  }

  /**A method for adding a new player if there isn't one created already*/
  addPlayer(playerID: number) {
    // if someone adds player 4 before adding player 3, we will add player 3 instead.
    if (playerID > this.tree.players.length) {
      playerID--;
    }

    if (playerID > this.tree.players.length - 1) {
      this.tree.addPlayer(new Player(playerID, playerID.toString(), PLAYER_COLORS[playerID - 1]));
      this.treeView.showOrHideLabels();
    }
  }

  // endregion

  // region ISets Logic
  /**Creates an iSet with the corresponding checks*/
  createISet(nodesV: Array<NodeView>) {
    const nodes = [];
    nodesV.forEach(n => {
      nodes.push(n.node);
    });
    // Check for errors
    this.tree.canCreateISet(nodes);

    // Create a list of nodes to put into an iSet - create the union of all iSets
    const iSetNodes = [];
    let player = null;
    nodesV.forEach((n) => {
      if (n.node.iSet) {
        n.node.iSet.nodes.forEach(iNode => {
          iSetNodes.push(iNode);
        });
        const iSetView = this.treeView.findISetView(n.node.iSet);
        this.tree.removeISet(n.node.iSet);
        this.treeView.removeISetView(iSetView);
      }
      else {
        iSetNodes.push(n.node);
      }

      if (n.node.player) {
        player = n.node.player;
      }
    });
    const iSet = this.tree.addISet(player, iSetNodes);
    const iSetV = this.treeView.addISetView(iSet);
    this.attachHandlersToISet(iSetV);
    this.resetTree(true, true);
  }

  /**A method for deleting an iSet*/
  removeISetHandler(iSet: ISet) {
    this.tree.removeISet(iSet);
    this.treeView.removeISetView(this.treeView.findISetView(iSet));
    this.resetTree(true, true);
  }

  /**A method which removes all isets from the selected nodes*/
  removeISetsByNodesHandler(selectedNodes: Array<NodeView>) {
    let iSetsToRemove = this.getDistinctISetsFromNodes(selectedNodes);

    for (let i = 0; i < iSetsToRemove.length; i++) {
      this.removeISetHandler(iSetsToRemove[i]);
    }
    iSetsToRemove = null;
  }

  /**A helper method which returns all iSets from the selected nodes*/
  getDistinctISetsFromNodes(nodesV: Array<NodeView>) {
    const distinctISets = [];
    nodesV.forEach((n) => {
      if (n.node.iSet && distinctISets.indexOf(n.node.iSet) === -1) {
        distinctISets.push(n.node.iSet);
      }
    });

    return distinctISets;
  }

  /**A method which cuts the information set*/
  cutInformationSet(iSetV: ISetView, x: number, y: number) {
    if (iSetV.nodes.length === 2) {
      this.removeISetHandler(iSetV.iSet);
    }
    else {
      const leftNodes = [];
      const rightNodes = [];
      iSetV.nodes.forEach(n => {
        if (n.x <= x) {
          leftNodes.push(n);
        }
        else {
          rightNodes.push(n);
        }
      });
      if (leftNodes.length === 1) {
        iSetV.iSet.removeNode(leftNodes[0].node);
        iSetV.removeNode(leftNodes[0]);
      }
      else if (rightNodes.length === 1) {
        iSetV.iSet.removeNode(rightNodes[0].node);
        iSetV.removeNode(rightNodes[0]);
      }
      else {
        this.removeISetHandler(iSetV.iSet);
        this.createISet(leftNodes);
        this.createISet(rightNodes);
      }
    }
    this.resetTree(false, false);
  }

  // endregion

  /**A method for assigning random payoffs to nodes*/
  assignRandomPayoffs() {
    const leaves = this.tree.getLeaves();
    leaves.forEach((n: Node) => {
      n.payoffs.setRandomPayoffs();
    });
    this.resetTree(false, false);
  }

  /**A method for resetting the tree after each action on the tree,
   * soft=true means only changing labels and isets, false redraws the full tree*/
  resetTree(fullReset: boolean, startAnimations: boolean) {
    if (this.tree.nodes.length > 1) {
      this.treeView.drawTree(fullReset, startAnimations);
    }
  }

  reloadTreeFromJSON(newTree: Tree, treeCoordinates?: Array<{ x: number, y: number }>) {
    // 1. Delete the current Tree and ISets in tree controller
    this.deleteNodeHandler([this.treeView.nodes[0]]);
    this.treeView.nodes[0].destroy();
    this.treeView.iSets.forEach((iSet: ISetView) => {
      iSet.destroy();
    });

    // 2. Change it with the corresponding one in treelist
    // this.tree = this.treesList[this.currentTreeIndex].clone();
    this.tree = newTree;
    this.treeView = new TreeView(this.game, this.tree, this.treeViewProperties);
    this.treeView.nodes.forEach(n => {
      n.resetNodeDrawing();
      n.resetLabelText(this.treeViewProperties.zeroSumOn);
    });

    this.treeView.showOrHideLabels();
    this.attachHandlersToNodes();
    this.treeView.iSets.forEach((iSet) => {
      this.attachHandlersToISet(iSet);
    });

    if (treeCoordinates) {
      for (let i = 0; i < this.treeView.nodes.length; i++) {
        this.treeView.nodes[i].position.x = treeCoordinates[i].x;
        this.treeView.nodes[i].position.y = treeCoordinates[i].y;
      }

      this.treeView.drawISets();
    }
    this.resetTree(false, false);
  }

  /**Get all children of a given node*/
  private getAllBranchChildren(node: Node) {
    node.children.forEach(c => {
      this.getAllBranchChildren(c);
    });
    this.nodesToDelete.push(node);
  }

  /**A method for deleting a single! node from the treeView and tree*/
  private deleteNode(node: Node) {
    this.treeView.removeNodeView(this.treeView.findNodeView(node));
    this.tree.removeNode(node);
  }
}

