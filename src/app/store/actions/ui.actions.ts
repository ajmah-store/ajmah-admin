import { Alert } from '../../models/alert.model';
import { Confirm } from '../../models/confirm.model';

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


//offcanvas
export class ChangeOffCanvas {
  static readonly type = "[UI] ChangeOffCanvas";
  constructor(public payload:number) {}
}

export class ToggleOffCanvas {
  static readonly type = "[UI] ToggleOffCanvas";
  constructor(public payload:number) {}
}

//alert
export class CreateAlert {
  static readonly type = "[UI] CreateAlert";
  constructor(public payload: Alert) {}
}

export class DismissAlert {
  static readonly type = "[UI] DismissAlert";
  constructor() {}
}

//confirm
export class CreateConfirm {
  static readonly type = "[UI] CreateConfirm";
  constructor(public payload: Confirm) {}
}

export class DismissConfirm {
  static readonly type = "[UI] DismissConfirm";
  constructor() {}
}