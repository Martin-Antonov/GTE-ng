/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />


import {Tree} from '../Model/Tree';
import {TreeView} from '../View/TreeView';
import {Player} from '../Model/Player';
import {NODE_RADIUS, PLAYER_COLORS} from '../Utils/Constants';
import {NodeView} from '../View/NodeView';
import {ISetView} from '../View/ISetView';
import {ISet} from '../Model/ISet';
import {Node} from '../Model/Node';
import {MoveView} from '../View/MoveView';
import {TreeParser} from '../Utils/TreeParser';


/**A class which connects the TreeView and the Tree Model.
 * This class is used mainly through UserActionController.ts*/
export class TreeController {
  game: Phaser.Game;
  bmd: Phaser.BitmapData;
  tree: Tree;
  treeView: TreeView;

  // An array used to list all nodes that need to be deleted
  // A signal for the external HTML input label to be activated
  labelInputSignal: Phaser.Signal;
  // A signal for the external UndoRedoController to save the current tree
  treeChangedSignal: Phaser.Signal;
  iSetClickedSignal: Phaser.Signal;
  treeParser: TreeParser;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.treeParser = new TreeParser();
    this.labelInputSignal = new Phaser.Signal();
    this.treeChangedSignal = new Phaser.Signal();
    this.iSetClickedSignal = new Phaser.Signal();
    this.setCircleBitmapData(1);
    this.createInitialTree();

  }

  /**A method which creates the initial 3-node tree in the scene*/
  createInitialTree() {
    this.tree = new Tree();
    this.tree.addNode();
    this.tree.addPlayer(new Player(0, 'chance', 0x000000));
    this.tree.addPlayer(new Player(1, '1', PLAYER_COLORS[0]));
    this.tree.addPlayer(new Player(2, '2', PLAYER_COLORS[1]));

    this.treeView = new TreeView(this.game, this.tree);

    this.attachHandlersToNode(this.treeView.nodes[0]);
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
    this.treeView.nodes.forEach((nV: NodeView) => {
      this.attachHandlersToNode(nV);
    });
  }

  /** The node specific method for attaching handlers
   * Also when we add node we attach the handler for the parent move label*/
  private attachHandlersToNode(nV: NodeView) {
    nV.events.onInputOver.add(() => {
      this.handleInputOverNode(nV);
    });
    nV.events.onInputDown.add(() => {
      this.handleInputDownNode(nV);
    });
    nV.events.onInputOut.add(() => {
      this.handleInputOutNode(nV);
    });
    nV.events.onInputUp.add(() => {
      this.handleInputUpNode(nV);
    });

    nV.ownerLabel.events.onInputDown.add(() => {
      if (nV.ownerLabel.alpha === 1) {
        this.labelInputSignal.dispatch(nV);
      }
    }, this);

    nV.payoffsLabel.events.onInputDown.add(() => {
      if (nV.payoffsLabel.alpha === 1) {
        this.labelInputSignal.dispatch(nV);
      }
    }, this);

    if (nV.node.parentMove) {
      const move = this.treeView.findMoveView(nV.node.parentMove);
      move.label.events.onInputDown.add(() => {
        if (move.label.alpha === 1) {
          this.labelInputSignal.dispatch(move);
        }
      }, this);
    }
  }

  /**The iSet specific method for attaching handlers*/
  attachHandlersToISet(iSet: ISetView) {
    iSet.events.onInputDown.add(function () {
      let iSet = <ISetView>arguments[0];
      this.handleInputDownISet(iSet);
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
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.ALT)) {
      this.deleteNodeHandler([nodeV]);
    }
    else {
      this.addNodeHandler([nodeV]);
    }
    this.treeChangedSignal.dispatch();
  }

  /**Handler for the signal CLICK on a node*/
  private handleInputUpNode(nodeV?: NodeView) {

  }

  /**Handler for the signal HOVER on an ISet*/
  private handleInputDownISet(iSetV: ISetView) {
    this.iSetClickedSignal.dispatch(iSetV);
  }

  // endregion

  // region Nodes Logic
  /**Adding child or children to a node*/
  addNodeHandler(nodesV: Array<NodeView>) {
    nodesV.forEach((nV: NodeView) => {
      if (nV.node.children.length === 0) {
        const child1 = this.treeView.addChildToNode(nV);
        const child2 = this.treeView.addChildToNode(nV);
        this.attachHandlersToNode(child1);
        this.attachHandlersToNode(child2);
      }
      else {
        const child1 = this.treeView.addChildToNode(nV);
        this.attachHandlersToNode(child1);
      }


    });
    this.tree.cleanISets();
    this.treeView.cleanISets();
    this.resetTree(true, true);
  }

  /**A method for deleting a node - 2 step deletion.*/
  deleteNodeHandler(nodesV: Array<NodeView>, ignoreAnimations?: boolean) {
    nodesV.forEach((nV: NodeView) => {
      const node = nV.node;
      if (this.tree.nodes.indexOf(node) === -1) {
        return;
      }
      if (node.children.length === 0 && node !== this.tree.root) {
        this.deleteNode(node);
      }
      else {
        let nodesToDelete = this.tree.getBranchChildren(node);
        nodesToDelete.pop();
        nodesToDelete.forEach((n: Node) => {
          this.deleteNode(n);
        });
      }
    });
    this.tree.cleanISets();
    this.treeView.cleanISets();
    if (!ignoreAnimations) {
      this.resetTree(true, true);
    }
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
    nodesV.forEach((nV: NodeView) => {
      nV.node.convertToLabeled(this.tree.findPlayerById(playerID));
      // If the node is in an iset, change the owner of the iSet to the new player
      if (nV.node.iSet && nV.node.iSet.nodes.length > 1) {
        nV.node.iSet.player = this.tree.players[playerID];
        let iSetView = this.treeView.findISetView(nV.node.iSet);
        iSetView.tint = iSetView.iSet.player.color;
      }
    });

    this.resetTree(false, false);
  }

  /**A method for assigning chance player to a given node*/
  assignChancePlayerToNode(nodesV: Array<NodeView>) {
    nodesV.forEach((nV: NodeView) => {
      nV.node.convertToChance(this.tree.players[0]);
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
      this.treeView.resetNodesAndMovesDisplay();
    }
  }

  // endregion

  // region ISets Logic
  /**Creates an iSet with the corresponding checks*/
  createISet(nodesV: Array<NodeView>) {
    const nodes = [];
    nodesV.forEach((nV: NodeView) => {
      nodes.push(nV.node);
    });
    // Check for errors
    this.tree.canCreateISet(nodes);

    // Create a list of nodes to put into an iSet - create the union of all iSets
    const iSetNodes = [];
    let player = null;
    nodesV.forEach((nV: NodeView) => {
      if (nV.node.iSet) {
        nV.node.iSet.nodes.forEach((n: Node) => {
          iSetNodes.push(n);
        });
        const iSetView = this.treeView.findISetView(nV.node.iSet);
        this.tree.removeISet(nV.node.iSet);
        this.treeView.removeISetView(iSetView);
      }
      else {
        iSetNodes.push(nV.node);
      }

      if (nV.node.player) {
        player = nV.node.player;
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
    nodesV.forEach((nV: NodeView) => {
      if (nV.node.iSet && distinctISets.indexOf(nV.node.iSet) === -1) {
        distinctISets.push(nV.node.iSet);
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
      iSetV.nodes.forEach((nV: NodeView) => {
        if (nV.x <= x) {
          leftNodes.push(nV);
        }
        else {
          rightNodes.push(nV);
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
    this.treeView.drawTree(fullReset, startAnimations);

  }

  /**A method for calculating SPNE with backwards induction*/
  calculateSPNE(){
    let clonedTree = this.treeParser.parse(this.treeParser.stringify(this.tree));
    this.tree.backwardInduction(clonedTree);
    this.treeView.moves.forEach((mV: MoveView) => {
      if (mV.move.isBestInductionMove) {
        mV.tint = mV.from.node.player.color;
      }
      else {
        mV.alpha = 0.3;
        mV.label.alpha = 0.3;
      }
    });
    while (clonedTree.nodes.length !== 0) {
      clonedTree.removeNode(clonedTree.nodes[0]);
    }
    clonedTree = null;
  }

  reloadTreeFromJSON(newTree: Tree, treeCoordinates?: Array<{ x: number, y: number }>) {
    // 1. Delete the current Tree and ISets in tree controller
    this.deleteNodeHandler([this.treeView.nodes[0]], true);
    this.treeView.nodes[0].destroy();
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      iSetV.destroy();
    });

    // 2. Change it with the corresponding one in treelist
    this.tree = newTree;
    this.tree.resetPayoffsPlayers();
    this.treeView = new TreeView(this.game, this.tree);
    this.treeView.nodes.forEach((nV: NodeView) => {
      nV.resetNodeDrawing(this.tree.checkAllNodesLabeled(), this.treeView.properties.zeroSumOn);
    });

    this.attachHandlersToNodes();
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      this.attachHandlersToISet(iSetV);
    });

    if (treeCoordinates) {
      for (let i = 0; i < treeCoordinates.length; i++) {
        this.treeView.nodes[i].position.x = treeCoordinates[i].x;
        this.treeView.nodes[i].position.y = treeCoordinates[i].y;
      }

      this.treeView.drawISets();
    }
    this.resetTree(true, false);
  }

  /**A method for deleting a single! node from the treeView and tree*/
  private deleteNode(node: Node) {
    this.treeView.removeNodeView(this.treeView.findNodeView(node));
    this.tree.removeNode(node);
  }
}

