import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-tree-tab',
  templateUrl: './tree-tab.component.html',
  styleUrls: ['./tree-tab.component.scss']
})
export class TreeTabComponent implements OnInit {

  @Input() treeName: string;
  @Input() isSelected: string;
  @Output() close = new EventEmitter();
  @Output() select = new EventEmitter();
  constructor() {
  }

  ngOnInit() {
  }

  closeTab(){
    this.close.emit();
  }

  selectTab(){
    this.select.emit();
  }

}
