import {Component, Input, OnInit} from '@angular/core';
import {BasicButtonComponent} from '../../top-menu/basic-button/basic-button.component';

@Component({
  selector: 'app-toggle-l-button',
  templateUrl: './toggle-l-button.component.html',
  styleUrls: ['./toggle-l-button.component.scss']
})
export class ToggleLButtonComponent extends BasicButtonComponent implements OnInit {

  @Input() secondImageKey: string;
  firstActive: boolean;
  currentKey: string;

  constructor() {
    super();

  }

  ngOnInit() {
    super.ngOnInit();
    this.firstActive = true;
    this.currentKey = this.pathToImage;
  }

  sendSignal() {
    super.sendSignal();
    this.firstActive = !this.firstActive;
    if (this.firstActive) {
      this.currentKey = this.pathToImage;
    }
    else {
      this.currentKey = 'assets/images/' + this.secondImageKey;
    }
  }

}
