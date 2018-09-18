import {Component, OnInit} from '@angular/core';
import {TreesFileService} from '../../services/trees-file/trees-file.service';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss']
})
export class BottomMenuComponent implements OnInit {

  constructor(public tfs: TreesFileService) {
  }

  ngOnInit() {
  }

  changeTree(index: number) {
    this.tfs.changeToTree(index);
  }

  isTabActive(index: number) {
    return index === this.tfs.currentTabIndex;
  }

  closeTab(index: number) {
    this.tfs.closeFile(index);
  }
}
