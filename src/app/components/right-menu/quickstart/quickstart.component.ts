import {Component, Input, OnInit} from '@angular/core';
import {UiSettingsService} from '../../../services/ui-settings/ui-settings.service';
import {SquareButtonComponent} from '../../../shared/components/square-button/square-button.component';

@Component({
  selector: 'app-quickstart',
  templateUrl: './quickstart.component.html',
  styleUrls: ['./quickstart.component.scss']
})
export class QuickstartComponent implements OnInit {
  @Input() quickstartButton: SquareButtonComponent;

  constructor(public uis: UiSettingsService) { }

  ngOnInit() {
  }

  close() {
    this.quickstartButton.clickHandler();
    this.uis.quickstartActive = false;
    this.uis.setQuickStartInactive();
  }
}
