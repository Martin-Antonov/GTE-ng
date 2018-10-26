/// <reference path="../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
import {Component, ElementRef, OnInit} from '@angular/core';
import {GTE} from './gte/GTE';
import {UserActionControllerService} from '../services/user-action-controller/user-action-controller.service';
import {TreesFileService} from '../services/trees-file/trees-file.service';

@Component({
  selector: 'app-gte-core',
  templateUrl: './gte-core.component.html',
  styleUrls: ['./gte-core.component.scss']
})
export class GteCoreComponent implements OnInit {
  game: Phaser.Game;

  constructor(
    private userActionControllerService: UserActionControllerService,
    private el: ElementRef,
    private tfs: TreesFileService) {
  }

  ngOnInit() {
    let div = this.el.nativeElement.querySelector('#phaser-div');
    let boundingRect = div.getBoundingClientRect();
    let width = boundingRect.width;
    let height = boundingRect.height;
    this.game = new GTE(width, height);

    let interval = setInterval(() => {
      if (this.game && this.game.state && this.game.state.states.MainScene && this.game.state.states.MainScene.userActionController) {
        this.userActionControllerService.setUAC(this.game.state.states.MainScene.userActionController);
        this.tfs.initiateFirstTree();
        clearInterval(interval);
      }
    }, 100);
  }

  onClickOutside(e: Event) {
    if (this.game && this.game.state && this.game.state.states.MainScene && this.game.state.states.MainScene.userActionController) {
      this.game.state.states.MainScene.userActionController.deselectNodesHandler();
    }
  }
}
