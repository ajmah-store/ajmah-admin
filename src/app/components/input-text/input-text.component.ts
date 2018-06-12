import { Component, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputTextComponent),
    multi: true
  }]
})
export class InputTextComponent implements OnInit, ControlValueAccessor {

  private _value:string;

  focused:boolean=false;

  onChange: (_: any) => void = (_: any) => {};
  onTouched: () => void = () => {};

  @Input() invalid:boolean = false;
  @Input() placeholder:string='';

  @Output() change: EventEmitter<string> = new EventEmitter();
  @Output() focus: EventEmitter<any> = new EventEmitter();
  @Output() blur: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  get value():string {
    return this._value;
  }

  set value(val:string) {
    this._value = val;
    this.onChange(val);
    this.emitChange();
  }

  emitChange() {
    this.change.emit(this.value);
  }

  writeValue(val: string): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setFocused(val:boolean) {
    this.focused = val;
    if(val) this.focus.emit();
    else this.blur.emit();
  }

}
