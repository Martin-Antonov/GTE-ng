import { Component, OnInit } from '@angular/core';

import {BasicButtonComponent} from '../../top-menu/basic-button/basic-button.component';

@Component({
  selector: 'app-basic-l-button',
  templateUrl: './basic-l-button.component.html',
  styleUrls: ['./basic-l-button.component.scss']
})
export class BasicLButtonComponent extends BasicButtonComponent implements OnInit {
  isActive: boolean;
  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.isActive = false;
  }
  sendSignal(){
    super.sendSignal();
  }
}
