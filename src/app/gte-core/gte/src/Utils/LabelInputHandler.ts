import {NodeView} from '../View/NodeView';
import {MoveView} from '../View/MoveView';
import {Node} from '../Model/Node';
import {TreeController} from '../Controller/TreeController';

export class LabelInputHandler {
  scene: Phaser.Scene;
  active: boolean;
  shouldRecalculateOrder: boolean;
  currentlySelected: Phaser.GameObjects.Sprite | NodeView;
  nodesBFSOrder: Array<Node>;
  leavesDFSOrder: Array<Node>;
  treeController: TreeController;
  fieldX: number;
  fieldY: number;
  events: Phaser.Events.EventEmitter;
  tab: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, treeController: TreeController) {
    this.scene = scene;
    this.shouldRecalculateOrder = true;
    this.active = false;
    this.nodesBFSOrder = [];
    this.leavesDFSOrder = [];
    this.treeController = treeController;
    this.events = new Phaser.Events.EventEmitter();
    this.tab = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.tab.enabled = false;
    this.treeController.events.on('label-clicked', (sprite: Phaser.GameObjects.Sprite) => {
      this.activate(sprite);
    });
  }

  activate(sprite) {
    this.active = true;
    this.currentlySelected = sprite;
    this.setLabelCoords();
    this.tab.enabled = true;
    // this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.TAB);
    this.events.emit('select-text');
  }


  show(next: boolean) {
    this.events.emit('select-text');
    if (this.shouldRecalculateOrder) {
      this.nodesBFSOrder = this.treeController.tree.BFSOnTree();
      this.leavesDFSOrder = this.treeController.tree.getLeaves();
    }
    // If we are currently looking at moves
    if (this.currentlySelected instanceof MoveView) {
      const index = this.nodesBFSOrder.indexOf((<MoveView>this.currentlySelected).move.to);

      // Calculate the next index in the BFS order to go to. If the last node, go to the next after the root, i.e. index 1
      let nextIndex;
      if (next) {
        nextIndex = this.nodesBFSOrder.length !== index + 1 ? index + 1 : 1;
      } else {
        nextIndex = index === 1 ? this.nodesBFSOrder.length - 1 : index - 1;
      }
      // Activate the next move
      this.currentlySelected = this.treeController.treeView.findMoveView(this.nodesBFSOrder[nextIndex].parentMove);
      // If we are currently looking at nodes
    } else if (this.currentlySelected instanceof NodeView) {
      // If owner label
      if ((<NodeView>this.currentlySelected).ownerLabel.alpha === 1) {
        const index = this.nodesBFSOrder.indexOf((<NodeView>this.currentlySelected).node);
        const nextIndex = this.calculateNodeLabelIndex(next, index);
        this.currentlySelected = this.treeController.treeView.findNodeView(this.nodesBFSOrder[nextIndex]);
        // If payoffs label
      } else {
        const index = this.leavesDFSOrder.indexOf((<NodeView>this.currentlySelected).node);
        let nextIndex;
        if (next) {
          nextIndex = this.leavesDFSOrder.length !== index + 1 ? index + 1 : 0;
        } else {
          nextIndex = index === 0 ? this.leavesDFSOrder.length - 1 : index - 1;
        }
        this.currentlySelected = this.treeController.treeView.findNodeView(this.leavesDFSOrder[nextIndex]);
      }
    }
    this.setLabelCoords();
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
      // If we want the previous
    } else {
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

  changeLabel(newLabel: string) {
    if (this.active) {
      // If we are looking at moves
      if (this.currentlySelected instanceof MoveView) {
        const moveV = (<MoveView>this.currentlySelected);
        this.treeController.tree.changeMoveLabel(moveV.move, newLabel);
        this.treeController.treeView.moves.forEach((mV: MoveView) => {
          mV.updateLabel(this.treeController.treeView.properties.fractionOn, this.treeController.treeView.properties.levelHeight);
        });
        // If we are looking at nodes
      } else if (this.currentlySelected instanceof NodeView) {
        const nodeV = (<NodeView>this.currentlySelected);
        if (nodeV.ownerLabel.alpha === 1) {
          nodeV.node.player.label = newLabel;
          this.treeController.treeView.nodes.forEach((nV: NodeView) => {
            if (nV.node.player) {
              nV.ownerLabel.setText(nV.node.player.label);
              nV.updateLabelPosition();
            }
          });
        } else {
          nodeV.node.payoffs.saveFromString(newLabel);
          this.treeController.treeView.nodes.forEach((nV: NodeView) => {
            nV.resetNodeDrawing(this.treeController.tree.checkAllNodesLabeled(), this.treeController.treeView.properties.zeroSumOn);
          });
        }
      }
      this.show(true);
    }
    this.events.emit('select-text');
  }

  getLabelValue(): string {
    if (this.currentlySelected instanceof MoveView) {
      const moveV = (<MoveView>this.currentlySelected);
      if (moveV.move.label) {
        let stringToReturn = moveV.move.label;
        if (moveV.move.subscript) {
          stringToReturn += '_' + moveV.move.subscript;
        }
        return stringToReturn;
      } else {
        return moveV.label.text;
      }
    } else if (this.currentlySelected instanceof NodeView) {
      const nodeV = (<NodeView>this.currentlySelected);
      if (nodeV.ownerLabel.alpha === 1) {
        return nodeV.ownerLabel.text;
      } else if (nodeV.payoffsLabel.alpha === 1) {
        return nodeV.node.payoffs.toString();
      }
    }
    return null;
  }

  private setLabelCoords() {
    if (this.currentlySelected instanceof MoveView) {
      this.fieldX = this.currentlySelected.label.x;
      this.fieldY = this.currentlySelected.label.y;
    } else if (this.currentlySelected instanceof NodeView) {
      const nodeV = (<NodeView>this.currentlySelected);
      if (nodeV.ownerLabel.alpha === 1) {
        this.fieldX = nodeV.ownerLabel.x + nodeV.x;
        this.fieldY = nodeV.ownerLabel.y + nodeV.y;
      } else if (nodeV.payoffsLabel.alpha === 1) {
        this.fieldX = nodeV.payoffsLabel.x + nodeV.x;
        this.fieldY = nodeV.payoffsLabel.y + +nodeV.y + 50;
      }
    }
  }


  hide() {
    this.shouldRecalculateOrder = true;
    this.active = false;
    this.currentlySelected = null;
    this.fieldX = 0;
    this.fieldY = 0;
    this.tab.enabled = false;
  }
}
