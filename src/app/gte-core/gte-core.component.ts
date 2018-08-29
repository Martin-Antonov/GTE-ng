/// <reference path="../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {GTE} from './gte/GTE';
import {UserActionControllerService} from '../services/user-action-controller.service';

@Component({
  selector: 'app-gte-core',
  templateUrl: './gte-core.component.html',
  styleUrls: ['./gte-core.component.scss']
})
export class GteCoreComponent implements AfterViewInit {
  game: Phaser.Game;

  constructor(
    private userActionControllerService: UserActionControllerService,
    private el: ElementRef) {
  }

  ngAfterViewInit() {
    let div = this.el.nativeElement.querySelector('#phaser-div');
    let boundingRect = div.getBoundingClientRect();
    let width = boundingRect.width;
    let height = boundingRect.height;
    this.game = new GTE(width, height);
    setTimeout(() => {
      this.userActionControllerService.setUAC(this.game.state.states.MainScene.userActionController);
    }, 5000);
  }


}
