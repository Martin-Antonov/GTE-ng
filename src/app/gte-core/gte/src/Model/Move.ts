import {Node} from './Node';
import Fraction from 'fraction.js/fraction';

/**The class Move which has from, to, label and probability */
export class Move {
  from: Node;
  to: Node;
  label: string;
  subscript: string;
  probability: Fraction;
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

    if (this.label) {
      this.manuallyAssigned = true;
    }
  }

  /**Converts to a chance move with given probabilities */
  convertToChance(probability?: number) {
    this.probability = new Fraction(probability || 0);
    this.label = null;
  }

  /**Resets the move */
  convertToDefault() {
    this.probability = null;
    this.label = null;
  }

  /**Returns the text of the probability, depending on the current mode*/
  getProbabilityText(fractional?: boolean) {
    const probAsDecimal = this.probability.valueOf();
    if (fractional && probAsDecimal !== 1 && probAsDecimal !== 0) {
      return this.probability.toFraction();
    } else {
      let result = (Math.round(this.probability.valueOf() * 100) / 100).toString();
      if (result.length !== 1) {
        result = result.substr(1);
      }
      return result;
    }
  }

  /**Destroy method ensures there are no memory-leaks */
  destroy() {
    this.from.childrenMoves.splice(this.from.childrenMoves.indexOf(this), 1);
    this.label = null;
    this.probability = null;
  }
}

