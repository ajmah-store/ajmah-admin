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
