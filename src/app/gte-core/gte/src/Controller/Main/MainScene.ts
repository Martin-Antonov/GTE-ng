import {TreeController} from './TreeController';
import {UserActionController} from './UserActionController';
import {KeyboardController} from '../Keyboard/KeyboardController';
import {UserActionControllerService} from '../../../../../services/user-action-controller/user-action-controller.service';
import {TreesFileService} from '../../../../../services/trees-file/trees-file.service';
import {InitialBitmapsCreator} from '../../Utils/InitialBitmapsCreator';


/**A class for the main part of the software. This is the starting point of the core software*/
export class MainScene extends Phaser.Scene {
  // The Tree Controller handles everything related to the tree
  treeController: TreeController;
  // User Action Controller handles actions from the user. These actions will be called whenever a keyboard key
  // or a button is pressed. Abstracts the logic of user actions and removes unnecessary code repetition.
  userActionController: UserActionController;
  // The Keyboard Controller handles input and sends signals and executes methods from the User Action Controller
  keyboardController: KeyboardController;

  uac: UserActionControllerService;
  tfs: TreesFileService;

  constructor() {
    super('main');
  }

  init(obj: {uac, tfs}) {
    this.uac = obj.uac;
    this.tfs = obj.tfs;
  }

  preload() {
    this.load.image('scissors', 'assets/images/Scissors.png');
  }

  /** The create method is built-into the engine for every state. It acts as a constructor.*/
  create() {
    const bmdCreator = new InitialBitmapsCreator(this);
    this.treeController = new TreeController(this);
    this.userActionController = new UserActionController(this, this.treeController);
    this.keyboardController = new KeyboardController(this, this.userActionController);
    this.onWindowResize();


    this.uac.setUAC(this.userActionController);
    this.tfs.initiateFirstTree();
    // DUNNO
    // this.game.input.mspointer.capture = false;
  }

  onWindowResize() {
    window.onresize = () => {
      this.userActionController.gameResize();
    };
  }

  /** The update method is built-into the engine for every state. It executes at most 60 times a second*/
  update() {
    this.userActionController.update();
  }

  /** This is used for testing purposes - displays a text 60 times a second in the app*/
  render() {

  }
}

