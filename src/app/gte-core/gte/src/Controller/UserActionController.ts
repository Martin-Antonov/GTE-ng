import {TreeController} from './TreeController';
import {StrategicForm} from '../Model/StrategicForm';
import {UndoRedoController} from './UndoRedoController';
import {NodeView} from '../View/NodeView';
import {SelectionRectangle} from '../Utils/SelectionRectangle';
import {ISetView} from '../View/ISetView';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH} from '../Utils/Constants';
import {ISet} from '../Model/ISet';
import {LabelInputHandler} from '../Utils/LabelInputHandler';
import {TreeViewProperties} from '../View/TreeViewProperties';
import {CutSpriteHandler} from '../Utils/CutSpriteHandler';
import {ViewExporter} from '../Utils/ViewExporter';
import {MoveView} from '../View/MoveView';

export class UserActionController {
  scene: Phaser.Scene;

  treeController: TreeController;
  strategicForm: StrategicForm;
  undoRedoController: UndoRedoController;

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
    while (this.selectedNodes.length !== 0) {
      this.selectedNodes.pop();
    }
  }

  /**Resets the current Tree*/
  createNewTree() {
    this.deleteNodeHandler(this.treeController.treeView.nodes[0]);
    this.addNodesHandler(this.treeController.treeView.nodes[0]);
    this.checkCreateStrategicForm();
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

      this.treeController.treeView.nodes.forEach((nV: NodeView) => {
      });
    }
  }

  /**A method for adding children to selected nodes (keyboard N).*/
  addNodesHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.addNodeHandler([nodeV]);
    } else if (this.selectedNodes.length > 0) {
      this.treeController.addNodeHandler(this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /** A method for deleting nodes (keyboard DELETE).*/
  deleteNodeHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.deleteNodeHandler([nodeV]);
    } else if (this.selectedNodes.length > 0) {
      this.treeController.deleteNodeHandler(this.selectedNodes);
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

    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning players to nodes (keyboard 1,2,3,4)*/
  assignPlayerToNodeHandler(playerID: number, nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.assignPlayerToNode(playerID, [nodeV]);
    } else if (this.selectedNodes.length > 0) {
      this.treeController.assignPlayerToNode(playerID, this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning chance player to a node (keyboard 0)*/
  assignChancePlayerToNodeHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.assignChancePlayerToNode([nodeV]);
    } else if (this.selectedNodes.length > 0) {
      this.treeController.assignChancePlayerToNode(this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method which removes the last player from the list of players*/
  removeLastPlayerHandler() {
    const numberOfPlayers = this.treeController.tree.players.length - 1;
    if (numberOfPlayers > 1) {
      this.treeController.tree.removePlayer(this.treeController.tree.players[numberOfPlayers]);
      this.treeController.resetTree(false, false);
      this.checkCreateStrategicForm();
      this.undoRedoController.saveNewTree();
    }
  }

  addPlayerHandler() {
    const numberOfPlayers = this.treeController.tree.players.length - 1;
    if (numberOfPlayers < 4) {
      this.treeController.addPlayer(numberOfPlayers + 1);
    }
  }

  /**A method for creating an iSet (keyboard I)*/
  createISetHandler() {
    if (this.selectedNodes.length > 1) {
      try {
        this.treeController.createISet(this.selectedNodes);
      } catch (err) {
        this.events.emit('show-error', err);
        return;
      }
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**Remove iSetHandler*/
  removeISetHandler(iSet: ISet) {
    this.treeController.removeISetHandler(iSet);

    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**Removes and iSet by a given list of nodes*/
  removeISetsByNodesHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.removeISetHandler(nodeV.node.iSet);
    } else if (this.selectedNodes.length > 0) {
      this.treeController.removeISetsByNodesHandler(this.selectedNodes);
    } else {
      return;
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning undo/redo functionality (keyboard ctrl/shift + Z)*/
  undoRedoHandler(undo: boolean) {
    this.undoRedoController.changeTreeInController(undo);
    // this.viewExporter.treeView = this.treeController.treeView;
    this.emptySelectedNodes();
    this.checkCreateStrategicForm();
  }

  /**A method for assigning random payoffs*/
  randomPayoffsHandler() {
    this.treeController.assignRandomPayoffs();
    this.checkCreateStrategicForm();
  }

  /**A method which toggles the zero sum on or off*/
  toggleZeroSum() {
    this.treeController.treeView.properties.zeroSumOn = !this.treeController.treeView.properties.zeroSumOn;
    this.treeController.resetTree(false, false);
    this.checkCreateStrategicForm();
  }

  /**A method which toggles the fractional or decimal view of chance moves*/
  toggleFractionDecimal() {
    this.treeController.treeView.properties.fractionOn = !this.treeController.treeView.properties.fractionOn;
    this.treeController.resetTree(false, false);
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

      this.treeController.cutInformationSet(this.cutSpriteHandler.cutInformationSet,
        this.cutSpriteHandler.cutSprite.x, this.cutSpriteHandler.cutSprite.y);
      this.cutSpriteHandler.cutInformationSet = null;

      this.checkCreateStrategicForm();
      this.treeController.resetTree(true, true);
      this.undoRedoController.saveNewTree();
    }, this);
  }

  /**If the label input is active, go to the next label
   * If next is false, we go to the previous label*/
  activateLabelField(next: boolean) {
    this.labelInput.show(next);
  }

  /**If the input field is on and we press enter, change the label*/
  changeLabel(newLabel: string) {
    this.labelInput.changeLabel(newLabel);
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
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
    this.destroyStrategicForm();
    if (this.treeController.tree.checkAllNodesLabeled()) {
      this.strategicForm = new StrategicForm(this.treeController.tree);
    }
  }

  destroyStrategicForm() {
    if (this.strategicForm) {
      this.strategicForm.destroy();
      this.strategicForm = null;
    }
  }

  gameResize() {

    const element = document.getElementById('phaser-div');
    const boundingRect = element.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    this.scene.scale.setGameSize(width, height);
    this.treeController.treeView.properties = new TreeViewProperties(this.scene.sys.canvas.height * INITIAL_TREE_HEIGHT,
      this.scene.sys.canvas.width * INITIAL_TREE_WIDTH);
    this.treeController.resetTree(true, false);
  }
}

