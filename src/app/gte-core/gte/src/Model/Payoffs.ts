/**The class Payoff which is an array of numbers*/
import {MAX_RANDOM_PAYOFFS} from '../Utils/Constants';
import * as math from 'mathjs';

export class Payoffs {
  outcomes: Array<number>;
  private playersCount: number;

  constructor(payoffs?: Array<number>) {
    this.playersCount = 2;

    if (payoffs) {
      this.outcomes = payoffs.slice(0);
    }
    else {
      this.outcomes = [0, 0, 0, 0];
    }
  }

  /**A method converting text payoffs from the input field, and placing them to the corresponding leaves*/
  saveFromString(payoffs: string) {
    let payoffsAsStringArray = payoffs.split(' ');
    for (let i = 0; i < payoffsAsStringArray.length; i++) {
      if (i > 3) {
        return;
      }
      let currentPayoff = parseFloat(payoffsAsStringArray[i]);
      if (currentPayoff) {
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
    if (this.playersCount === 2) {
      this.outcomes[1] = -this.outcomes[0];
    }
  }

  /**A helper method for the functionality of the strategic form*/
  add(payoffsToAdd: Array<number>) {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] += payoffsToAdd[i];
    }
  }

  /**A helper method for the visual representation of outcomes. Uses an external library mathjs.*/
  round() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] = parseFloat(math.format(math.round(this.outcomes[i], 2)));
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

  destroy() {
    this.outcomes = null;
  }
}

