import {Component, OnInit} from '@angular/core';
import {UserActionControllerService} from '../../services/user-action-controller.service';
import {UserActionController} from '../../gte-core/gte/src/Controller/UserActionController';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  userActionController: UserActionController;
  logoSrc: string;

  constructor(private uac: UserActionControllerService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });
    this.logoSrc = 'assets/images/logo.png';
  }

  someFunction() {

  }


}
