import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';


@Injectable({
  providedIn: 'root'
})
export class UserActionControllerService {
  private _userActionController = new BehaviorSubject<UserActionController>(null);
  userActionController = this._userActionController.asObservable();

  constructor() {
  }

  setUAC(userActionController: UserActionController) {
    this._userActionController.next(userActionController);
  }
}
