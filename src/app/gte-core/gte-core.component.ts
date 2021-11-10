/// <reference path="../../../node_modules/phaser/types/phaser.d.ts" />
import {Component, ElementRef, OnInit} from '@angular/core';
import {UserActionControllerService} from '../services/user-action-controller/user-action-controller.service';
import {TreesFileService} from '../services/trees-file/trees-file.service';
import GameConfig = Phaser.Types.Core.GameConfig;
import {MainScene} from './gte/src/Controller/Main/MainScene';

declare var Phaser: any;

@Component({
  selector: 'app-gte-core',
  templateUrl: './gte-core.component.html',
  styleUrls: ['./gte-core.component.scss']
})
export class GteCoreComponent implements OnInit {

  constructor(
    private userActionControllerService: UserActionControllerService,
    private el: ElementRef,
    private tfs: TreesFileService) {
  }

  ngOnInit() {
    const div = this.el.nativeElement.querySelector('#phaser-div');
    const boundingRect = div.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;

    const config: GameConfig = {
      type: Phaser.CANVAS,
      title: 'Game Theory Explorer',
      backgroundColor: '#fff',
      width: width,
      height: height,
      parent: 'phaser-div',
      dom: {
        createContainer: true
      },
    };

    const game = new GTE(config);
    game.scene.add('main', MainScene, true, {uac: this.userActionControllerService, tfs: this.tfs});
  }
}

export class GTE extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}
