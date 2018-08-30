import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-basic-button',
  templateUrl: './basic-button.component.html',
  styleUrls: ['./basic-button.component.scss']
})
export class BasicButtonComponent implements OnInit {

  @Input() imageKey: string;
  @Output() public clicked: EventEmitter<any> = new EventEmitter();

  pathToImage: string;

  constructor() {
  }

  ngOnInit() {
    this.pathToImage = 'assets/images/' + this.imageKey;
  }

  sendSignal(){
    this.clicked.emit();
  }
}


