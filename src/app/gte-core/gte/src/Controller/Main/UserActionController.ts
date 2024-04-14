import {TreeController} from './TreeController';
import {StrategicForm} from '../../Model/StrategicForm';
import {NodeView} from '../../View/NodeView';
import {SelectionRectangle} from '../../Utils/SelectionRectangle';
import {ISetView} from '../../View/ISetView';
import {ISet} from '../../Model/ISet';
import {Node, NodeType} from '../../Model/Node';
import {LabelInputHandler} from '../../Utils/LabelInputHandler';
import {CutSpriteHandler} from '../../Utils/CutSpriteHandler';
import {ViewExporter} from '../../Utils/ViewExporter';
import {MoveView} from '../../View/MoveView';
import {UndoRedoController} from '../UndoRedo/UndoRedoController';
import {UndoRedoActionController} from '../UndoRedo/UndoRedoActionController';
import {ACTION} from '../UndoRedo/ActionsEnum';
import {IStrategicFormResult} from '../../Utils/IStrategicFormResult';
import Fraction from 'fraction.js/fraction';

export class UserActionController {
  scene: Phaser.Scene;

  treeController: TreeController;
  undoRedoController: UndoRedoController;
  undoRedoActionController: UndoRedoActionController;
  strategicForm: StrategicForm;
  strategicFormResult: IStrategicFormResult;

  // Used for going to the next node on tab pressed
  labelInput: LabelInputHandler;
  cutSpriteHandler: CutSpriteHandler;
  events: Phaser.Events.EventEmitter;

  selectedNodes: Array<NodeView>;
  selectionRectangle: SelectionRectangle;

  viewExporter: ViewExporter;
  SPNEActive: boolean;

  private shift: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, treeController: TreeController) {
    this.scene = scene;
    this.treeController = treeController;
    this.viewExporter = new ViewExporter(this.treeController);
    this.undoRedoController = new UndoRedoController(this.treeController);
    this.undoRedoActionController = new UndoRedoActionController(this.treeController);
    this.strategicForm = new StrategicForm();
    this.selectedNodes = [];

    this.shift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.labelInput = new LabelInputHandler(this.scene, this.treeController);
    this.cutSpriteHandler = new CutSpriteHandler(this.scene);

    this.selectionRectangle = new SelectionRectangle(this.scene);

    this.events = new Phaser.Events.EventEmitter();
    this.SPNEActive = false;

    this.treeController.events.on('add-node', (nV: NodeView) => {
      this.addNodesHandler(nV);
    });

    this.treeController.events.on('delete-node', (nV: NodeView) => {
      this.deleteNodeHandler(nV);
    });

    this.treeController.events.on('iset-clicked', (iSetV: ISetView) => {
      this.selectionRectangle.isActive = false;
      iSetV.nodes.forEach((nV: NodeView) => {
        nV.isSelected = true;
        nV.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
        this.selectedNodes.push(nV);
      });
      this.selectionRectangle.isActive = true;
    });
  }

  /**The update method is built-into Phaser and is called 60 times a second.
   * It handles the selection of nodes, while holding the mouse button*/
  update() {
    if (this.scene.input.activePointer.isDown && this.selectionRectangle.isActive) {
      this.treeController.treeView.nodes.forEach((nV: NodeView) => {
        const selectionCheck = Phaser.Geom.Rectangle.Overlaps(this.selectionRectangle.getBounds(), nV.circle.getBounds());
        if (selectionCheck && this.selectedNodes.indexOf(nV) === -1) {
          nV.isSelected = true;
          nV.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
          this.selectedNodes.push(nV);
        }
        if (!selectionCheck && this.selectedNodes.indexOf(nV) !== -1 && !this.shift.isDown) {
          nV.isSelected = false;
          nV.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
          this.selectedNodes.splice(this.selectedNodes.indexOf(nV), 1);
        }
      });
    }

    this.cutSpriteHandler.update();
  }

  /** Empties the selected nodes*/
  private emptySelectedNodes() {
    const areNodesLabeled = this.treeController.tree.checkAllNodesLabeled();
    while (this.selectedNodes.length !== 0) {
      const nV = this.selectedNodes.pop();
      nV.isSelected = false;
      nV.resetNodeDrawing(areNodesLabeled, this.treeController.treeView.properties.zeroSumOn);
    }
  }

  /**Resets the current Tree*/
  createNewTree() {
    this.deleteNodeHandler(this.treeController.treeView.nodes[0]);
    this.addNodesHandler(this.treeController.treeView.nodes[0]);
  }

  /**A method for deselecting nodes.*/
  deselectNodesHandler() {
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach((nV: NodeView) => {
        nV.isSelected = false;
        nV.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
      });
      this.emptySelectedNodes();
    }
  }

  doSelectedHaveChildren(): boolean {
    for (let i = 0; i < this.selectedNodes.length; i++) {
      if (this.selectedNodes[i].node.children.length !== 0) {
        return true;
      }
    }
    return false;
  }

  /**A method for selecting all children of the given node.*/
  selectChildren() {
    if (this.selectedNodes.length !== 0) {
      const nodesToSelect = [];
      this.selectedNodes.forEach((nV: NodeView) => {
        const children = this.treeController.tree.getBranchChildren(nV.node);
        children.forEach((c: Node) => {
          if (nodesToSelect.indexOf(c) === -1) {
            nodesToSelect.push(c);
          }
        });
      });

      nodesToSelect.forEach((node: Node) => {
        const nodeViewToSelect = this.treeController.treeView.findNodeView(node as any);
        if (this.selectedNodes.indexOf(nodeViewToSelect) === -1) {
          nodeViewToSelect.isSelected = true;
          nodeViewToSelect.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(),
            this.treeController.treeView.properties.zeroSumOn);
          this.selectedNodes.push(nodeViewToSelect);
        }
      });
    }
  }

  /**A method for adding children to selected nodes (keyboard N).*/
  addNodesHandler(nodeV?: NodeView) {
    const nodesV = nodeV ? [nodeV] : this.selectedNodes;
    if (nodesV.length > 0) {
      this.treeController.addNodeHandler(nodesV);
      this.undoRedoActionController.saveAction(ACTION.ADD_NODE, nodesV);
    }
  }

  /** A method for deleting nodes (keyboard DELETE).*/
  deleteNodeHandler(nodeV?: NodeView) {
    const nodesV = nodeV ? [nodeV] : this.selectedNodes;
    if (nodesV.length > 0) {
      const treeAsString = this.treeController.treeParser.stringify(this.treeController.tree);
      this.undoRedoActionController.saveAction(ACTION.DELETE_NODE, [nodesV, treeAsString]);
      this.treeController.deleteNodeHandler(nodesV);
    }

    const deletedNodes = [];
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach((nV: NodeView) => {
        if (nV.node === null) {
          deletedNodes.push(nV);
        }
      });
    }

    deletedNodes.forEach((nV: NodeView) => {
      this.selectedNodes.splice(this.selectedNodes.indexOf(nV), 1);
    });

    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning players to nodes (keyboard 1,2,3,4)*/
  assignPlayerToNodeHandler(playerID: number, nodeV?: NodeView) {
    const nodesV = nodeV ? [nodeV] : this.selectedNodes;
    nodesV.filter((nV: NodeView) => {
      return nV.node.children.length !== 0;
    });
    if (nodesV.length !== 0) {
      if (playerID === 0) {
        this.treeController.assignChancePlayerToNode(nodesV);
      } else {
        this.treeController.assignPlayerToNode(playerID, nodesV);
      }
      this.undoRedoActionController.saveAction(ACTION.ASSIGN_PLAYER, {playerID: playerID, nodesV: nodesV});
    }
  }

  /**A method which removes the last player from the list of players*/
  removeLastPlayerHandler() {
    const lastPlayerIndex = this.treeController.tree.players.length - 1;
    if (lastPlayerIndex > 1) {
      const nodesWithRemovedPlayer = [];
      this.treeController.tree.nodes.forEach((n: Node) => {
        if (n.player === this.treeController.tree.players[lastPlayerIndex]) {
          nodesWithRemovedPlayer.push(n);
        }
      });
      this.treeController.tree.removePlayer(this.treeController.tree.players[lastPlayerIndex]);
      this.treeController.resetTree(false, false);
      this.undoRedoActionController.saveAction(ACTION.DECREASE_PLAYERS_COUNT, [nodesWithRemovedPlayer, lastPlayerIndex]);
    }
  }

  addPlayerHandler() {
    const numberOfPlayers = this.treeController.tree.players.length - 1;
    if (numberOfPlayers < 4) {
      this.treeController.addPlayer(numberOfPlayers + 1);
      this.undoRedoActionController.saveAction(ACTION.INCREASE_PLAYERS_COUNT);
    }
  }

  /**A method for creating an iSet (keyboard I)*/
  createISetHandler() {
    if (this.selectedNodes.length > 1) {
      try {
        const oldISets = this.getCurrentISets();
        const selectedNotOwned = this.getCurrentlySelectedAndUnassigned();
        this.treeController.createISet(this.selectedNodes);
        const newISets = this.getCurrentISets();
        this.undoRedoActionController.saveAction(ACTION.CHANGE_INFO_SETS, [oldISets, newISets, selectedNotOwned]);
        this.deselectNodesHandler();
      } catch (err) {
        this.events.emit('show-error', err);
        return;
      }
    }
  }

  /**Removes and iSet by a given list of nodes*/
  removeISetsByNodesHandler() {
    if (this.selectedNodes.length > 0) {
      const oldISets = this.getCurrentISets();
      this.treeController.removeISetsByNodesHandler(this.selectedNodes);
      const newISets = this.getCurrentISets();
      this.undoRedoActionController.saveAction(ACTION.CHANGE_INFO_SETS, [oldISets, newISets]);
    }
  }

  /**Starts the 'Cut' state for an Information set*/
  initiateCutSpriteHandler(iSetV?: ISetView) {
    if (iSetV) {
      this.cutSpriteHandler.cutInformationSet = iSetV;
    } else {
      const distinctISetsSelected = this.treeController.getDistinctISetsFromNodes(this.selectedNodes);
      if (distinctISetsSelected.length === 1) {
        this.cutSpriteHandler.cutInformationSet = this.treeController.treeView.findISetView(distinctISetsSelected[0]);
      }
    }
    if (!this.cutSpriteHandler.cutInformationSet) {
      return;
    }

    this.cutSpriteHandler.cutSprite.setDepth(100);
    this.deselectNodesHandler();
    this.scene.tweens.add({
      targets: this.cutSpriteHandler.cutSprite,
      alpha: 1,
      duration: 300,
    });

    this.scene.input.keyboard.enabled = false;
    this.treeController.treeView.nodes.forEach((nV: NodeView) => {
      nV.circle.input.enabled = false;
    });
    this.treeController.treeView.iSets.forEach((iSetView: ISetView) => {
      iSetView.input.enabled = false;
    });

    this.scene.input.once('pointerdown', () => {
      this.cutSpriteHandler.cutSprite.alpha = 0;

      this.treeController.treeView.nodes.forEach((nV: NodeView) => {
        nV.circle.input.enabled = true;
      });
      this.treeController.treeView.iSets.forEach((iSetView: ISetView) => {
        iSetView.input.enabled = true;
      });
      this.scene.input.keyboard.enabled = true;

      const oldISets = this.getCurrentISets();
      this.treeController.cutInformationSet(this.cutSpriteHandler.cutInformationSet,
        this.cutSpriteHandler.cutSprite.x, this.cutSpriteHandler.cutSprite.y);
      this.cutSpriteHandler.cutInformationSet = null;
      const newISets = this.getCurrentISets();
      this.undoRedoActionController.saveAction(ACTION.CHANGE_INFO_SETS, [oldISets, newISets]);
      this.treeController.resetTree(true, true);
    }, this);
  }

  private getCurrentISets(): Array<Array<Node>> {
    const iSets = [];
    this.treeController.tree.iSets.forEach((iSet: ISet) => {
      iSets.push(iSet.nodes.slice(0));
    });

    return iSets;
  }

  private getCurrentlySelectedAndUnassigned(): Array<Node> {
    const result = [];
    this.selectedNodes.forEach((nV: NodeView) => {
      if (!nV.node.player) {
        result.push(nV.node);
      }
    });

    return result;
  }

  /**A method for assigning undo/redo functionality (keyboard ctrl/shift + Z)*/
  undoRedoHandler(undo: boolean) {
    this.emptySelectedNodes();
    this.undoRedoActionController.changeTree(undo);
  }

  /**A method for assigning random payoffs*/
  randomPayoffsHandler() {
    const payoffsBefore = this.getCurrentPayoffs();
    this.treeController.assignRandomPayoffs();
    const payoffsAfter = this.getCurrentPayoffs();
    this.undoRedoActionController.saveAction(ACTION.ASSIGN_RANDOM_PAYOFFS, [payoffsBefore, payoffsAfter]);
  }

  /**A method which toggles the zero sum on or off*/
  toggleZeroSum() {
    const payoffs = this.getCurrentPayoffs();
    this.treeController.treeView.properties.zeroSumOn = !this.treeController.treeView.properties.zeroSumOn;
    this.treeController.resetTree(false, false);
    this.undoRedoActionController.saveAction(ACTION.ZERO_SUM_TOGGLE, payoffs);
  }

  /**A method which toggles the fractional or decimal view of chance moves*/
  toggleFractionDecimal() {
    this.treeController.treeView.properties.fractionOn = !this.treeController.treeView.properties.fractionOn;
    this.treeController.resetTree(false, false);
    this.undoRedoActionController.saveAction(ACTION.FRACTION_DECIMAL_TOGGLE);
  }

  private getCurrentPayoffs() {
    const payoffs = [];
    const leaves = this.treeController.tree.getLeaves();
    leaves.forEach((leaf: Node) => {
      payoffs.push(leaf.payoffs.outcomes.slice(0));
    });

    return payoffs;
  }

  /**If the label input is active, go to the next label
   * If next is false, we go to the previous label*/
  activateLabelField(next: boolean) {
    this.labelInput.show(next);
  }

  /**If the input field is on and we press enter, change the label*/
  changeLabel(newLabel: string) {
    if (this.labelInput.currentlySelected instanceof MoveView) {
      const mV = this.labelInput.currentlySelected as MoveView;
      if (this.checkIfMoveLabelIsDifferent(mV, newLabel)) {
        const oldLabel = mV.move.from.type === NodeType.CHANCE ? mV.move.probability : mV.move.label;
        this.undoRedoActionController.saveAction(ACTION.CHANGE_MOVE_LABEL, [oldLabel, mV.move, newLabel]);
        this.labelInput.changeLabel(newLabel);
        return;
      }
    } else if (this.labelInput.currentlySelected instanceof NodeView) {
      const nV = this.labelInput.currentlySelected as NodeView;
      if (nV.node.type === NodeType.OWNED && nV.node.player.label !== newLabel) {
        this.undoRedoActionController.saveAction(ACTION.CHANGE_PLAYER_LABEL,
          [nV.node.player.label, newLabel, this.treeController.tree.players.indexOf(nV.node.player)]);
        this.labelInput.changeLabel(newLabel);
        return;
      } else if (nV.node.payoffs.toString() !== newLabel) {
        this.undoRedoActionController.saveAction(ACTION.CHANGE_PAYOFF, [nV.node.payoffs.toString(), newLabel, nV.node]);
        this.labelInput.changeLabel(newLabel);
        return;
      }
    }
    this.labelInput.show(true);
  }

  private checkIfMoveLabelIsDifferent(mV: MoveView, label: string): boolean {
    if (mV.move.from.type === NodeType.CHANCE) {
      return mV.move.probability.compare(new Fraction(label)) !== 0;
    } else {
      if (label.includes('_')) {
        return mV.move.label + '_' + mV.move.subscript !== label;
      } else {
        return mV.move.label !== label;
      }
    }
  }

  /**Hides the input*/
  hideInputLabel() {
    this.labelInput.hide();
  }

  /**Moves a node manually and does not move the children*/
  moveNodeManually(directionX: number, directionY: number, distance: number) {
    this.selectedNodes.forEach((nV: NodeView) => {
      nV.setPosition(nV.x + directionX * distance, nV.y + directionY * distance);
      nV.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
    });
    this.treeController.treeView.moves.forEach((mV: MoveView) => {
      mV.updateMovePosition();
      mV.updateLabel(this.treeController.treeView.properties.fractionOn, this.treeController.treeView.properties.levelHeight);
    });
    this.treeController.treeView.drawISets();
  }

  calculateBFI() {
    try {
      return this.treeController.tree.algorithms.backwardForwardInduction.execute(this.treeController.tree, 'min');
    } catch (err) {
      this.events.emit('show-error', err);
    }
  }

  calculateSPNE() {
    try {
      this.treeController.calculateSPNE();
      this.SPNEActive = true;
    } catch (err) {
      this.events.emit('show-error', err);
      this.SPNEActive = false;
    }
  }

  resetSPNE() {
    this.SPNEActive = false;
    this.treeController.treeView.moves.forEach((mV: MoveView) => {
      mV.updateMovePosition();
    });
  }

  checkCreateStrategicForm() {
    this.SPNEActive = false;
    this.strategicFormResult = null;
    this.strategicForm.destroy();
    if (this.treeController.tree.checkAllNodesLabeled()) {
      this.strategicFormResult = this.strategicForm.generateStrategicForm(this.treeController.tree);
    }
  }

  gameResize() {
    const element = document.getElementById('phaser-div');
    const boundingRect = element.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    this.scene.scale.setGameSize(width, height);
    this.events.emit('tree-dimensions-update');
  }
}

