/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {NodeView} from '../View/NodeView';
import {MoveView} from '../View/MoveView';
import {Node} from '../Model/Node';
import {TreeController} from '../Controller/TreeController';

export class LabelInputHandler {
  game: Phaser.Game;
  active: boolean;
  shouldRecalculateOrder: boolean;
  currentlySelected: Phaser.Sprite;
  nodesBFSOrder: Array<Node>;
  leavesDFSOrder: Array<Node>;
  treeController: TreeController;
  fieldX: number;
  fieldY: number;
  selectTextSignal: Phaser.Signal;

  constructor(game: Phaser.Game, treeController: TreeController) {
    this.game = game;
    this.shouldRecalculateOrder = true;
    this.active = false;
    this.nodesBFSOrder = [];
    this.leavesDFSOrder = [];
    this.treeController = treeController;
    this.selectTextSignal = new Phaser.Signal();
    this.treeController.labelInputSignal.add(function () {
        // console.log('clicked');
        let sprite: Phaser.Sprite = arguments[0];
        this.activate(sprite);
      }, this
    );
  }

  activate(sprite) {
    this.active = true;
    this.currentlySelected = sprite;
    this.setLabelCoords();
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.TAB);
    this.selectTextSignal.dispatch();
  }


  show(next: boolean) {
    this.selectTextSignal.dispatch();
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
      }
      else {
        nextIndex = index === 1 ? this.nodesBFSOrder.length - 1 : index - 1;
      }
      // Activate the next move
      this.currentlySelected = this.treeController.treeView.findMoveView(this.nodesBFSOrder[nextIndex].parentMove);
    }
    // If we are currently looking at nodes
    else if (this.currentlySelected instanceof NodeView) {
      // If owner label
      if ((<NodeView>this.currentlySelected).ownerLabel.alpha === 1) {
        let index = this.nodesBFSOrder.indexOf((<NodeView>this.currentlySelected).node);
        let nextIndex = this.calculateNodeLabelIndex(next, index);
        this.currentlySelected = this.treeController.treeView.findNodeView(this.nodesBFSOrder[nextIndex]);
      }
      // If payoffs label
      else {
        const index = this.leavesDFSOrder.indexOf((<NodeView>this.currentlySelected).node);
        let nextIndex;
        if (next) {
          nextIndex = this.leavesDFSOrder.length !== index + 1 ? index + 1 : 0;
        }
        else {
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

  changeLabel(newLabel: string) {
    if (this.active) {
      // If we are looking at moves
      if (this.currentlySelected instanceof MoveView) {
        let moveV = (<MoveView>this.currentlySelected);
        this.treeController.tree.changeMoveLabel(moveV.move, newLabel);
        this.treeController.treeView.moves.forEach(m => {
          m.updateLabel(this.treeController.treeViewProperties.fractionOn);
        });
      }
      // If we are looking at nodes
      else if (this.currentlySelected instanceof NodeView) {
        let nodeV = (<NodeView>this.currentlySelected);
        if (nodeV.ownerLabel.alpha === 1) {
          nodeV.node.player.label = newLabel;
          this.treeController.treeView.nodes.forEach(n => {
            if (n.node.player) {
              n.ownerLabel.setText(n.node.player.label, true);
            }
          });

        }
        else {
          nodeV.node.payoffs.saveFromString(newLabel);
          this.treeController.treeView.nodes.forEach(n => {
            n.resetLabelText(this.treeController.treeViewProperties.zeroSumOn);
          });
        }
      }
      this.show(true);
    }
    this.selectTextSignal.dispatch();
  }

  getLabelValue(): string {
    if (this.currentlySelected instanceof MoveView) {
      return this.currentlySelected.move.label;
    }
    else if (this.currentlySelected instanceof NodeView) {
      let nodeV = (<NodeView>this.currentlySelected);
      if (nodeV.ownerLabel.alpha === 1) {
        return nodeV.ownerLabel.text;
      }
      else if (nodeV.payoffsLabel.alpha === 1) {
        return nodeV.node.payoffs.toString();
      }
    }
  }

  private setLabelCoords() {
    if (this.currentlySelected instanceof MoveView) {
      this.fieldX = this.currentlySelected.label.x;
      this.fieldY = this.currentlySelected.label.y;
    }
    else if (this.currentlySelected instanceof NodeView) {
      let nodeV = (<NodeView>this.currentlySelected);
      if (nodeV.ownerLabel.alpha === 1) {
        this.fieldX = nodeV.ownerLabel.x;
        this.fieldY = nodeV.ownerLabel.y;
      }
      else if (nodeV.payoffsLabel.alpha === 1) {
        this.fieldX = nodeV.payoffsLabel.x;
        this.fieldY = nodeV.payoffsLabel.y + 50;
      }
    }
  }


  hide() {
    this.shouldRecalculateOrder = true;
    this.active = false;
    this.currentlySelected = null;
    this.fieldX = 0;
    this.fieldY = 0;
    this.game.input.keyboard.removeKeyCapture(Phaser.Keyboard.TAB);
  }
}
