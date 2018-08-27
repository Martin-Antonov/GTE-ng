import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GteCoreComponent } from './gte-core/gte-core.component';

@NgModule({
  declarations: [
    AppComponent,
    GteCoreComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
