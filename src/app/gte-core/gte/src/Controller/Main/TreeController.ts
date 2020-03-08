import {Tree} from '../../Model/Tree';
import {TreeView} from '../../View/TreeView';
import {Player} from '../../Model/Player';
import {CLICK_THRESHOLD, PLAYER_COLORS} from '../../Utils/Constants';
import {NodeView} from '../../View/NodeView';
import {ISetView} from '../../View/ISetView';
import {ISet} from '../../Model/ISet';
import {Node} from '../../Model/Node';
import {MoveView} from '../../View/MoveView';
import {TreeParser} from '../../Utils/TreeParser';

/**A class which connects the TreeView and the Tree Model.
 * This class is used mainly through UserActionController.ts*/
export class TreeController {
  scene: Phaser.Scene;
  tree: Tree;
  treeView: TreeView;
  events: Phaser.Events.EventEmitter;
  treeParser: TreeParser;
  altKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.treeParser = new TreeParser();

    this.events = new Phaser.Events.EventEmitter();
    this.altKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
    this.createInitialTree();
  }

  /**A method which creates the initial 3-node tree in the scene*/
  createInitialTree() {
    this.tree = new Tree();
    this.tree.addNode();
    this.tree.addPlayer(new Player(0, 'chance', '#000'));
    this.tree.addPlayer(new Player(1, '1', PLAYER_COLORS[0]));
    this.tree.addPlayer(new Player(2, '2', PLAYER_COLORS[1]));

    this.treeView = new TreeView(this.scene, this.tree);

    this.attachHandlersToNode(this.treeView.nodes[0]);
    this.addNodeHandler([this.treeView.nodes[0]]);

    this.resetTree(true, true);
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
    nV.circle.on('pointerover', () => {
      if (!this.scene.input.activePointer.isDown) {
        if (this.altKey.isDown) {
          this.scene.sys.canvas.style.cursor = 'no-drop';
        } else {
          this.scene.sys.canvas.style.cursor = 'pointer';
        }
      }
    });
    nV.circle.on('pointerdown', () => {
      // You can add input down on node here
    });
    nV.circle.on('pointerout', () => {
      if (!this.scene.input.activePointer.isDown) {
        this.scene.sys.canvas.style.cursor = 'default';
      }
    });
    nV.circle.on('pointerup', () => {
      if (this.altKey.isDown && this.clickCheck()) {
        this.events.emit('delete-node', nV);
        this.scene.sys.canvas.style.cursor = 'default';
      } else if (this.clickCheck()) {
        this.events.emit('add-node', nV);
        this.scene.sys.canvas.style.cursor = 'default';
      }
    });

    nV.ownerLabel.on('pointerup', () => {
      if (nV.ownerLabel.alpha === 1 && this.clickCheck()) {
        this.events.emit('label-clicked', nV);
      }
    });
    nV.ownerLabel.on('pointerover', () => {
      if (!this.scene.input.activePointer.isDown) {
        this.scene.sys.canvas.style.cursor = 'text';
      }
    });
    nV.ownerLabel.on('pointerout', () => {
      if (!this.scene.input.activePointer.isDown) {
        this.scene.sys.canvas.style.cursor = 'default';
      }
    });

    nV.payoffsLabel.on('pointerup', () => {
      if (nV.payoffsLabel.alpha === 1 && this.clickCheck()) {
        this.events.emit('label-clicked', nV);
      }
    });
    nV.payoffsLabel.on('pointerover', () => {
      if (!this.scene.input.activePointer.isDown) {
        this.scene.sys.canvas.style.cursor = 'text';
      }
    });
    nV.payoffsLabel.on('pointerout', () => {
      if (!this.scene.input.activePointer.isDown) {
        this.scene.sys.canvas.style.cursor = 'default';
      }
    });

    if (nV.node.parentMove) {
      const move = this.treeView.findMoveView(nV.node.parentMove);
      move.label.on('pointerup', () => {
        if (move.label.alpha === 1 && this.clickCheck()) {
          this.events.emit('label-clicked', move);
        }
      });
      move.label.on('pointerover', () => {
        if (!this.scene.input.activePointer.isDown) {
          this.scene.sys.canvas.style.cursor = 'text';
        }
      });

      move.label.on('pointerout', () => {
        if (!this.scene.input.activePointer.isDown) {
          this.scene.sys.canvas.style.cursor = 'default';
        }
      });
    }
  }

  /**The iSet specific method for attaching handlers*/
  attachHandlersToISet(iSet: ISetView) {
    iSet.on('pointerup', () => {
      if (this.clickCheck()) {
        this.events.emit('iset-clicked', iSet);
      }
    });

    iSet.on('pointerover', () => {
      this.scene.sys.canvas.style.cursor = 'crosshair';
    });

    iSet.on('pointerout', () => {
      this.scene.sys.canvas.style.cursor = 'default';
    });

    iSet.label.on('pointerup', () => {
      this.events.emit('label-clicked', iSet.nodes[0]);
    });

    iSet.label.on('pointerover', () => {
      this.scene.sys.canvas.style.cursor = 'text';
    });

    iSet.label.on('pointerout', () => {
      this.scene.sys.canvas.style.cursor = 'default';
    });
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
      } else {
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
      } else {
        const nodesToDelete = this.tree.getBranchChildren(node);
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
      } else {
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
  removeISetsByNodesHandler(nodesV: Array<NodeView>) {
    let iSetsToRemove = this.getDistinctISetsFromNodes(nodesV);
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
    } else {
      const leftNodes = [];
      const rightNodes = [];
      iSetV.nodes.forEach((nV: NodeView) => {
        if (nV.x <= x) {
          leftNodes.push(nV);
        } else {
          rightNodes.push(nV);
        }
      });
      if (leftNodes.length === 1) {
        iSetV.iSet.removeNode(leftNodes[0].node);
        iSetV.removeNode(leftNodes[0]);
      } else if (rightNodes.length === 1) {
        iSetV.iSet.removeNode(rightNodes[0].node);
        iSetV.removeNode(rightNodes[0]);
      } else {
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
  calculateSPNE() {
    let clonedTree = this.treeParser.parse(this.treeParser.stringify(this.tree));
    this.tree.backwardInduction(clonedTree);
    this.treeView.moves.forEach((mV: MoveView) => {
      if (mV.move.isBestInductionMove) {
        mV.setOwnerColor();
      } else {
        mV.alpha = 0.3;
        mV.label.alpha = 0.3;
        mV.subscript.alpha = 0.3;
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
    this.treeView = new TreeView(this.scene, this.tree);
    this.treeView.nodes.forEach((nV: NodeView) => {
      nV.resetNodeDrawing(this.tree.checkAllNodesLabeled(), this.treeView.properties.zeroSumOn);
    });

    this.attachHandlersToNodes();
    this.treeView.iSets.forEach((iSetV: ISetView) => {
      this.attachHandlersToISet(iSetV);
    });

    if (treeCoordinates) {
      for (let i = 0; i < treeCoordinates.length; i++) {
        this.treeView.nodes[i].x = treeCoordinates[i].x;
        this.treeView.nodes[i].y = treeCoordinates[i].y;
      }

      this.treeView.drawISets();
      this.resetTree(false, false);
    } else {
      this.resetTree(true, false);
    }
  }

  /**A method for deleting a !single! node from the treeView and tree*/
  private deleteNode(node: Node) {
    this.treeView.removeNodeView(this.treeView.findNodeView(node));
    this.tree.removeNode(node);
  }

  private clickCheck(): boolean {
    return this.scene.input.activePointer.upTime - this.scene.input.activePointer.downTime < CLICK_THRESHOLD;
  }
}

