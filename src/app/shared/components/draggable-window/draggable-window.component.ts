import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';

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

  constructor(private hotkeys: HotkeysService) {
    this.hotkeys.add(new Hotkey('esc', (event: KeyboardEvent): boolean => {
      this.close();
      return false;
    }));
  }

  ngOnInit() {
  }

  getBody() {
    return document.getElementById('phaser-div');
  }

  close() {
    this.closeCallback.emit();
  }
}
