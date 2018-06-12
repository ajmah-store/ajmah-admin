import { Alert } from '../../models/alert.model';

export class ExpandSidebar {
  static readonly type = "[UI] ExpandSidebar";
  constructor() {}
}

export class CollapseSidebar {
  static readonly type = "[UI] CollapseSidebar";
  constructor() {}
}

export class ToggleSidebar {
  static readonly type = "[UI] ToggleSidebar";
  constructor() {}
}

export class ChangeOffCanvas {
  static readonly type = "[UI] ChangeOffCanvas";
  constructor(public payload:number) {}
}

export class ToggleOffCanvas {
  static readonly type = "[UI] ToggleOffCanvas";
  constructor(public payload:number) {}
}

export class CreateAlert {
  static readonly type = "[UI] CreateAlert";
  constructor(public payload: Alert) {}
}

export class DismissAlert {
  static readonly type = "[UI] DismissAlert";
  constructor() {}
}
