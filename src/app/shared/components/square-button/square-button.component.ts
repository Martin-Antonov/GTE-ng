import {Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-square-button',
  templateUrl: './square-button.component.html',
  styleUrls: ['./square-button.component.scss']
})
export class SquareButtonComponent implements OnInit {

  @HostBinding('style.background') background;

  private PATH_TO_ASSETS = 'assets/images/';
  @Input() imageKey: string;
  @Input() secondImageKey?: string;
  @Input() tooltipText?: string;
  @Input() inactive?: boolean;
  @Output() clicked: EventEmitter<any>;

  shouldShowAnimation: boolean;

  pathToImage: string;

  constructor() {
    this.clicked = new EventEmitter();
  }

  ngOnInit() {
    this.pathToImage = this.PATH_TO_ASSETS + this.imageKey;
    this.shouldShowAnimation = false;
  }

  @HostListener('click') onClick() {
    this.clickHandler();
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.background = this.inactive ? '#424242' : '#555';
    if (this.tooltipText) {
      this.shouldShowAnimation = true;
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.background = '#424242';
    if (this.tooltipText) {
      this.shouldShowAnimation = false;
    }
  }

  clickHandler() {
    this.flipImage();
    if (!this.inactive) {
      this.clicked.emit();
    }
  }

  flipImage() {
    if (this.secondImageKey) {
      if (this.pathToImage.length === this.PATH_TO_ASSETS.length + this.imageKey.length) {
        this.pathToImage = this.PATH_TO_ASSETS + this.secondImageKey;
      } else {
        this.pathToImage = this.PATH_TO_ASSETS + this.imageKey;
      }
    }
  }
}

