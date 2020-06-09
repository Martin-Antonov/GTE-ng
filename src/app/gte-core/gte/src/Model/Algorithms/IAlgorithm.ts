import {Tree} from '../Tree';

export interface IAlgorithm {
  execute(tree: Tree, ...args): any;
}
