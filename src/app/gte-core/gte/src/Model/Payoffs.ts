/**The class Payoff which is an array of numbers*/
import {MAX_RANDOM_PAYOFFS} from '../Utils/Constants';
import Fraction from 'fraction.js/fraction';

export class Payoffs {
  outcomes: Array<Fraction>;
  outcomesAsDecimals: Array<any>;
  isBestResponce: Array<boolean>;
  private playersCount: number;

  constructor(payoffs?: Array<Fraction>) {
    this.playersCount = 2;
    this.outcomes = [];
    if (payoffs) {
      payoffs.forEach((payoff: Fraction) => {
        this.outcomes.push(new Fraction(payoff.n, payoff.d));
      });
    } else {
      this.reset();
    }
    this.outcomesAsDecimals = [];
    this.isBestResponce = [false, false, false, false];
  }

  /**A method converting text payoffs from the input field, and placing them to the corresponding leaves*/
  saveFromString(payoffs: string) {
    const payoffsAsStringArray = payoffs.split(' ');
    for (let i = 0; i < payoffsAsStringArray.length; i++) {
      if (i > 3) {
        return;
      }
      this.outcomes[i] = new Fraction(payoffsAsStringArray[i]);
    }
  }

  /**A method for setting random payoffs to leaves*/
  setRandomPayoffs() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] = new Fraction(Math.floor(Math.random() * MAX_RANDOM_PAYOFFS));
    }
  }

  /**A method for changing the number of players in the game*/
  setPlayersCount(playersCount: number) {
    this.playersCount = playersCount;
  }

  /**A method for converting the game into a zero-sum game*/
  convertToZeroSum() {
    let sum = new Fraction(0);
    for (let i = 0; i < this.playersCount - 1; i++) {
      sum = sum.add(this.outcomes[i]);
    }
    this.outcomes[this.playersCount - 1] = sum.mul(-1);
  }

  /**A helper method for the functionality of the strategic form*/
  add(payoffsToAdd: Array<Fraction>) {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i] = this.outcomes[i].add(payoffsToAdd[i]);
    }
  }

  multiply(number: Fraction) {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomes[i].mul(number);
    }
  }

  reset() {
    for (let i = 0; i < 4; i++) {
      this.outcomes.push(new Fraction(0));
    }
  }

  /**A helper method for the visual representation of outcomes.*/
  round() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomesAsDecimals[i] = Math.round(this.outcomes[i].valueOf() * 100) / 100;
    }
  }

  /**A helper method for the visual representation of outcomes*/
  setOutcomes() {
    for (let i = 0; i < this.outcomes.length; i++) {
      this.outcomesAsDecimals[i] = Math.round(this.outcomes[i].valueOf() * 100) / 100;
    }
  }

  /**A method for printing and visualizing payoffs*/
  toString() {
    const numbersToShow = [];
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

