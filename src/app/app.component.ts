import {Component} from '@angular/core';
import {UiSettingsService} from './services/ui-settings/ui-settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gte-v2';

  constructor(private uis: UiSettingsService) {
    this.uis.init();
  }
}
