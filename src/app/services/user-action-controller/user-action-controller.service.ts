import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserActionController} from '../../gte-core/gte/src/Controller/Main/UserActionController';

@Injectable({
  providedIn: 'root'
})
export class UserActionControllerService {
  userActionController = new BehaviorSubject<UserActionController>(null);

  constructor() {
  }

  setUAC(userActionController: UserActionController) {
    this.userActionController.next(userActionController);
  }
}
