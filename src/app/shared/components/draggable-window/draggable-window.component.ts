import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {DraggableWindowService} from './service/draggable-window.service';

@Component({
  selector: 'app-draggable-window',
  templateUrl: './draggable-window.component.html',
  styleUrls: ['./draggable-window.component.scss']
})
export class DraggableWindowComponent implements OnInit {

  @Input() isResizeable: boolean;
  @Input() width: string;
  @Input() height: string;
  @Input() top: string;
  @Input() right: string;
  @Input() title: string;
  @Output() closeCallback = new EventEmitter();
  @ViewChild('dragWindow', {static: false}) dragWindow;

  constructor(private hotkeys: HotkeysService, private coords: DraggableWindowService) {
    this.hotkeys.add(new Hotkey('esc', (event: KeyboardEvent): boolean => {
      this.close();
      return false;
    }));
  }

  ngOnInit() {
    const oldCoords = this.coords.getCoords(this.title);
    if (oldCoords) {
      this.width = oldCoords.width;
      this.height = oldCoords.height;
      this.top = oldCoords.top;
      this.right = oldCoords.right;
    }
  }

  getBody() {
    return document.getElementById('phaser-div');
  }

  close() {
    const style = window.getComputedStyle(this.dragWindow.nativeElement);
    const matrixAsString = style.transform;
    const matrix = matrixAsString.match(/matrix.*\((.+)\)/)[1].split(', ');
    const xPx = Number(matrix[4]);
    const yPx = Number(matrix[5]);

    const xPerc = xPx / window.innerWidth;
    const yPerc = yPx / window.innerHeight;
    const adjustedRight = parseFloat(this.right) - xPerc * 100;
    const adjustedTop = parseFloat(this.top) + yPerc * 100;
    const rightToString = adjustedRight + '%';
    const topToString = adjustedTop + '%';

    this.coords.setCoords(this.title, style.width, style.height, topToString, rightToString);
    this.closeCallback.emit();
  }
}
