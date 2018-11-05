/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {TreeController} from './TreeController';
import {StrategicForm} from '../Model/StrategicForm';
import {UndoRedoController} from './UndoRedoController';
import {NodeView} from '../View/NodeView';
import {SelectionRectangle} from '../Utils/SelectionRectangle';
import {ISetView} from '../View/ISetView';
import {TreeParser} from '../Utils/TreeParser';
import {INITIAL_TREE_HEIGHT, INITIAL_TREE_WIDTH} from '../Utils/Constants';
import {ISet} from '../Model/ISet';
import {LabelInputHandler} from '../Utils/LabelInputHandler';
import {TreeViewProperties} from '../View/TreeViewProperties';
import {CutSpriteHandler} from '../Utils/CutSpriteHandler';

export class UserActionController {
  game: Phaser.Game;

  treeController: TreeController;
  strategicForm: StrategicForm;
  undoRedoController: UndoRedoController;

  // Used for going to the next node on tab pressed
  labelInput: LabelInputHandler;
  cutSpriteHandler: CutSpriteHandler;
  errorSignal: Phaser.Signal;

  selectedNodes: Array<NodeView>;
  selectionRectangle: SelectionRectangle;
  backgroundInputSprite: Phaser.Sprite;

  treeParser: TreeParser;

  private resizeLocked: boolean;

  constructor(game: Phaser.Game, treeController: TreeController) {
    this.game = game;
    this.treeController = treeController;
    this.treeParser = new TreeParser();
    this.undoRedoController = new UndoRedoController(this.treeController);
    this.selectedNodes = [];

    this.labelInput = new LabelInputHandler(this.game, this.treeController);
    this.cutSpriteHandler = new CutSpriteHandler(this.game);

    this.selectionRectangle = new SelectionRectangle(this.game);
    this.resizeLocked = false;

    this.errorSignal = new Phaser.Signal();

    this.treeController.treeChangedSignal.add(() => {
      this.checkCreateStrategicForm();
      this.undoRedoController.saveNewTree();
    });

    this.createBackgroundForInputReset();
  }

  /**The update method is built-into Phaser and is called 60 times a second.
   * It handles the selection of nodes, while holding the mouse button*/
  update() {
    if (this.game.input.activePointer.isDown && this.selectionRectangle.active) {
      this.treeController.treeView.nodes.forEach((n: NodeView) => {
        if (this.selectionRectangle.overlap(n) && this.selectedNodes.indexOf(n) === -1) {
          n.isSelected = true;
          n.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
          this.selectedNodes.push(n);
        }
        if (!this.selectionRectangle.overlap(n) && this.selectedNodes.indexOf(n) !== -1 &&
          !this.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
          n.isSelected = false;
          n.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
          this.selectedNodes.splice(this.selectedNodes.indexOf(n), 1);
        }
      });
    }

    this.cutSpriteHandler.update();
  }

  /** Empties the selected nodes in a better way*/
  emptySelectedNodes() {
    while (this.selectedNodes.length !== 0) {
      this.selectedNodes.pop();
    }
  }

  /**This sprite resets the input and node selection if someone clicks on a sprite which does not have input*/
  private createBackgroundForInputReset() {
    this.backgroundInputSprite = this.game.add.sprite(0, 0, '');

    this.backgroundInputSprite.width = this.game.width;
    this.backgroundInputSprite.height = this.game.height;
    this.backgroundInputSprite.inputEnabled = true;
    this.backgroundInputSprite.sendToBack();
    this.backgroundInputSprite.events.onInputDown.add(() => {
      if (!this.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
        this.deselectNodesHandler();
      }
    });
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
      this.selectedNodes.forEach(n => {
        n.isSelected = false;
        n.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
      });
      this.emptySelectedNodes();
    }
  }

  /**A method for adding children to selected nodes (keyboard N).*/
  addNodesHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.addNodeHandler([nodeV]);
    }
    else if (this.selectedNodes.length > 0) {
      this.treeController.addNodeHandler(this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /** A method for deleting nodes (keyboard DELETE).*/
  deleteNodeHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.deleteNodeHandler([nodeV]);
    }
    else if (this.selectedNodes.length > 0) {
      this.treeController.deleteNodeHandler(this.selectedNodes);
    }
    const deletedNodes = [];
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach(n => {
        if (n.node === null) {
          deletedNodes.push(n);
        }
      });
    }

    deletedNodes.forEach(n => {
      this.selectedNodes.splice(this.selectedNodes.indexOf(n), 1);
    });

    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning players to nodes (keyboard 1,2,3,4)*/
  assignPlayerToNodeHandler(playerID: number, nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.assignPlayerToNode(playerID, [nodeV]);
    }
    else if (this.selectedNodes.length > 0) {
      this.treeController.assignPlayerToNode(playerID, this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning chance player to a node (keyboard 0)*/
  assignChancePlayerToNodeHandler(nodeV?: NodeView) {
    if (nodeV) {
      this.treeController.assignChancePlayerToNode([nodeV]);
    }
    else if (this.selectedNodes.length > 0) {
      this.treeController.assignChancePlayerToNode(this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method which removes the last player from the list of players*/
  removeLastPlayerHandler() {
    let numberOfPlayers = this.treeController.tree.players.length - 1;
    if (numberOfPlayers > 1) {
      this.treeController.tree.removePlayer(this.treeController.tree.players[numberOfPlayers]);
      this.treeController.resetTree(false, false);
      this.checkCreateStrategicForm();
      this.undoRedoController.saveNewTree();
    }
  }

  addPlayerHandler() {
    let numberOfPlayers = this.treeController.tree.players.length - 1;
    if (numberOfPlayers < 4) {
      this.treeController.addPlayer(numberOfPlayers + 1);
    }
  }

  /**A method for creating an iSet (keyboard I)*/
  createISetHandler() {
    if (this.selectedNodes.length > 1) {
      try {
        this.treeController.createISet(this.selectedNodes);
      }
      catch (err) {
        this.errorSignal.dispatch(err);
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
    }
    else {
      this.treeController.removeISetsByNodesHandler(this.selectedNodes);
    }
    this.checkCreateStrategicForm();
    this.undoRedoController.saveNewTree();
  }

  /**A method for assigning undo/redo functionality (keyboard ctrl/shift + Z)*/
  undoRedoHandler(undo: boolean) {
    this.undoRedoController.changeTreeInController(undo);
    // $('#player-number').html((this.treeController.tree.players.length - 1).toString());
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
    }
    else {
      let distinctISetsSelected = this.treeController.getDistinctISetsFromNodes(this.selectedNodes);
      if (distinctISetsSelected.length === 1) {
        this.cutSpriteHandler.cutInformationSet = this.treeController.treeView.findISetView(distinctISetsSelected[0]);
      }
    }
    if (!this.cutSpriteHandler.cutInformationSet) {
      return;
    }

    this.cutSpriteHandler.cutSprite.bringToTop();
    this.deselectNodesHandler();
    this.game.add.tween(this.cutSpriteHandler.cutSprite).to({alpha: 1}, 300, Phaser.Easing.Default, true);
    this.game.input.keyboard.enabled = false;
    this.treeController.treeView.nodes.forEach(n => {
      n.inputEnabled = false;
    });
    this.treeController.treeView.iSets.forEach(iSet => {
      iSet.inputEnabled = false;
    });

    this.game.input.onDown.addOnce(() => {
      this.cutSpriteHandler.cutSprite.alpha = 0;

      this.treeController.treeView.nodes.forEach(n => {
        n.inputEnabled = true;
      });
      this.treeController.treeView.iSets.forEach(iSet => {
        iSet.inputEnabled = true;
      });
      this.game.input.keyboard.enabled = true;

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
    this.selectedNodes.forEach(node => {
      node.position.add(directionX * distance, directionY * distance);
      node.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
    });
    this.treeController.treeView.moves.forEach(m => {
      m.updateMovePosition();
      m.updateLabel(this.treeController.treeView.properties.fractionOn, this.treeController.treeView.properties.levelHeight);
    });
    this.treeController.treeView.drawISets();
  }

  checkCreateStrategicForm() {
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
    if (!this.resizeLocked) {
      this.resizeLocked = true;
      this.game.time.events.add(100, () => {
        let element = document.getElementById('phaser-div');
        let boundingRect = element.getBoundingClientRect();
        let width = boundingRect.width;
        let height = boundingRect.height;
        this.game.scale.setGameSize(width, height);
        this.treeController.treeView.properties = new TreeViewProperties(this.game.height * INITIAL_TREE_HEIGHT,
          this.game.width * INITIAL_TREE_WIDTH);
        this.treeController.treeView.properties = this.treeController.treeView.properties;
        this.treeController.resetTree(true, false);
        this.resizeLocked = false;
      });
    }
  }
}

