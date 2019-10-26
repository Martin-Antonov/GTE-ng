import {NodeView} from '../View/NodeView';
import {NodeType} from '../Model/Node';
import {MoveView} from '../View/MoveView';
import {ISetView} from '../View/ISetView';
import * as SVG from 'svg.js';
import {ISET_LINE_WIDTH, LINE_WIDTH} from './Constants';
import {TreeController} from '../Controller/TreeController';
export class ViewExporter {
  treeController: TreeController;

  constructor(treeController: TreeController) {
    this.treeController = treeController;
  }

  toFig() {
    const factor = 15;
    const playerLabels = [];
    const chanceLabels = [];
    const moveLabels = [];
    const subscriptLabels = [];
    const payoffsLabels = [];

    let result = '';
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
    this.treeController.treeView.nodes.forEach((nV: NodeView) => {
      if (nV.node.type !== NodeType.LEAF && nV.node.type !== NodeType.CHANCE) {
        // Calculate color from player based on the colour codes.
        const playerIndex = this.treeController.treeView.tree.players.indexOf(nV.node.player);
        const color = this.getColorFromPlayerIndex(playerIndex);
        // ellipse, type circle, line type, line width, pen color, fill color
        const pre = '1 3 0 0 ' + color + ' ' + color + ' ';
        // depth
        const depth = 10 + playerIndex + ' ';
        // other styles
        const post = '0 20 0.000 1 0.0000 ';
        const coords = Math.round(nV.x * factor) + ' ' + Math.round(nV.y * factor) + ' ';
        const dimensions = Math.round((nV.displayWidth * 0.65 / 2) * factor) + ' ' + Math.round((nV.displayWidth * 0.65 / 2) * factor) + ' ';
        result += pre + depth + post + coords + dimensions + coords + coords + '\n';

        if (playerIndex > 0 && nV.node.iSet === null) {
          playerLabels.push({
            text: nV.ownerLabel.text,
            color: color,
            x: nV.ownerLabel.x,
            y: nV.y + nV.ownerLabel.displayHeight * 0.2,
            index: playerIndex,
            justify: nV.labelHorizontalOffset === 1 ? 0 : 2,
          });
        }
      } else if (nV.node.type === NodeType.CHANCE) {
        const pre = '2 2 0 0 0 0 10 -1 20 0.000 0 0 -1 0 0 5 ';
        const centerX = Math.round(nV.x * factor);
        const centerY = Math.round(nV.y * factor);
        const halfWidth = Math.round(nV.displayWidth * factor * 0.7 / 2);
        const topLeft = (centerX - halfWidth) + ' ' + (centerY - halfWidth) + ' ';
        const topRight = (centerX + halfWidth) + ' ' + (centerY - halfWidth) + ' ';
        const bottomLeft = (centerX - halfWidth) + ' ' + (centerY + halfWidth) + ' ';
        const bottomRight = (centerX + halfWidth) + ' ' + (centerY + halfWidth) + ' ';
        result += pre + '\n' + topLeft + topRight + bottomRight + bottomLeft + topLeft + '\n';

        chanceLabels.push({
          text: nV.ownerLabel.text,
          color: 0,
          x: nV.ownerLabel.x,
          y: nV.y + nV.ownerLabel.displayHeight * 0.2,
          index: 0,
          justify: nV.labelHorizontalOffset === 1 ? 0 : 2,
        });
        return;
      } else if (nV.node.type === NodeType.LEAF) {
        let maxNumberOfDigits = 0;
        const outcomes = nV.node.payoffs.outcomes;
        outcomes.splice(this.treeController.treeView.tree.players.length - 1, 10);
        outcomes.forEach((payoff: number) => {
          const numberOfDigits = this.getDigitLength(payoff);
          if (maxNumberOfDigits < numberOfDigits) {
            maxNumberOfDigits = numberOfDigits;
          }
        });
        const halfWidthToRightFactor = maxNumberOfDigits === 1 ? 2 : 1;

        for (let i = 0; i < outcomes.length; i++) {
          // 195 is half width to the right
          const x = Math.round((nV.payoffsLabel.x) * factor + 195 / halfWidthToRightFactor);
          // 440 is label height in FIG
          const y = Math.round(nV.payoffsLabel.y * factor) + (i + 1) * 440;
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

    result += '#moves\n';
    // Moves
    this.treeController.treeView.moves.forEach((mV: MoveView) => {
      // line, polyline, line style, thickness, pen color, fill color
      const pre = '2 1 0 4 0 0 ';
      const playerIndex = this.treeController.treeView.tree.players.indexOf(mV.from.node.player);
      const depth = (60 + playerIndex) + ' ';
      const post = '0 -1 5.000 0 0 -1 0 0 2 ';
      const coordsFrom = '\n' + Math.round(mV.from.x * factor) + ' ' + Math.round(mV.from.y * factor) + ' ';
      const coordsTo = Math.round(mV.to.x * factor) + ' ' + Math.round(mV.to.y * factor) + ' ';
      result += pre + depth + post + coordsFrom + coordsTo + '\n';

      if (playerIndex >= 0) {
        moveLabels.push({
          text: mV.label.text,
          color: this.getColorFromPlayerIndex(playerIndex),
          x: mV.label.x,
          y: mV.label.y,
          index: playerIndex
        });

        if (mV.move.subscript) {
          subscriptLabels.push({
            text: mV.subscript.text,
            color: this.getColorFromPlayerIndex(playerIndex),
            x: mV.subscript.x + mV.subscript.displayWidth / 2,
            y: mV.subscript.y - mV.subscript.displayHeight * 0.25,
            index: playerIndex
          });
        }
      }
    });

    result += '#isets\n';
    this.treeController.treeView.iSets.forEach((iSetV: ISetView) => {
      const firstNode = iSetV.nodes[0];
      const lastNode = iSetV.nodes[iSetV.nodes.length - 1];
      const playerIndex = this.treeController.treeView.tree.players.indexOf(iSetV.iSet.player);
      const color = this.getColorFromPlayerIndex(playerIndex);
      // line, type polyline, default style and thickness. first line is white
      const pre1 = '2 1 0 35 ' + 7 + ' ' + 7 + ' ';
      // Second line is with the player color and higher depth
      const pre2 = '2 1 0 38 ' + color + ' ' + color + ' ';
      const depth1 = 120 + playerIndex + ' ';
      const depth2 = 121 + playerIndex + ' ';
      const post = '-1 -1 0.000 1 1 -1 0 0 2\n';
      const leftNodeX = Math.round(firstNode.x * factor) + ' ';
      const leftNodeY = Math.round(firstNode.y * factor) + ' ';
      const rightNodeX = Math.round(lastNode.x * factor) + ' ';
      const rightNodeY = Math.round(lastNode.y * factor) + ' ';

      result += pre1 + depth1 + post + leftNodeX + leftNodeY + rightNodeX + rightNodeY + '\n';
      result += pre2 + depth2 + post + leftNodeX + leftNodeY + rightNodeX + rightNodeY + '\n';

      playerLabels.push({
        text: iSetV.label.text,
        color: color,
        x: iSetV.label.x,
        y: iSetV.label.y + iSetV.label.displayHeight * 4 / factor,
        index: playerIndex,
        justify: 1
      });
    });

    result += '#labels\n';
    playerLabels.forEach((label: { text, color, x, y, index, justify }) => {
      // type text, justification, color, depth, pen style, font, font size, angle, font flags, coords text
      const pre = '4 ' + label.justify + ' ' + label.color + ' ' + (label.index + 40) + ' 0 2 30 0.0000 4 540 390 ' +
        Math.round(label.x * factor) + ' ' + Math.round(label.y * factor) + ' ' + label.text + '\\001';
      result += pre + '\n';
    });
    chanceLabels.forEach((label: { text, color, x, y, index, justify }) => {
      // type text, justification, color, depth, pen style, font, font size, angle, font flags, coords text
      const pre = '4 ' + label.justify + ' ' + label.color + ' ' + (label.index + 40) + ' 0 0 30 0.0000 4 540 390 ' +
        Math.round(label.x * factor) + ' ' + Math.round(label.y * factor) + ' ' + label.text + '\\001';
      result += pre + '\n';
    });

    moveLabels.forEach((label: { text, color, x, y, index }) => {
      const font = label.index === 0 ? 0 : 1;
      // type text, justification, color, depth, pen style, font, font size, angle, font flags, coords text
      const pre = '4 1 ' + label.color + ' ' + (label.index + 30) + ' 0 ' + font + ' 28 0.0000 4 540 390 ' +
        Math.round(label.x * factor) + ' ' + Math.round(label.y * factor) + ' ' + label.text + '\\001';
      result += pre + '\n';
    });

    subscriptLabels.forEach((label: { text, color, x, y, index }) => {
      const font = label.index === 0 ? 0 : 1;
      // type text, justification, color, depth, pen style, font, font size, angle, font flags, coords text
      const pre = '4 1 ' + label.color + ' ' + (label.index + 30) + ' 0 ' + font + ' 16 0.0000 4 540 390 ' +
        Math.round(label.x * factor) + ' ' + Math.round(label.y * factor) + ' ' + label.text + '\\001';
      result += pre + '\n';
    });

    payoffsLabels.forEach((label: { text, color, x, y, index, length }) => {
      const pre = '4 2 ' + label.color + ' ' + (label.index + 50) + ' 0 0 24 0.0000 4 540 ' + label.length + ' ' +
        label.x + ' ' + label.y + ' ' + label.text + '\\001';
      result += pre + '\n';
    });

    return result;
    // console.log(result);
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
        // blue
        color = '1';
        break;
      case 3:
        // green
        color = '13';
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

  toSVG() {
  //   const draw = SVG('svg-export').size(this.treeController.treeView.scene.sys.canvas.width, this.treeController.treeView.scene.sys.height);
  //   this.treeController.treeView.nodes.forEach((nV: NodeView) => {
  //     if (nV.node.type !== NodeType.LEAF && nV.node.type !== NodeType.CHANCE) {
  //       draw.circle(nV.width).attr({fill: Phaser.Color.getWebRGB(nV.tint), 'stroke-width': 0}).center(nV.x, nV.y);
  //       if (nV.node.iSet === null) {
  //         draw.text(nV.ownerLabel.text).move(nV.ownerLabel.x, nV.ownerLabel.y - nV.ownerLabel.height * 0.75).fill(nV.ownerLabel.color)
  //           .font({
  //             anchor: nV.labelHorizontalOffset === -1 ? 'end' : 'start',
  //             size: nV.ownerLabel.fontSize,
  //             weight: 'bold'
  //           });
  //       }
  //     }
  //     else if (nV.node.type === NodeType.CHANCE) {
  //       draw.rect(nV.square.width, nV.square.height).center(nV.x, nV.y);
  //       draw.text(nV.ownerLabel.text).move(nV.ownerLabel.x, nV.ownerLabel.y - nV.ownerLabel.height * 0.75)
  //         .font({
  //           anchor: nV.labelHorizontalOffset === -1 ? 'end' : 'start',
  //           size: (<number>nV.ownerLabel.fontSize * nV.ownerLabel.scale.x),
  //           weight: 'bold'
  //         });
  //
  //     }
  //     else if (nV.node.type === NodeType.LEAF) {
  //       draw.text((add) => {
  //         const payoffsShown = nV.payoffsLabel.text.split('\n');
  //         for (const i = 0; i < payoffsShown.length; i++) {
  //           const payoff = payoffsShown[i];
  //           add.tspan(payoff).fill(Phaser.Color.getWebRGB(this.treeController.treeView.tree.players[i + 1].color)).newLine();
  //         }
  //       }).move(nV.payoffsLabel.x + nV.payoffsLabel.width / 2, nV.payoffsLabel.y).font({
  //         anchor: 'end',
  //         size: nV.payoffsLabel.fontSize,
  //       }).leading(1);
  //     }
  //   });
  //
  //   this.treeController.treeView.moves.forEach((mV: MoveView) => {
  //     draw.line(mV.from.x, mV.from.y, mV.to.x, mV.to.y).attr({
  //       stroke: '#000',
  //       'stroke-width': Math.round(this.treeController.treeView.game.height * LINE_WIDTH)
  //     }).back();
  //     draw.text(mV.label.text).move(mV.label.x - mV.label.width / 2, mV.label.y - mV.label.height).fill(mV.label.fill)
  //       .font({
  //         weight: '200',
  //         style: mV.from.node.player.id !== 0 ? 'italic' : 'none',
  //         size: mV.label.fontSize
  //       });
  //     if (mV.move.subscript) {
  //       draw.text(mV.subscript.text).move(mV.subscript.x, mV.subscript.y - mV.subscript.height)
  //         .fill(mV.subscript.fill)
  //         .font({
  //           weight: '200',
  //           size: mV.subscript.fontSize
  //         });
  //     }
  //   });
  //
  //   this.treeController.treeView.iSets.forEach((iSetV: ISetView) => {
  //     const pointCoords = [];
  //     iSetV.nodes.forEach((nV: NodeView) => {
  //       pointCoords.push(nV.x);
  //       pointCoords.push(nV.y);
  //     });
  //
  //     console.log('points-length: ' + pointCoords.length);
  //
  //     draw.polyline(pointCoords).attr({
  //       stroke: Phaser.Color.getWebRGB(iSetV.tint),
  //       opacity: 0.15,
  //       'stroke-width': this.treeController.treeView.game.height * ISET_LINE_WIDTH,
  //       'stroke-linecap': 'round',
  //       'stroke-linejoin': 'round'
  //     }).fill('none');
  //
  //     draw.text(iSetV.label.text).move(iSetV.label.x - iSetV.label.width / 2, iSetV.label.y - iSetV.label.height * 0.7)
  //       .fill(iSetV.label.fill)
  //       .font({
  //         // anchor: 'middle',
  //         weight: 'bold',
  //         size: iSetV.label.fontSize
  //       });
  //   });
  //
  //   return draw.svg();
  }
}
