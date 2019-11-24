import {Component, OnInit} from '@angular/core';
import {TreesFileService} from '../../services/trees-file/trees-file.service';
import {GTE_VERSION} from '../../gte-core/gte/src/Utils/Constants';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss']
})
export class BottomMenuComponent implements OnInit {

  confirmationActive: boolean;
  currentTabIndex: number;
  version: string;

  constructor(public tfs: TreesFileService) {
  }

  ngOnInit() {
    this.confirmationActive = false;
    this.version = GTE_VERSION;
  }

  changeTree(index: number) {
    this.tfs.changeToTree(index);
  }

  isTabActive(index: number) {
    return index === this.tfs.currentTabIndex;
  }

  closeTab(index: number) {
    this.tfs.closeFile(index);
    this.confirmationActive = false;
  }

  activateConfirmation(index: number) {
    if (this.tfs.treeTabs.length > 1) {
      this.confirmationActive = true;
      this.currentTabIndex = index;
    }
  }

  getFPS() {
    return Math.round(this.tfs.userActionController.scene.game.loop.actualFps);
  }

}
