import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ExpandSidebar, CollapseSidebar, ToggleSidebar, ChangeOffCanvas, CreateAlert, DismissAlert, ToggleOffCanvas } from '../actions/ui.actions';

import { Alert } from '../../models/alert.model';

export interface UIStateModel {
    sidebarCollapsed:boolean;
    offCanvasOpened:number;
    alert: Alert;
}

@State<UIStateModel>({
  name: 'ui',
  defaults: {
    sidebarCollapsed: false,
    offCanvasOpened: 0,
    alert: null
  }
})
export class UIState {

  @Selector()
  static getSidebarOpen(state: UIStateModel) {
    return state.sidebarCollapsed;
  }

  @Selector()
  static getOpenedOffCanvas(state: UIStateModel) {
    return state.offCanvasOpened;
  }

  @Selector()
  static getAlert(state: UIStateModel) {
    return state.alert;
  }

  //sidebar
  @Action(ExpandSidebar)
  expandSidebar(ctx: StateContext<UIStateModel>, action: ExpandSidebar) {
    ctx.patchState({
      sidebarCollapsed: true
    });
  }

  @Action(CollapseSidebar)
  collapseSidebar(ctx: StateContext<UIStateModel>, action: CollapseSidebar) {
    ctx.patchState({
      sidebarCollapsed: false
    });
  }

  @Action(ToggleSidebar)
  toggleSidebar(ctx: StateContext<UIStateModel>, action: ToggleSidebar) {
    const state = ctx.getState();
    ctx.patchState({
      sidebarCollapsed: !state.sidebarCollapsed
    });
  }

  //offcanvas
  @Action(ChangeOffCanvas)
  changeOffCanvas(ctx: StateContext<UIStateModel>, action: ChangeOffCanvas) {
    ctx.patchState({
      offCanvasOpened: action.payload
    });
  }

  @Action(ToggleOffCanvas)
  toggleOffCanvas(ctx:StateContext<UIStateModel>, {payload}: ToggleOffCanvas) {
    let opened = ctx.getState().offCanvasOpened;
    ctx.patchState({
      offCanvasOpened: (opened == payload)?0:payload
    })
  }

  //Alert
  @Action(CreateAlert)
  createAlert(ctx: StateContext<UIStateModel>, {payload}: CreateAlert) {
    ctx.patchState({
      alert: payload
    });
  }

  @Action(DismissAlert)
  dismissAlert(ctx: StateContext<UIStateModel>, action: DismissAlert) {
    ctx.patchState({
      alert: null
    });
  }
}
