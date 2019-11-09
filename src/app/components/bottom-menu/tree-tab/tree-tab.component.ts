import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TreesFileService} from '../../../services/trees-file/trees-file.service';

@Component({
  selector: 'app-tree-tab',
  templateUrl: './tree-tab.component.html',
  styleUrls: ['./tree-tab.component.scss']
})
export class TreeTabComponent implements OnInit {

  @Input() index: number;
  @Input() isSelected: string;
  @Output() close = new EventEmitter();
  @Output() select = new EventEmitter();

  constructor(public tfs: TreesFileService) {
  }

  ngOnInit() {
  }

  closeTab() {
    this.close.emit();
  }

  selectTab() {
    this.select.emit();
  }

}
