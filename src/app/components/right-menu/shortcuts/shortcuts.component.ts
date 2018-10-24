import {Component, Input, OnInit} from '@angular/core';
import {SquareButtonComponent} from '../../../shared/components/square-button/square-button.component';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {ShortcutsService} from '../../../services/shortcuts/shortcuts.service';

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class ShortcutsComponent implements OnInit {

  @Input() shortcutsButton: SquareButtonComponent;
  shortcuts: Array<{ command: string, explanation: string }>;

  constructor(private uis: UiSettingsService, private ss: ShortcutsService) {
    this.ss.getShortcuts().subscribe((value) => {
      this.shortcuts = value;
    });
  }

  ngOnInit() {
  }

  getBody() {
    return document.getElementsByTagName('BODY')[0];
  }

  close() {
    this.shortcutsButton.clickHandler();
    this.uis.shortcutsActive = false;
  }
}
