import {UserActionController} from './UserActionController';
import {NODES_HORIZONTAL_STEP_POSITIONING, NODES_VERTICAL_STEP_POSITIONING} from '../Utils/Constants';

/** A class for controlling the input of the application. If there is a confusion over the functionality of each button
 * you can check the attachHandlersToKeysMethod*/

export class KeyboardController {
  scene: Phaser.Scene;
  // There is a reference to the User , so that whenever a key is pressed we can call the corresponding method
  userActionController: UserActionController;
  shiftKey: Phaser.Input.Keyboard.Key;
  controlKey: Phaser.Input.Keyboard.Key;
  altKey: Phaser.Input.Keyboard.Key;
  nKey: Phaser.Input.Keyboard.Key;
  playersKeys: Array<Phaser.Input.Keyboard.Key>;
  zeroKey: Phaser.Input.Keyboard.Key;
  deleteKey: Phaser.Input.Keyboard.Key;
  dKey: Phaser.Input.Keyboard.Key;
  testButton: Phaser.Input.Keyboard.Key;
  zKey: Phaser.Input.Keyboard.Key;
  iKey: Phaser.Input.Keyboard.Key;
  uKey: Phaser.Input.Keyboard.Key;
  cKey: Phaser.Input.Keyboard.Key;
  sKey: Phaser.Input.Keyboard.Key;
  rKey: Phaser.Input.Keyboard.Key;
  yKey: Phaser.Input.Keyboard.Key;
  lKey: Phaser.Input.Keyboard.Key;
  numPlusKey: Phaser.Input.Keyboard.Key;
  numMinusKey: Phaser.Input.Keyboard.Key;
  tabKey: Phaser.Input.Keyboard.Key;
  enterKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, userActionController: UserActionController) {
    this.scene = scene;
    this.userActionController = userActionController;

    this.playersKeys = [];

    this.addKeys();
    this.attachHandlersToKeys();
  }

  /**Assigning all keys to the corresponding properties in the class*/
  addKeys() {
    this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.controlKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.altKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
    this.nKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.zeroKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO);
    this.iKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.numPlusKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
    this.numMinusKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);
    this.testButton = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.dKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.uKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
    this.cKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.sKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.rKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.yKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    this.lKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.tabKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.enterKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escapeKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.upKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    const keys = [Phaser.Input.Keyboard.KeyCodes.ONE, Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE, Phaser.Input.Keyboard.KeyCodes.FOUR];

    keys.forEach((k: number) => {
      this.playersKeys.push(this.scene.input.keyboard.addKey(k));
    });

    this.deleteKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
    this.scene.input.keyboard.disableGlobalCapture();
  }

  /**A method which assigns action to each key via the UserActionController*/
  attachHandlersToKeys() {
    // Add Children

    this.nKey.on('down', () => {
      if (!this.controlKey.isDown && !this.altKey.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.addNodesHandler();
      }
    });
    this.numPlusKey.on('down', () => {
      if (!this.controlKey.isDown && !this.altKey.isDown) {
        this.userActionController.addNodesHandler();
      }
    });
    // Delete nodes
    this.deleteKey.on('down', () => {
      this.userActionController.deleteNodeHandler();
    });
    this.dKey.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.deleteNodeHandler();
      }
    });
    this.numMinusKey.on('down', () => {
      this.userActionController.deleteNodeHandler();
    });

    // Assigning players
    this.playersKeys.forEach((k: Phaser.Input.Keyboard.Key) => {
      const playerID = this.playersKeys.indexOf(k) + 1;
      k.on('down', () => {
        if (!this.userActionController.labelInput.active) {
          this.userActionController.assignPlayerToNodeHandler(playerID);
        }
      });
    });
    this.zeroKey.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.assignChancePlayerToNodeHandler();
      }
    });

    // Create an information set
    this.iKey.on('down', () => {
      if (!this.controlKey.isDown && !this.altKey.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.createISetHandler();
      }
    });

    // Undo and redo
    this.zKey.on('down', () => {
      if (this.controlKey.isDown && !this.shiftKey.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(true);
      }
      if (this.controlKey.isDown && this.shiftKey.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(false);
      }
    });

    this.uKey.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(true);
      }
    });

    this.rKey.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(false);
      }
    });

    this.yKey.on('down', () => {
      if (this.controlKey.isDown && !this.userActionController.labelInput.active) {
        this.userActionController.undoRedoHandler(false);
      }
    });

    // Remove information set
    this.sKey.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.removeISetsByNodesHandler();
      }
    });

    // Cut information set
    this.cKey.on('down', () => {
      if (!this.userActionController.labelInput.active) {
        this.userActionController.initiateCutSpriteHandler();
      }
    });

    // Change to the next label
    this.tabKey.on('down', () => {
      if (this.shiftKey.isDown) {
        this.userActionController.activateLabelField(false);
      } else {
        // this.userActionController.activateLabelField(true);
      }
    });

    this.lKey.on('down', () => {
      this.userActionController.selectChildren();
    });

    // Exit label
    this.escapeKey.on('down', () => {
      this.userActionController.hideInputLabel();
    });


    // Arrow Keys Moving nodes
    this.upKey.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });

    this.downKey.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });

    this.leftKey.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });

    this.rightKey.on('up', () => {
      this.userActionController.undoRedoController.saveNewTree(true);
    });


    this.upKey.on('down', () => {
      const verticalDistance = this.userActionController.treeController.treeView.properties.levelHeight * NODES_VERTICAL_STEP_POSITIONING;

      if (!this.controlKey.isDown) {
        this.userActionController.moveNodeManually(0, -1, verticalDistance);
      }
    });

    this.downKey.on('down', () => {
      const verticalDistance = this.userActionController.treeController.treeView.properties.levelHeight * NODES_VERTICAL_STEP_POSITIONING;

      if (!this.controlKey.isDown) {
        this.userActionController.moveNodeManually(0, 1, verticalDistance);
      }
    });

    this.leftKey.on('down', () => {
      const horizontalDistance = this.userActionController.treeController.treeView.properties.treeWidth /
        this.userActionController.treeController.tree.getLeaves().length * NODES_HORIZONTAL_STEP_POSITIONING;

      if (!this.controlKey.isDown) {
        this.userActionController.moveNodeManually(-1, 0, horizontalDistance);
      }
    });
    this.rightKey.on('down', () => {
      const horizontalDistance = this.userActionController.treeController.treeView.properties.treeWidth /
        this.userActionController.treeController.tree.getLeaves().length * NODES_HORIZONTAL_STEP_POSITIONING;

      if (!this.controlKey.isDown) {
        this.userActionController.moveNodeManually(1, 0, horizontalDistance);
      }
    });

    // P3: What to do here?


    // this.upKey.onHoldCallback = function () {
    //   if (this.controlKey.isDown && !this.userActionController.labelInput.active) {
    //     this.userActionController.moveNodeManually(0, -1, 1);
    //   }
    // };
    //
    // this.downKey.onHoldCallback = function () {
    //   if (this.controlKey.isDown && !this.userActionController.labelInput.active) {
    //     this.userActionController.moveNodeManually(0, 1, 1);
    //   }
    // };
    //
    // this.leftKey.onHoldCallback = function () {
    //   if (this.controlKey.isDown && !this.userActionController.labelInput.active) {
    //     this.userActionController.moveNodeManually(-1, 0, 1);
    //   }
    // };
    //
    // this.rightKey.onHoldCallback = function () {
    //   if (this.controlKey.isDown && !this.userActionController.labelInput.active) {
    //     this.userActionController.moveNodeManually(1, 0, 1);
    //   }
    // };
    //
    // this.upKey.onHoldContext = this;
    // this.downKey.onHoldContext = this;
    // this.leftKey.onHoldContext = this;
    // this.rightKey.onHoldContext = this;


    this.testButton.on('down', () => {
    });
  }
}

