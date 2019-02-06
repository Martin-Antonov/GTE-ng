/// <reference path="../../../../../../node_modules/@types/mathjs/index.d.ts" />

import {Node} from './Node';
import * as math from 'mathjs';

/**The class Move which has from, to, label and probability */
export class Move {
  from: Node;
  to: Node;
  label: string;
  subscript: string;
  probability: number;
  manuallyAssigned: boolean;
  isBestInductionMove: boolean;

  constructor(from?: Node, to?: Node) {
    this.from = from;
    this.to = to;
    this.label = '';
    this.subscript = '';
    this.manuallyAssigned = false;
    this.isBestInductionMove = false;
  }

  /**Converts the Move to a labeled Move */
  convertToLabeled(label?: string) {
    this.label = label || null;
    this.probability = null;
  }

  /**Converts to a chance move with given probabilities */
  convertToChance(probability?: number) {
    this.probability = probability || 0;
    this.label = null;
  }

  /**Resets the move */
  convertToDefault() {
    this.probability = null;
    this.label = null;
  }

  /**Returns the text of the probability, depending on the current mode*/
  getProbabilityText(fractional?: boolean) {
    if (fractional && this.probability !== 1 && this.probability !== 0) {
      return math.format(math.fraction(this.probability));

    }
    else {
      return math.format(math.round(math.number(this.probability), 2));
    }
  }

  /**Destroy method ensures there are no memory-leaks */
  destroy() {
    this.from.childrenMoves.splice(this.from.childrenMoves.indexOf(this), 1);
    this.label = null;
    this.probability = null;
  }
}

