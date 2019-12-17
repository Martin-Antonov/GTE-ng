import {IKeyboardKeys} from './IKeyboardKeys';
import {UserActionController} from '../Main/UserActionController';
import {NODES_HORIZONTAL_STEP_POSITIONING, NODES_VERTICAL_STEP_POSITIONING} from '../../Utils/Constants';
import {ACTION} from '../UndoRedo/ActionsEnum';

/** A class for controlling the input of the application. If there is a confusion over the functionality of each button
 * you can check the attachHandlersToKeysMethod*/

export class KeyboardController {
  scene: Phaser.Scene;
  userActionController: UserActionController;
  keys: IKeyboardKeys;
  distanceMoved: number;

  constructor(scene: Phaser.Scene, userActionController: UserActionController) {
    this.scene = scene;
    this.userActionController = userActionController;
    this.distanceMoved = 0;
    this.addKeys();
    this.attachHandlersToKeys();
  }

  /**Assigning all keys to the corresponding properties in the class*/
  addKeys() {
    this.keys =
      this.scene.input.keyboard.addKeys('SHIFT,CTRL,ALT,N,ZERO,I,PLUS,MINUS,SPACE,Z,D,U,C,S,R,Y,L,' +
        'TAB,ENTER,ESC,UP,DOWN,LEFT,RIGHT,ONE,TWO,THREE,FOUR,DELETE,NUMPAD_ADD,NUMPAD_SUBTRACT') as IKeyboardKeys;

    this.scene.input.keyboard.removeCapture('ZERO,ONE,TWO,THREE,FOUR,N,I,SPACE,Z,D,U,C,S,R,Y,L,LEFT,RIGHT,DOWN,UP,SHIFT,MINUS,PLUS,NUMPAD_ADD,NUMPAD_SUBTRACT');
  }

  /**A method which assigns action to each key via the UserActionController*/
  attachHandlersToKeys() {
    // TestKey
    // this.keys.SPACE.on('down', () => {
    //   const children = this.userActionController.treeController.tree.nodes[0].children;
    //   const treeV = this.userActionController.treeController.treeView;
    //
    //   const a = children[0];
    //   children[0] = children[1];
    //   children[1] = a;
    //
    //   // const b = treeV.nodes[1];
    //   // treeV.nodes[1] = treeV.nodes[2];
    //   // treeV.nodes[2] = b;
    //
    //   this.userActionController.treeController.resetTree(true, true);
    // });
    // this.keys.SPACE.on('down', () => {
    //   this.userActionController.undoRedoActionController.playFromBeginning();
    // });
    // Add Children
    this.keys.N.on('down', () => {
      if (!this.keys.CTRL.isDown && !this.keys.ALT.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.addNodesHandler();
      }
    });
    this.keys.NUMPAD_ADD.on('down', () => {
      if (!this.keys.CTRL.isDown && !this.keys.ALT.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.addNodesHandler();
      }
    });

    // Delete nodes
    this.keys.DELETE.on('down', () => {
      this.userActionController.deleteNodeHandler();
    });
    this.keys.D.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.deleteNodeHandler();
      }
    });

    this.keys.NUMPAD_SUBTRACT.on('down', () => {
      this.userActionController.deleteNodeHandler();
    });

    // Assigning players
    this.keys.ZERO.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignPlayerToNodeHandler(0);
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
      this.userActionController.undoRedoActionController.saveAction(ACTION.MOVE_TREE, [0, -this.distanceMoved, this.userActionController.selectedNodes]);
      this.distanceMoved = 0;
    });

    this.keys.DOWN.on('up', () => {

      this.userActionController.undoRedoActionController.saveAction(ACTION.MOVE_TREE, [0, this.distanceMoved, this.userActionController.selectedNodes]);
      this.distanceMoved = 0;
    });

    this.keys.LEFT.on('up', () => {
      this.userActionController.undoRedoActionController.saveAction(ACTION.MOVE_TREE, [-this.distanceMoved, 0, this.userActionController.selectedNodes]);
      this.distanceMoved = 0;
    });

    this.keys.RIGHT.on('up', () => {

      this.userActionController.undoRedoActionController.saveAction(ACTION.MOVE_TREE, [this.distanceMoved, 0, this.userActionController.selectedNodes]);
      this.distanceMoved = 0;
    });


    this.keys.UP.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(0, -1, 1);
          this.keys.UP.emitOnRepeat = true;
          this.distanceMoved += 1;
        } else {
          this.keys.UP.emitOnRepeat = false;
          const verticalDistance = this.userActionController.treeController.treeView.properties.levelHeight * NODES_VERTICAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(0, -1, verticalDistance);
          this.distanceMoved = verticalDistance;
        }
      }
    });

    this.keys.DOWN.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(0, 1, 1);
          this.keys.DOWN.emitOnRepeat = true;
          this.distanceMoved += 1;
        } else {
          this.distanceMoved = 0;
          this.keys.DOWN.emitOnRepeat = false;
          const verticalDistance = this.userActionController.treeController.treeView.properties.levelHeight * NODES_VERTICAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(0, 1, verticalDistance);
          this.distanceMoved = verticalDistance;
        }
      }
    });

    this.keys.LEFT.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(-1, 0, 1);
          this.keys.LEFT.emitOnRepeat = true;
          this.distanceMoved += 1;
        } else {
          this.distanceMoved = 0;
          this.keys.LEFT.emitOnRepeat = false;
          const horizontalDistance = this.userActionController.treeController.treeView.properties.treeWidth /
            this.userActionController.treeController.tree.getLeaves().length * NODES_HORIZONTAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(-1, 0, horizontalDistance);
          this.distanceMoved = horizontalDistance;
        }
      }
    });
    this.keys.RIGHT.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        if (this.keys.CTRL.isDown) {
          this.userActionController.moveNodeManually(1, 0, 1);
          this.keys.RIGHT.emitOnRepeat = true;
          this.distanceMoved += 1;
        } else {
          this.distanceMoved = 0;
          this.keys.RIGHT.emitOnRepeat = false;
          const horizontalDistance = this.userActionController.treeController.treeView.properties.treeWidth /
            this.userActionController.treeController.tree.getLeaves().length * NODES_HORIZONTAL_STEP_POSITIONING;
          this.userActionController.moveNodeManually(1, 0, horizontalDistance);
          this.distanceMoved = horizontalDistance;
        }
      }
    });
  }
}

