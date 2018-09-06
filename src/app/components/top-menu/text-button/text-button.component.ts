import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-text-button',
  templateUrl: './text-button.component.html',
  styleUrls: ['./text-button.component.scss']
})
// TODO: Abstract this...
export class TextButtonComponent implements OnInit {

  @Input() text: string;
  @Output() public clicked: EventEmitter<any> = new EventEmitter();
  isActive: boolean;

  constructor() {
  }

  ngOnInit() {
    this.isActive = false;
  }

  sendSignal(){
    this.isActive = !this.isActive;
    this.clicked.emit();
  }
}
