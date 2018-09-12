import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-text-button',
  templateUrl: './text-button.component.html',
  styleUrls: ['./text-button.component.scss']
})
// TODO: Abstract this...
export class TextButtonComponent implements OnInit {

  @Input() text: string;
  @Input() isActive: boolean;

  constructor() { }


  ngOnInit() {}
}
