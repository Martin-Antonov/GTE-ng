import {Component, OnInit} from '@angular/core';
import {UserActionControllerService} from '../../services/user-action-controller/user-action-controller.service';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {
  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService) {
    this.uac.userActionController.subscribe(value => {
      this.userActionController = value;
    });
  }

  ngOnInit() {
  }

  close(){

  }

}
