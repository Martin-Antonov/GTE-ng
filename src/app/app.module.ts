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
import {SquareButtonComponent} from './shared/components/square-button/square-button.component';
import {HttpClientModule} from '@angular/common/http';
import {StrategicFormComponent} from './components/top-menu/strategic-form/strategic-form.component';
import {AngularDraggableModule} from 'angular2-draggable';
import {ClickableXComponent} from './shared/components/clickable-x/clickable-x.component';
import {UserActionControllerService} from './services/user-action-controller/user-action-controller.service';
import {TooltipsService} from './services/tooltips/tooltips.service';
import {UiSettingsService} from './services/ui-settings/ui-settings.service';
import { MatrixInputComponent } from './components/top-menu/matrix-input/matrix-input.component';
import {FormsModule} from '@angular/forms';
import {SolverService} from './services/solver/solver.service';
import { SolverComponent } from './components/top-menu/solver/solver.component';
import { LabelInputComponent } from './components/misc/label-input/label-input.component';
import {TreesFileService} from './services/trees-file/trees-file.service';



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
    ClickableXComponent,
    MatrixInputComponent,
    SolverComponent,
    LabelInputComponent,
  ],
  imports: [
    BrowserModule, HttpClientModule, AngularDraggableModule, FormsModule,
  ],
  providers: [UserActionControllerService, TooltipsService, UiSettingsService, SolverService, TreesFileService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
