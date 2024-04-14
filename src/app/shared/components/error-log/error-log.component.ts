import {Component, OnInit} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {UserActionController} from '../../../gte-core/gte/src/Controller/Main/UserActionController';
import {UserActionControllerService} from '../../../services/user-action-controller/user-action-controller.service';

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  styleUrls: ['./error-log.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        top: '60px',
        opacity: '1'
      })),
      state('closed', style({
        top: '-80px',
        opacity: '0'
      })),
      transition('open => closed', [
        animate('0.1s')
      ]),
      transition('closed => open', [
        animate('0.2s')
      ])
    ])
  ]
})

export class ErrorLogComponent implements OnInit {
  userActionController: UserActionController;
  error: string;
  shouldShowError: boolean;
  errorTriangleURL: string;

  constructor(private uac: UserActionControllerService) {
    this.uac.userActionController.subscribe(value => {
      this.userActionController = value;
      if (value) {
        this.userActionController.events.on(('show-error'), (err) => {
          this.showError(err);
        });
      }
    });
  }

  ngOnInit() {
    this.shouldShowError = false;
    this.errorTriangleURL = 'assets/images/error.png';
  }

  showError(err: string) {
    this.error = err;
    this.shouldShowError = true;
    setTimeout(() => {
      this.shouldShowError = false;
    }, 7500);
  }
}
