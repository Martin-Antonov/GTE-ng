import {UserActionController} from './UserActionController';
import {NODES_HORIZONTAL_STEP_POSITIONING, NODES_VERTICAL_STEP_POSITIONING} from '../Utils/Constants';
import {IKeyboardKeys} from './IKeyboardKeys';

/** A class for controlling the input of the application. If there is a confusion over the functionality of each button
 * you can check the attachHandlersToKeysMethod*/

export class KeyboardController {
  scene: Phaser.Scene;
  userActionController: UserActionController;
  keys: IKeyboardKeys;

  constructor(scene: Phaser.Scene, userActionController: UserActionController) {
    this.scene = scene;
    this.userActionController = userActionController;

    this.addKeys();
    this.attachHandlersToKeys();
  }

  /**Assigning all keys to the corresponding properties in the class*/
  addKeys() {
    this.keys =
      this.scene.input.keyboard.addKeys('SHIFT,CTRL,ALT,N,ZERO,I,PLUS,MINUS,SPACE,Z,D,U,C,S,R,Y,L,' +
        'TAB,ENTER,ESC,UP,DOWN,LEFT,RIGHT,ONE,TWO,THREE,FOUR,DELETE') as IKeyboardKeys;

    this.scene.input.keyboard.removeCapture('ZERO,ONE,TWO,THREE,FOUR,N,I,SPACE,Z,D,U,C,S,R,Y,L,LEFT,RIGHT,DOWN,UP,SHIFT');
  }

  /**A method which assigns action to each key via the UserActionController*/
  attachHandlersToKeys() {
    // Add Children
    this.keys.N.on('down', () => {
      if (!this.keys.CTRL.isDown && !this.keys.ALT.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.addNodesHandler();
      }
    });
    // Phaser 3 not working
    // this.keys.PLUS.on('down', () => {
    //   if (!this.keys.CTRL.isDown && !this.keys.ALT.isDown && !this.userActionController.labelInput.active) {
    //     this.userActionController.addNodesHandler();
    //   }
    // });

    // Delete nodes
    this.keys.DELETE.on('down', () => {
      this.userActionController.deleteNodeHandler();
    });
    this.keys.D.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.deleteNodeHandler();
      }
    });
    // MINUS KEY NOT WORKING ON P3
    // this.keys.MINUS.on('down', () => {
    //   this.userActionController.deleteNodeHandler();
    // });

    // Assigning players
    this.keys.ZERO.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignChancePlayerToNodeHandler();
      }
    });
    this.keys.ONE.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignPlayerToNodeHandler(1);
      }
    });
    this.keys.TWO.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignPlayerToNodeHandler(2);
      }
    });
    this.keys.THREE.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignPlayerToNodeHandler(3);
      }
    });
    this.keys.FOUR.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignPlayerToNodeHandler(4);
      }
    });

    // Create an information set
    this.keys.I.on('down', () => {
      if (!this.keys.CTRL.isDown && !this.keys.ALT.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.createISetHandler();
      }
    });

    // Undo and redo
    this.keys.Z.on('down', () => {
      if (this.keys.CTRL.isDown && !this.keys.SHIFT.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(true);
      }
      if (this.keys.CTRL.isDown && this.keys.SHIFT.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(false);
      }
    });

    this.keys.U.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(true);
      }
    });

    this.keys.R.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(false);
      }
    });

    this.keys.Y.on('down', () => {
      if (this.keys.CTRL.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(false);
      }
    });

    // Remove information set
    this.keys.S.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.removeISetsByNodesHandler();
      }
    });

    // Cut information set
    this.keys.C.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.initiateCutSpriteHandler();
      }
    });

    // Change to the next label
    this.keys.TAB.on('down', () => {
      if (this.keys.SHIFT.isDown) {
        this.userActionController.activateLabelField(false);
      } else {
        // this.userActionController.activateLabelField(true);
      }
    });

    this.keys.L.on('down', () => {
      this.userActionController.selectChildren();
    });

    // Exit label
    this.keys.ESC.on('down', () => {
      this.userActionController.hideInputLabel();
    });


    // Arrow Keys Moving nodes
    this.keys.UP.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });

    this.keys.DOWN.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });

    this.keys.LEFT.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });

    this.keys.RIGHT.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });


    this.keys.UP.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(0, -1, 1);
          this.keys.UP.emitOnRepeat = true;
        } else {
          this.keys.UP.emitOnRepeat = false;
          const verticalDistance = this.userActionController.treeController.treeView.properties.levelHeight * NODES_VERTICAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(0, -1, verticalDistance);
        }
      }
    });

    this.keys.DOWN.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(0, 1, 1);
          this.keys.DOWN.emitOnRepeat = true;
        } else {
          this.keys.DOWN.emitOnRepeat = false;
          const verticalDistance = this.userActionController.treeController.treeView.properties.levelHeight * NODES_VERTICAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(0, 1, verticalDistance);
        }
      }
    });

    this.keys.LEFT.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(-1, 0, 1);
          this.keys.LEFT.emitOnRepeat = true;
        } else {
          this.keys.LEFT.emitOnRepeat = false;
          const horizontalDistance = this.userActionController.treeController.treeView.properties.treeWidth /
            this.userActionController.treeController.tree.getLeaves().length * NODES_HORIZONTAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(-1, 0, horizontalDistance);
        }
      }
    });
    this.keys.RIGHT.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(1, 0, 1);
          this.keys.RIGHT.emitOnRepeat = true;
        } else {
          this.keys.RIGHT.emitOnRepeat = false;
          const horizontalDistance = this.userActionController.treeController.treeView.properties.treeWidth /
            this.userActionController.treeController.tree.getLeaves().length * NODES_HORIZONTAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(1, 0, horizontalDistance);
        }
      }
    });
  }
}

