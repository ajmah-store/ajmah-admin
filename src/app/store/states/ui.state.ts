import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ExpandSidebar, CollapseSidebar, ToggleSidebar, ChangeOffCanvas } from '../actions/ui.actions';

export interface UIStateModel {
    sidebarCollapsed:boolean;
    offCanvasOpened:number;
}

@State<UIStateModel>({
  name: 'ui',
  defaults: {
    sidebarCollapsed: false,
    offCanvasOpened: 0
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

  @Action(ChangeOffCanvas)
  changeOffCanvas(ctx: StateContext<UIStateModel>, action: ChangeOffCanvas) {
    ctx.patchState({
      offCanvasOpened: action.payload
    });
  }
}
