import {BackwardInduction} from './BackwardInduction';
import {BackwardForwardInduction} from './BFI/BackwardForwardInduction';

export class TreeAlgorithms {
  backwardInduction: BackwardInduction;
  backwardForwardInduction: BackwardForwardInduction;

  constructor() {
    this.backwardInduction = new BackwardInduction();
    this.backwardForwardInduction = new BackwardForwardInduction();
  }
}
