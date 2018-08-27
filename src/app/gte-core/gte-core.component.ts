/// <reference path="../../../node_modules/phaser-ce/typescript/phaser.d.ts" />
import { Component, OnInit } from '@angular/core';
import {GTE} from './gte/GTE';
// declare let Phaser: any;

@Component({
  selector: 'app-gte-core',
  templateUrl: './gte-core.component.html',
  styleUrls: ['./gte-core.component.scss']
})
export class GteCoreComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    let width = window.innerWidth * devicePixelRatio;
    let height = window.innerHeight * devicePixelRatio;
    if (width > 1920) {
      width = 1920;
      height = 1920 / window.innerWidth * window.innerHeight;
    }
    const game = new GTE(width, height);
  }
}
