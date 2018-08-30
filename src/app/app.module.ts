import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GteCoreComponent } from './gte-core/gte-core.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import {UserActionControllerService} from './services/user-action-controller.service';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { RightMenuComponent } from './components/right-menu/right-menu.component';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { BasicButtonComponent } from './components/top-menu/basic-button/basic-button.component';


@NgModule({
  declarations: [
    AppComponent,
    GteCoreComponent,
    TopMenuComponent,
    LeftMenuComponent,
    RightMenuComponent,
    BottomMenuComponent,
    BasicButtonComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [UserActionControllerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
