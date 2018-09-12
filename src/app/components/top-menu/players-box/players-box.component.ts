import {Component, Input, OnInit, Output} from '@angular/core';
import {UserActionController} from '../../../gte-core/gte/src/Controller/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';

@Component({
  selector: 'app-players-box',
  templateUrl: './players-box.component.html',
  styleUrls: ['./players-box.component.scss']
})
export class PlayersBoxComponent implements OnInit {

  userIconPath: string;
  minusIconPath: string;
  plusIconPath: string;

  userActionController: UserActionController;

  constructor(private uac: UserActionControllerService) {
  }

  ngOnInit() {
    this.uac.userActionController.subscribe((value) => {
      this.userActionController = value;
    });

    this.userIconPath = 'assets/images/user.png';
    this.minusIconPath = 'assets/images/minus.png';
    this.plusIconPath = 'assets/images/plus.png';
  }

  isPlusDisabled() {
    return this.userActionController.treeController.tree.players.length === 5;
  }
  isMinusDisabled(){
    return this.userActionController.treeController.tree.players.length === 2;
  }
}
