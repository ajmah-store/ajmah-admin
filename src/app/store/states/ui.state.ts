import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ExpandSidebar, CollapseSidebar, ToggleSidebar } from '../actions/ui.actions';

export interface UIStateModel {
    sidebarCollapsed:boolean;
}

@State<UIStateModel>({
  name: 'ui',
  defaults: {
    sidebarCollapsed: false
  }
})
export class UIState {

  @Selector()
  static getSidebarOpen(state: UIStateModel) {
    return state.sidebarCollapsed;
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
}
