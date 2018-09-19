/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {TreeController} from './TreeController';
import {StrategicForm} from '../Model/StrategicForm';
import {UndoRedoController} from './UndoRedoController';
import {NodeView} from '../View/NodeView';
import {SelectionRectangle} from '../Utils/SelectionRectangle';
import {ISetView} from '../View/ISetView';
import {TreeParser} from '../Utils/TreeParser';
import {ErrorPopUp} from '../Utils/ErrorPopUp';
import {CUT_SPRITE_TINT, ISET_LINE_WIDTH} from '../Utils/Constants';
import {Move} from '../Model/Move';
import {Node, NodeType} from '../Model/Node';
import {TreeView} from '../View/TreeView';
import {ISet} from '../Model/ISet';
import {LabelInputHandler} from '../Utils/LabelInputHandler';

export class UserActionController {
  game: Phaser.Game;

  treeController: TreeController;
  strategicForm: StrategicForm;
  undoRedoController: UndoRedoController;

  // Used for going to the next node on tab pressed
  labelInput: LabelInputHandler;

  selectedNodes: Array<NodeView>;
  selectionRectangle: SelectionRectangle;
  backgroundInputSprite: Phaser.Sprite;
  cutSprite: Phaser.Sprite;
  cutInformationSet: ISetView;
  treeParser: TreeParser;
  errorPopUp: ErrorPopUp;

  constructor(game: Phaser.Game, treeController: TreeController) {
    this.game = game;
    this.treeController = treeController;
    this.treeParser = new TreeParser();
    this.undoRedoController = new UndoRedoController(this.treeController);
    this.selectedNodes = [];

    this.labelInput = new LabelInputHandler(this.game, this.treeController);

    this.selectionRectangle = new SelectionRectangle(this.game);
    this.errorPopUp = new ErrorPopUp(this.game);

    this.createBackgroundForInputReset();
    this.createCutSprite();
  }

  /**The update method is built-into Phaser and is called 60 times a second.
   * It handles the selection of nodes, while holding the mouse button*/
  update() {
    if (this.game.input.activePointer.isDown && this.selectionRectangle.active) {
      this.treeController.treeView.nodes.forEach((n: NodeView) => {
        if (this.selectionRectangle.overlap(n) && this.selectedNodes.indexOf(n) === -1) {
          n.isSelected = true;
          n.resetNodeDrawing();
          this.selectedNodes.push(n);
        }
        if (!this.selectionRectangle.overlap(n) && this.selectedNodes.indexOf(n) !== -1 &&
          !this.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
          n.isSelected = false;
          n.resetNodeDrawing();
          this.selectedNodes.splice(this.selectedNodes.indexOf(n), 1);
        }
      });
    }

    this.updateCutSpriteHandler();
  }

  /** Empties the selected nodes in a better way*/
  emptySelectedNodes() {
    while (this.selectedNodes.length !== 0) {
      this.selectedNodes.pop();
    }
  }

  /**This sprite is created for the cut functionality of an independent set*/
  private createCutSprite() {
    this.cutSprite = this.game.add.sprite(0, 0, 'scissors');
    this.cutSprite.anchor.set(0.5, 0.5);
    this.cutSprite.alpha = 0;
    this.cutSprite.tint = CUT_SPRITE_TINT;
    this.cutSprite.width = this.game.height * ISET_LINE_WIDTH;
    this.cutSprite.height = this.game.height * ISET_LINE_WIDTH;
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
        n.resetNodeDrawing();
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
    this.destroyStrategicForm();
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
        this.errorPopUp.show(err.message);
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
    this.treeController.treeViewProperties.zeroSumOn = !this.treeController.treeViewProperties.zeroSumOn;
    this.treeController.resetTree(false, false);
    this.checkCreateStrategicForm();
  }

  /**A method which toggles the fractional or decimal view of chance moves*/
  toggleFractionDecimal() {
    this.treeController.treeViewProperties.fractionOn = !this.treeController.treeViewProperties.fractionOn;
    this.treeController.resetTree(false, false);
  }

  /**Starts the 'Cut' state for an Information set*/
  initiateCutSpriteHandler(iSetV?: ISetView) {
    if (iSetV) {
      this.cutInformationSet = iSetV;
    }
    else {
      let distinctISetsSelected = this.treeController.getDistinctISetsFromNodes(this.selectedNodes);
      if (distinctISetsSelected.length === 1) {
        this.cutInformationSet = this.treeController.treeView.findISetView(distinctISetsSelected[0]);
      }
    }
    if (!this.cutInformationSet) {
      return;
    }

    this.cutSprite.bringToTop();
    this.deselectNodesHandler();
    this.game.add.tween(this.cutSprite).to({alpha: 1}, 300, Phaser.Easing.Default, true);
    this.game.input.keyboard.enabled = false;
    this.treeController.treeView.nodes.forEach(n => {
      n.inputEnabled = false;
    });
    this.treeController.treeView.iSets.forEach(iSet => {
      iSet.inputEnabled = false;
    });

    this.game.input.onDown.addOnce(() => {
      this.treeController.treeView.nodes.forEach(n => {
        n.inputEnabled = true;
      });
      this.treeController.treeView.iSets.forEach(iSet => {
        iSet.inputEnabled = true;
      });
      this.game.input.keyboard.enabled = true;
      this.cutSprite.alpha = 0;

      this.treeController.cutInformationSet(this.cutInformationSet, this.cutSprite.x, this.cutSprite.y);
      this.treeController.resetTree(true, true);
      this.undoRedoController.saveNewTree();
    }, this);

  }

  /**Updates the position of the cut sprite once every frame, when the cut functionality is on*/
  updateCutSpriteHandler() {
    if (this.cutSprite.alpha > 0) {
      let mouseXPosition = this.game.input.mousePointer.x;
      let finalPosition = new Phaser.Point();
      let nodeWidth = this.cutInformationSet.nodes[0].width * 0.5;

      // Limit from the left for X coordinate
      if (mouseXPosition - nodeWidth < this.cutInformationSet.nodes[0].x) {
        finalPosition.x = this.cutInformationSet.nodes[0].x + nodeWidth;
      }
      // Limit from the right for X coordinate
      else if (mouseXPosition + nodeWidth > this.cutInformationSet.nodes[this.cutInformationSet.nodes.length - 1].x) {
        finalPosition.x = this.cutInformationSet.nodes[this.cutInformationSet.nodes.length - 1].x - nodeWidth;
      }
      // Or just follow the mouse (X coordinate)
      else {
        finalPosition.x = mouseXPosition;
      }

      let closestLeftNodeIndex;

      // Find the two consecutive nodes where the sprite is
      for (let i = 0; i < this.cutInformationSet.nodes.length - 1; i++) {
        if (finalPosition.x >= this.cutInformationSet.nodes[i].x && finalPosition.x <= this.cutInformationSet.nodes[i + 1].x) {
          closestLeftNodeIndex = i;
        }
      }

      // set the y difference to be proportional to the x difference
      const closestLeftNodePosition = this.cutInformationSet.nodes[closestLeftNodeIndex].position;
      const closestRightNodePosition = this.cutInformationSet.nodes[closestLeftNodeIndex + 1].position;
      const proportionInX = (finalPosition.x - closestLeftNodePosition.x) /
        (closestRightNodePosition.x - closestLeftNodePosition.x);
      // console.log(proportionInX);
      finalPosition.y = closestLeftNodePosition.y + proportionInX * (closestRightNodePosition.y - closestLeftNodePosition.y);

      this.cutSprite.position.x = finalPosition.x;
      this.cutSprite.position.y = finalPosition.y;

      finalPosition = null;
      mouseXPosition = null;
      nodeWidth = null;
    }
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
      node.resetNodeDrawing();
    });
    this.treeController.treeView.moves.forEach(m => {
      m.updateMovePosition();
      m.updateLabel(this.treeController.treeViewProperties.fractionOn);
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
}

