import { NgModule } from "@angular/core";
import { NgxsModule } from "@ngxs/store";
import { UIState } from "./states/ui.state";
import { NgxsLoggerPluginModule } from "@ngxs/logger-plugin";
import { NgxsReduxDevtoolsPluginModule} from "@ngxs/devtools-plugin";

@NgModule({
  imports: [
    NgxsModule.forRoot([
      UIState
    ]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot()
  ],
  exports: [
    NgxsModule,
    NgxsLoggerPluginModule,
    NgxsReduxDevtoolsPluginModule
  ]
})
export class AppStoreModule { }
