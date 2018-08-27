/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
///<reference path="../Model/ISet.ts"/>
///<reference path="../View/ISetView.ts"/>
///<reference path="../Utils/Constants.ts"/>
///<reference path="../Model/Node.ts"/>
///<reference path="UndoRedoController.ts"/>
///<reference path="../Utils/TreeParser.ts"/>
///<reference path="../Model/StrategicForm.ts"/>
///<reference path="../View/StrategicFormView.ts"/>
///<reference path="../Model/Move.ts"/>
///<reference path="../Menus/LabelInput/LabelInput.ts"/>


namespace GameTheoryExplorer {
  export class UserActionController {
    game: Phaser.Game;

    treeController: TreeController;
    // TODO: Create a strategic form controller
    strategicForm: StrategicForm;
    strategicFormView: StrategicFormView;
    undoRedoController: UndoRedoController;

    // Used for going to the next node on tab pressed
    private nodesBFSOrder: Array<Node>;
    private leavesDFSOrder: Array<Node>;

    selectedNodes: Array<NodeView>;
    selectionRectangle: SelectionRectangle;
    backgroundInputSprite: Phaser.Sprite;
    cutSprite: Phaser.Sprite;
    cutInformationSet: ISetView;
    treeParser: TreeParser;
    errorPopUp: ErrorPopUp;
    solvedSignal: Phaser.Signal;

    constructor(game: Phaser.Game, treeController: TreeController) {
      this.game = game;
      this.treeController = treeController;
      this.treeParser = new TreeParser();
      this.undoRedoController = new UndoRedoController(this.treeController);
      this.selectedNodes = [];

      this.selectionRectangle = new SelectionRectangle(this.game);
      this.errorPopUp = new ErrorPopUp(this.game);
      this.nodesBFSOrder = [];
      this.leavesDFSOrder = [];
      this.solvedSignal = new Phaser.Signal();

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
      this.destroyStrategicForm();
    }

    /**Saves a tree to a txt file*/
    saveTreeToFile() {
      // const text = this.treeParser.stringify(this.treeController.tree);
      // const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
      // saveAs(blob, GTE_DEFAULT_FILE_NAME + '.txt');
    }

    /**Toggles the open file menu to chose a txt file with a tree*/
    toggleOpenFile() {
      const input = event.target;

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        this.loadTreeFromFile(text);
      };

      reader.readAsText((<any>input).files[0]);
    }

    /**A method which loads the tree from a selected file*/
    private loadTreeFromFile(text: string) {
      try {
        this.treeController.deleteNodeHandler([this.treeController.treeView.nodes[0]]);
        this.treeController.treeView.nodes[0].destroy();
        this.treeController.treeView.iSets.forEach((iSet: ISetView) => {
          iSet.destroy();
        });


        const tree = this.treeParser.parse(text);
        // temporary fix for labels
        const labels = [];
        tree.moves.forEach((m: Move) => {
          if (m.from.type === NodeType.OWNED) {
            labels.push(m.label);
          }
          else {
            labels.push(null);
          }
        });
        if (tree.nodes.length >= 3) {
          this.treeController.tree = tree;
          this.treeController.treeView =
            new TreeView(this.treeController.game, this.treeController.tree, this.treeController.treeViewProperties);

          // temporary fix oontinued
          for (let i = 0; i < this.treeController.tree.moves.length; i++) {
            const move = this.treeController.tree.moves[i];
            if (move.from.type === NodeType.OWNED) {
              this.treeController.tree.moves[i].label = labels[i];
            }
          }
          this.emptySelectedNodes();
          this.treeController.treeView.nodes.forEach(n => {
            n.resetNodeDrawing();
            n.resetLabelText(this.treeController.treeViewProperties.zeroSumOn);
          });
          this.treeController.treeView.showOrHideLabels(false);
          this.treeController.attachHandlersToNodes();
          this.treeController.treeView.iSets.forEach(iSetV => {
            this.treeController.attachHandlersToISet(iSetV);
          });
        }
      }
      catch (err) {
        this.errorPopUp.show('Error in reading file. ');
        this.treeController.createInitialTree();
      }
      this.destroyStrategicForm();
    }

    /**A method which saves the tree to a png file*/
    saveTreeToImage() {
      this.game.world.getByName('hoverMenu').alpha = 0;
      // setTimeout(() => {
      //     let cnvs = $('#phaser-div').find('canvas');
      //     (<any>cnvs[0]).toBlob(function (blob) {
      //         saveAs(blob, GTE_DEFAULT_FILE_NAME + '.png');
      //     });
      // }, 100
      // );
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

      this.destroyStrategicForm();
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
      this.undoRedoController.saveNewTree();
    }

    /**A method which removes the last player from the list of players*/
    removeLastPlayerHandler() {
      this.treeController.tree.removePlayer(this.treeController.tree.players[this.treeController.tree.players.length - 1]);
      // $('#player-number').html((this.treeController.tree.players.length - 1).toString());

      this.treeController.resetTree(false, false);
      this.destroyStrategicForm();
      this.undoRedoController.saveNewTree();
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
      this.destroyStrategicForm();
      this.undoRedoController.saveNewTree();
    }

    /**Remove iSetHandler*/
    removeISetHandler(iSet: ISet) {
      this.treeController.removeISetHandler(iSet);
      this.destroyStrategicForm();
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
      this.destroyStrategicForm();
      this.undoRedoController.saveNewTree();
    }

    /**A method for assigning undo/redo functionality (keyboard ctrl/shift + Z)*/
    undoRedoHandler(undo: boolean) {
      this.undoRedoController.changeTreeInController(undo);
      // $('#player-number').html((this.treeController.tree.players.length - 1).toString());
      this.emptySelectedNodes();
      this.destroyStrategicForm();
    }

    /**A method for assigning random payoffs*/
    randomPayoffsHandler() {
      this.treeController.assignRandomPayoffs();
      this.destroyStrategicForm();
    }

    /**A method which toggles the zero sum on or off*/
    toggleZeroSum() {
      this.treeController.treeViewProperties.zeroSumOn = !this.treeController.treeViewProperties.zeroSumOn;
      this.destroyStrategicForm();
      this.treeController.resetTree(false, false);
    }

    /**A method which toggles the fractional or decimal view of chance moves*/
    toggleFractionDecimal() {
      this.treeController.treeViewProperties.fractionOn = !this.treeController.treeViewProperties.fractionOn;
      this.treeController.resetTree(false, false);
    }

    /**Starts the 'Cut' state for an Information set*/
    initiateCutSpriteHandler(iSetV: ISetView) {
      this.cutInformationSet = iSetV;
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
      // if (this.treeController.labelInput.active) {
      //   if (this.treeController.labelInput.shouldRecalculateOrder) {
      //     this.nodesBFSOrder = this.treeController.tree.BFSOnTree();
      //     this.leavesDFSOrder = this.treeController.tree.getLeaves();
      //   }
      //   // If we are currently looking at moves
      //   if (this.treeController.labelInput.currentlySelected instanceof MoveView) {
      //     const index = this.nodesBFSOrder.indexOf((<MoveView>this.treeController.labelInput.currentlySelected).move.to);
      //
      //     // Calculate the next index in the BFS order to go to. If the last node, go to the next after the root, i.e. index 1
      //     let nextIndex;
      //     if (next) {
      //       nextIndex = this.nodesBFSOrder.length !== index + 1 ? index + 1 : 1;
      //     }
      //     else {
      //       nextIndex = index === 1 ? this.nodesBFSOrder.length - 1 : index - 1;
      //     }
      //     // Activate the next move
      //     const nextMove = this.treeController.treeView.findMoveView(this.nodesBFSOrder[nextIndex].parentMove);
      //     nextMove.label.events.onInputDown.dispatch(nextMove.label);
      //   }
      //   // If we are currently looking at nodes
      //   else if (this.treeController.labelInput.currentlySelected instanceof NodeView) {
      //     // If owner label
      //     if ((<NodeView>this.treeController.labelInput.currentlySelected).ownerLabel.alpha === 1) {
      //       const index = this.nodesBFSOrder.indexOf((<NodeView>this.treeController.labelInput.currentlySelected).node);
      //       const nextIndex = this.calculateNodeLabelIndex(next, index);
      //       const nextNode = this.treeController.treeView.findNodeView(this.nodesBFSOrder[nextIndex]);
      //       nextNode.ownerLabel.events.onInputDown.dispatch(nextNode.ownerLabel);
      //     }
      //     // If payoffs label
      //     else {
      //       const index = this.leavesDFSOrder.indexOf((<NodeView>this.treeController.labelInput.currentlySelected).node);
      //       let nextIndex;
      //       if (next) {
      //         nextIndex = this.leavesDFSOrder.length !== index + 1 ? index + 1 : 0;
      //       }
      //       else {
      //         nextIndex = index === 0 ? this.leavesDFSOrder.length - 1 : index - 1;
      //       }
      //       const nextNode = this.treeController.treeView.findNodeView(this.leavesDFSOrder[nextIndex]);
      //       nextNode.payoffsLabel.events.onInputDown.dispatch(nextNode.payoffsLabel);
      //     }
      //   }
      // }
    }

    /**If the input field is on and we press enter, change the label*/
    changeLabel() {
      // if (this.treeController.labelInput.active) {
      //   // If we are looking at moves
      //   if (this.treeController.labelInput.currentlySelected instanceof MoveView) {
      //     const moveV = (<MoveView>this.treeController.labelInput.currentlySelected);
      //     this.treeController.tree.changeMoveLabel(moveV.move, this.treeController.labelInput.inputField.val());
      //     this.treeController.treeView.moves.forEach(m => {
      //       m.updateLabel(this.treeController.treeViewProperties.fractionOn);
      //     });
      //   }
      //   // If we are looking at nodes
      //   else if (this.treeController.labelInput.currentlySelected instanceof NodeView) {
      //     const nodeV = (<NodeView>this.treeController.labelInput.currentlySelected);
      //     if (nodeV.ownerLabel.alpha === 1) {
      //       nodeV.node.player.label = this.treeController.labelInput.inputField.val();
      //       this.treeController.treeView.nodes.forEach(n => {
      //         if (n.node.player) {
      //           n.ownerLabel.setText(n.node.player.label, true);
      //         }
      //       });
      //
      //     }
      //     else {
      //       nodeV.node.payoffs.saveFromString(this.treeController.labelInput.inputField.val());
      //       this.treeController.treeView.nodes.forEach(n => {
      //         n.resetLabelText(this.treeController.treeViewProperties.zeroSumOn);
      //       });
      //       if (this.treeController.tree.players.length === 3) {
      //         try {
      //           this.createStrategicForm();
      //         }
      //         catch (err) {
      //           // Handle error
      //         }
      //       }
      //     }
      //
      //   }
      //   this.activateLabelField(true);
      //   this.undoRedoController.saveNewTree();
      // }
    }

    /**Hides the input*/
    hideInputLabel() {
      if (this.treeController.labelInput.active) {
        this.treeController.labelInput.hide();
      }
    }

    /**A helper method which calculates the next possible index of a labeled node*/
    private calculateNodeLabelIndex(next: boolean, current: number) {
      const nodeIndex = current;
      if (next) {
        for (let i = current + 1; i < this.nodesBFSOrder.length; i++) {
          if (this.nodesBFSOrder[i].player && this.nodesBFSOrder[i].player !== this.treeController.tree.players[0]) {
            return i;
          }
        }
        // If we have not found such an element in the next, keep search from the beginning
        for (let i = 0; i < current; i++) {
          if (this.nodesBFSOrder[i].player && this.nodesBFSOrder[i].player !== this.treeController.tree.players[0]) {
            return i;
          }
        }
      }
      // If we want the previous
      else {
        for (let i = current - 1; i >= 0; i--) {
          if (this.nodesBFSOrder[i].player && this.nodesBFSOrder[i].player !== this.treeController.tree.players[0]) {
            return i;
          }
        }
        // If we have not found such an element in the next, keep search from the beginning
        if (nodeIndex === current) {
          for (let i = this.nodesBFSOrder.length - 1; i > current; i--) {
            if (this.nodesBFSOrder[i].player && this.nodesBFSOrder[i].player !== this.treeController.tree.players[0]) {
              return i;
            }
          }
        }
      }
      return current;
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

    createStrategicForm() {
      this.destroyStrategicForm();

      if (this.treeController.tree.checkAllNodesLabeled()) {
        this.strategicForm = new StrategicForm(this.treeController.tree);
        this.strategicFormView = new StrategicFormView(this.game, this.strategicForm);
        this.strategicFormView.background.events.onDragStart.add(() => {
          this.game.canvas.style.cursor = 'move';
          this.selectionRectangle.active = false;
        });
        this.strategicFormView.background.events.onDragStop.add(() => {
          this.game.canvas.style.cursor = 'move';
          this.selectionRectangle.active = true;
        });
        this.strategicFormView.closeIcon.events.onInputDown.add(() => {
          this.strategicForm.destroy();
          this.strategicFormView.destroy();
        });
      }
    }

    destroyStrategicForm() {
      if (this.strategicForm) {
        this.strategicForm.destroy();
      }
      if (this.strategicFormView) {
        this.strategicFormView.destroy();
      }
    }

    solveGame() {
      console.log('hanged');
      this.createStrategicForm();

      if (this.strategicForm) {
        console.log(this.strategicForm.payoffsMatrix);
        const rows = this.strategicForm.payoffsMatrix.length;
        const cols = this.strategicForm.payoffsMatrix[0].length;

        let m1 = '';
        let m2 = '';
        for (let i = 0; i < this.strategicForm.payoffsMatrix.length; i++) {
          for (let j = 0; j < this.strategicForm.payoffsMatrix[i].length; j++) {
            m1 += this.strategicForm.payoffsMatrix[i][j].outcomes[0] + ' ';
            m2 += this.strategicForm.payoffsMatrix[i][j].outcomes[0] + ' ';
          }
          m1 += '\n';
          m2 += '\n';
        }

        const objToSend = rows + ' ' + cols + '\n\n' + m1 + '\n' + m2;

        const data = new FormData();
        data.append('game_text', objToSend);
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
          if (xhr.readyState === 4) {
            this.solvedSignal.dispatch(xhr.responseText);
          }
        });


        xhr.open('POST', 'http://test.api.logos.bg/api/solve/');
        xhr.send(data);
      }
    }
  }
}
