/// <reference path="../../../../../../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {TreeView} from '../View/TreeView';
import {NodeView} from '../View/NodeView';
import {NodeType} from '../Model/Node';
import {MoveView} from '../View/MoveView';
import {ISetView} from '../View/ISetView';

export class ViewExporter {
  treeView: TreeView;

  constructor(treeView: TreeView) {
    this.treeView = treeView;
  }

  toFig() {
    let factor = 15;
    let result = '';
    let playerLabels = [];
    let moveLabels = [];
    let payoffsLabels = [];
    let iSetLabels = [];
    result += '#FIG 3.2  Produced by Game Theory Explorer\n' +
      'Landscape\n' +
      'Center\n' +
      'Metric\n' +
      'A4\n' +
      '100.00\n' +
      'Single\n' +
      '0\n' +
      '1200 2\n' +
      '#nodes\n';
    // Nodes first
    this.treeView.nodes.forEach((nV: NodeView) => {
      if (nV.node.type !== NodeType.LEAF && nV.node.type !== NodeType.CHANCE) {
        // Calculate color from player based on the colour codes.
        let playerIndex = this.treeView.tree.players.indexOf(nV.node.player);
        let color = this.getColorFromPlayerIndex(playerIndex);
        // ellipse, type circle, line type, line width, pen color, fill color
        let pre = '1 3 0 0 ' + color + ' ' + color + ' ';
        // depth
        let depth = 10 + playerIndex + ' ';
        // other styles
        let post = '0 20 0.000 1 0.0000 ';
        let coords = Math.round(nV.world.x * factor) + ' ' + Math.round(nV.world.y * factor) + ' ';
        let dimensions = Math.round((nV.circle.width / 2) * factor) + ' ' + Math.round((nV.circle.width / 2) * factor) + ' ';
        result += pre + depth + post + coords + dimensions + coords + coords + '\n';

        if (playerIndex > 0 && nV.node.iSet === null) {
          playerLabels.push({text: nV.ownerLabel.text, color: color, x: nV.ownerLabel.x, y: nV.ownerLabel.y, index: playerIndex});
        }
      }
      else if (nV.node.type === NodeType.CHANCE) {
        let pre = '2 2 0 0 0 0 10 -1 20 0.000 0 0 -1 0 0 5 ';
        let centerX = Math.round(nV.square.x * factor);
        let centerY = Math.round(nV.square.y * factor);
        let halfWidth = Math.round(nV.square.width * factor / 2);
        let topLeft = (centerX - halfWidth) + ' ' + (centerY - halfWidth) + ' ';
        let topRight = (centerX + halfWidth) + ' ' + (centerY - halfWidth) + ' ';
        let bottomLeft = (centerX - halfWidth) + ' ' + (centerY + halfWidth) + ' ';
        let bottomRight = (centerX + halfWidth) + ' ' + (centerY + halfWidth) + ' ';
        result += pre + '\n' + topLeft + topRight + bottomRight + bottomLeft + topLeft + '\n';
        return;
      }
      else if (nV.node.type === NodeType.LEAF) {
        let maxNumberOfDigits = 0;
        let outcomes = nV.node.payoffs.outcomes;
        outcomes.splice(this.treeView.tree.players.length - 1, 10);
        outcomes.forEach((payoff: number) => {
          let numberOfDigits = this.getDigitLength(payoff);
          if (maxNumberOfDigits < numberOfDigits) {
            maxNumberOfDigits = numberOfDigits;
          }
        });

        for (let i = 0; i < outcomes.length; i++) {
          // 195 is half width to the right
          let x = Math.round((nV.payoffsLabel.x) * factor + 195);
          // 440 is label height in FIG
          let y = Math.round(nV.payoffsLabel.y * factor) + (i + 1) * 440;
          payoffsLabels.push({
            text: outcomes[i],
            color: this.getColorFromPlayerIndex(i + 1),
            x: x,
            y: y,
            index: i + 1,
            // 390 is the length of a single digit
            length: maxNumberOfDigits * 390,
          });
        }
      }
    });

    result += 'moves\n';
    // Moves
    this.treeView.moves.forEach((mV: MoveView) => {
      // line, polyline, line style, thickness, pen color, fill color
      let pre = '2 1 0 3 0 0 ';
      let playerIndex = this.treeView.tree.players.indexOf(mV.from.node.player);
      let depth = (60 + playerIndex) + ' ';
      let post = '0 -1 5.000 0 0 -1 0 0 2 ';
      let coordsFrom = '\n' + Math.round(mV.from.x * factor) + ' ' + Math.round(mV.from.y * factor) + ' ';
      let coordsTo = Math.round(mV.to.x * factor) + ' ' + Math.round(mV.to.y * factor) + ' ';
      result += pre + depth + post + coordsFrom + coordsTo + '\n';

      if (playerIndex >= 0) {
        moveLabels.push({
          text: mV.label.text,
          color: this.getColorFromPlayerIndex(playerIndex),
          x: mV.label.x,
          y: mV.label.y,
          index: playerIndex
        });
      }
    });

    result += 'isets\n';

    this.treeView.iSets.forEach((iSetV: ISetView) => {
      let firstNode = iSetV.nodes[0];
      let lastNode = iSetV.nodes[iSetV.nodes.length - 1];
      let playerIndex = this.treeView.tree.players.indexOf(iSetV.iSet.player);
      let color = this.getColorFromPlayerIndex(playerIndex);
      // line, type arc-box, default style and thickness
      let pre = '2 4 0 3 ' + color + ' ' + color + ' ';
      let depth = 20 + playerIndex + ' ';
      let post = '-1 -1 0.000 0 0 27 0 0 5\n';
      let leftNodeX = Math.round(firstNode.x * factor);
      let leftNodeY = Math.round(firstNode.y * factor);
      let rightNodeX = Math.round(lastNode.x * factor);
      let rightNodeY = Math.round(lastNode.y * factor);
      let offset = Math.round(iSetV.nodes[0].width * factor / 3);
      let topLeft = (leftNodeX - offset) + ' ' + (leftNodeY - offset) + ' ';
      let topRight = (rightNodeX + offset) + ' ' + (rightNodeY - offset) + ' ';
      let bottomLeft = (leftNodeX - offset) + ' ' + (leftNodeY + offset) + ' ';
      let bottomRight = (rightNodeX + offset) + ' ' + (rightNodeY + offset) + ' ';

      result += pre + depth + post + topLeft + topRight + bottomRight + bottomLeft + topLeft + '\n';

      playerLabels.push({
        text: iSetV.label.text,
        color: color,
        x: iSetV.label.x,
        y: iSetV.label.y + iSetV.label.height * 4 / factor,
        index: playerIndex
      });
    });

    result += 'labels';
    playerLabels.forEach((label: { text, color, x, y, index }) => {
      // type text, justification, color, depth, pen style, font, font size, angle, font flags, coords text
      let pre = '4 1 ' + label.color + ' ' + (label.index + 40) + ' 0 2 30 0.0000 4 540 390 ' +
        Math.round(label.x * factor) + ' ' + Math.round(label.y * factor) + ' ' + label.text + '\\001';
      result += pre + '\n';
    });
    moveLabels.forEach((label: { text, color, x, y, index }) => {
      let font = label.index === 0 ? 0 : 1;
      // type text, justification, color, depth, pen style, font, font size, angle, font flags, coords text
      let pre = '4 1 ' + label.color + ' ' + (label.index + 30) + ' 0 ' + font + ' 28 0.0000 4 540 390 ' +
        Math.round(label.x * factor) + ' ' + Math.round(label.y * factor) + ' ' + label.text + '\\001';
      result += pre + '\n';
    });

    payoffsLabels.forEach((label: { text, color, x, y, index, length }) => {
      let pre = '4 2 ' + label.color + ' ' + (label.index + 50) + ' 0 0 24 0.0000 4 540 ' + label.length + ' ' +
        label.x + ' ' + label.y + ' ' + label.text + '\\001';
      result += pre + '\n';
    });

    console.log(result);
  }

  private getDigitLength(number: number) {
    return String(number).replace('.', '').length;
  }

  private getColorFromPlayerIndex(playerIndex: number) {
    let color;
    switch (playerIndex) {
      case 1:
        // red
        color = '4';
        break;
      case 2:
        // green
        color = '1';
        break;
      case 3:
        // blue
        color = '2';
        break;
      case 4:
        // magenta
        color = '5';
        break;
      default:
        // black if not owned (i.e. default state)
        color = '0';
        break;
    }
    return color;
  }
}