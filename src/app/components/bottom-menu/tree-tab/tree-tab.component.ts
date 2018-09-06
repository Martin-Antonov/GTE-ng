import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tree-tab',
  templateUrl: './tree-tab.component.html',
  styleUrls: ['./tree-tab.component.scss']
})
export class TreeTabComponent implements OnInit {

  @Input() treeName: string;
  constructor() {
  }

  ngOnInit() {
  }

}
