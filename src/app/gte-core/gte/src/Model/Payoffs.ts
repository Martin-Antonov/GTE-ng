/**The class Payoff which is an array of numbers*/
import {MAX_RANDOM_PAYOFFS} from '../Utils/Constants';
import * as math from 'mathjs';

export class Payoffs {
  outcomes: Array<number>;
  outcomesAsFractions: Array<any>;
  outcomesAsDecimals: Array<any>;
  isBestResponce: Array<boolean>;
  private playersCount: number;

  constructor(payoffs?: Array<number>) {
    this.playersCount = 2;

    if (payoffs) {
      this.outcomes = payoffs.slice(0);
    }
    else {
      this.outcomes = [0, 0, 0, 0];
    }
    this.outcomesAsFractions = [];
    this.outcomesAsDecimals = [];
    this.isBestResponce = [false, false, false, false];
  }

  /**A method converting text payoffs from the input field, and placing them to the corresponding leaves*/
  saveFromString(payoffs: string) {
    let payoffsAsStringArray = payoffs.split(' ');
    for (let i = 0; i < payoffsAsStringArray.length; i++) {
      if (i > 3) {
        return;
      }
      let currentPayoff = parseFloat(payoffsAsStringArray[i]);
      if (currentPayoff === 0 || currentPayoff) {
        this.outcomes[i] = currentPayoff;
      }
    }
  }

  /**A method for setting random payoffs to leaves*/
  setRandomPayoffs() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] = Math.floor(Math.random() * MAX_RANDOM_PAYOFFS);
    }
  }

  /**A method for changing the number of players in the game*/
  setPlayersCount(playersCount: number) {
    this.playersCount = playersCount;
  }

  /**A method for converting the game into a zero-sum game*/
  convertToZeroSum() {
    let sum = 0;
    for (let i = 0; i < this.playersCount - 1; i++) {
      sum += this.outcomes[i];
    }
    this.outcomes[this.playersCount - 1] = -sum;
  }

  /**A helper method for the functionality of the strategic form*/
  add(payoffsToAdd: Array<number>) {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] += payoffsToAdd[i];
    }
  }

  multiply(number: number) {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] *= number;
    }
  }

  /**A helper method for the visual representation of outcomes. Uses an external library mathjs.*/
  round() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] = parseFloat(math.format(math.round(this.outcomes[i], 2)));
    }
  }

  /**A helper method for the visual representation of outcomes. Uses an external library mathjs.*/
  setOutcomes() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomesAsFractions[i] = math.fraction(this.outcomes[i]);
      this.outcomesAsDecimals[i] = math.round(this.outcomes[i], 2);
    }
  }

  /**A method for printing and visualizing payoffs*/
  toString() {
    let numbersToShow = [];
    for (let i = 0; i < this.playersCount; i++) {
      numbersToShow.push(this.outcomes[i]);
    }
    return numbersToShow.join(' ');
  }

  /**A method which returns true if all responses are best responses*/
  isEquilibrium() {
    return this.isBestResponce[0] && this.isBestResponce[1] && this.isBestResponce[2] && this.isBestResponce[3];
  }

  destroy() {
    this.outcomes = null;
  }
}

