import {Component, Input, OnInit} from '@angular/core';
import {SquareButtonComponent} from '../../../../../../../../Graphz/graphz/src/app/shared/components/square-button/square-button.component';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {ShortcutsService} from '../../../services/shortcuts/shortcuts.service';

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent implements OnInit {

  @Input() shortcutsButton: SquareButtonComponent;
  shortcuts: Array<{ command: string, explanation: string, videoURL: string }>;
  currentlyHoveredIndex: number;


  constructor(private uis: UiSettingsService, private ss: ShortcutsService) {
    this.ss.getShortcuts().subscribe((value) => {
      this.shortcuts = value;
    });
    this.currentlyHoveredIndex = -1;
  }

  ngOnInit() {
  }

  close() {
    this.shortcutsButton.clickHandler();
    this.uis.shortcutsActive = false;
  }
}
