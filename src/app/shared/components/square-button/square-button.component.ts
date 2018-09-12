import {Component, HostListener, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-square-button',
  templateUrl: './square-button.component.html',
  styleUrls: ['./square-button.component.scss']
})
export class SquareButtonComponent implements OnInit {

  private PATH_TO_ASSETS = 'assets/images/';
  @Input() imageKey: string;
  @Input() secondImageKey?: string;
  @Input() tooltipText?: string;

  private shouldShowAnimation: boolean;

  pathToImage: string;

  constructor() {
  }

  ngOnInit() {
    this.pathToImage = this.PATH_TO_ASSETS + this.imageKey;
    this.shouldShowAnimation = false;
  }

  @HostListener('click') onClick() {
    if (this.secondImageKey) {
      if (this.pathToImage.length === this.PATH_TO_ASSETS.length + this.imageKey.length) {
        this.pathToImage = this.PATH_TO_ASSETS + this.secondImageKey;
      }
      else {
        this.pathToImage = this.PATH_TO_ASSETS + this.imageKey;
      }
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.tooltipText) {
      this.shouldShowAnimation = true;
    }
  }

  @HostListener('mouseleave') onMouseLeave() {

    if (this.tooltipText) {
      this.shouldShowAnimation = false;
    }
  }
}

