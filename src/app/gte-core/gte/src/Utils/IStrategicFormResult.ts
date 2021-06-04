import {Move} from '../Model/Move';
import {Payoffs} from '../Model/Payoffs';

export interface IStrategicFormResult {
  p1rows: Array<string>;
  p2cols: Array<string>;
  p3rows: Array<string>;
  p4cols: Array<string>;

  p1Strategies: Array<Array<Move>>;
  p2Strategies: Array<Array<Move>>;
  p3Strategies: Array<Array<Move>>;
  p4Strategies: Array<Array<Move>>;

  payoffsMatrix: Array<Array<Array<Array<Payoffs>>>>;
}
