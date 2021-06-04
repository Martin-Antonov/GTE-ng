import {Move} from '../../Move';
import {Payoffs} from '../../Payoffs';

export interface INodeCoalitionSolution {
  coalition: string;
  move: Move;
  payoffs: Payoffs;
  isRational?: boolean;
  isBest?: boolean;
  strategy?: string;
}
