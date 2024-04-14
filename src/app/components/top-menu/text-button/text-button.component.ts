import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-text-button',
  templateUrl: './text-button.component.html',
  styleUrls: ['./text-button.component.scss']
})
export class TextButtonComponent implements OnInit {
  @Input() text: string;
  @Input() isActive: boolean;

  constructor() {
  }

  @HostBinding('class.isActive') get isButtonActive() {
    return this.isActive;
  }

  ngOnInit() {
  }
}
