import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {GteCoreComponent} from './gte-core/gte-core.component';
import {TopMenuComponent} from './components/top-menu/top-menu.component';
import {LeftMenuComponent} from './components/left-menu/left-menu.component';
import {RightMenuComponent} from './components/right-menu/right-menu.component';
import {BottomMenuComponent} from './components/bottom-menu/bottom-menu.component';
import {PlayersBoxComponent} from './components/top-menu/players-box/players-box.component';
import {TextButtonComponent} from './components/top-menu/text-button/text-button.component';
import {TreeTabComponent} from './components/bottom-menu/tree-tab/tree-tab.component';
import {HttpClientModule} from '@angular/common/http';
import {StrategicFormComponent} from './components/top-menu/strategic-form/strategic-form.component';
import {SequentialFormComponent} from './components/top-menu/sequential-form/sequential-form.component';
import {AngularDraggableModule} from 'angular2-draggable';
import {UserActionControllerService} from './services/user-action-controller/user-action-controller.service';
import {TooltipsService} from './services/tooltips/tooltips.service';
import {UiSettingsService} from './services/ui-settings/ui-settings.service';
import {MatrixInputComponent} from './components/top-menu/matrix-input/matrix-input.component';
import {FormsModule} from '@angular/forms';
import {SolverService} from './services/solver/solver.service';
import {SolverComponent} from './components/top-menu/solver/solver.component';
import {LabelInputComponent} from './components/misc/label-input/label-input.component';
import {TreesFileService} from './services/trees-file/trees-file.service';
import {StrategicFormTableComponent} from './shared/components/strategic-form-table/strategic-form-table.component';
import {ShortcutsComponent} from './components/right-menu/shortcuts/shortcuts.component';
import {ShortcutsService} from './services/shortcuts/shortcuts.service';
import { SettingsComponent } from './components/right-menu/settings/settings.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ClickOutsideModule} from 'ng-click-outside';
import { SaveMenuComponent } from './components/top-menu/save-menu/save-menu.component';
import {HotkeyModule} from 'angular2-hotkeys';
import { TreeDimensionsComponent } from './gte-core/tree-dimensions/tree-dimensions.component';
import { CookiesNoticeComponent } from './components/misc/cookies-notice/cookies-notice.component';
import {QuickstartComponent} from './components/right-menu/quickstart/quickstart.component';
import {SquareButtonComponent} from './shared/components/square-button/square-button.component';
import {ClickableXComponent} from './shared/components/clickable-x/clickable-x.component';
import {ErrorLogComponent} from './shared/components/error-log/error-log.component';
import {DraggableWindowComponent} from './shared/components/draggable-window/draggable-window.component';
import { AlgorithmsMenuComponent } from './components/top-menu/algorithms-menu/algorithms-menu.component';
import { TooltipDirective } from './shared/directives/tooltip.directive';

@NgModule({
  declarations: [
    AppComponent,
    GteCoreComponent,
    TopMenuComponent,
    LeftMenuComponent,
    RightMenuComponent,
    BottomMenuComponent,
    PlayersBoxComponent,
    TextButtonComponent,
    TreeTabComponent,
    SquareButtonComponent,
    StrategicFormComponent,
    SequentialFormComponent,
    ClickableXComponent,
    MatrixInputComponent,
    SolverComponent,
    LabelInputComponent,
    StrategicFormTableComponent,
    ShortcutsComponent,
    SettingsComponent,
    ErrorLogComponent,
    SaveMenuComponent,
    DraggableWindowComponent,
    TreeDimensionsComponent,
    QuickstartComponent,
    CookiesNoticeComponent,
    AlgorithmsMenuComponent,
    TooltipDirective,
  ],
  imports: [
    BrowserModule, HttpClientModule, AngularDraggableModule, FormsModule, BrowserAnimationsModule,
    ClickOutsideModule, HotkeyModule.forRoot(),
  ],
  providers: [UserActionControllerService, TooltipsService, UiSettingsService, SolverService, TreesFileService, ShortcutsService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
