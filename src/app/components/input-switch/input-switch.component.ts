import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-switch',
  templateUrl: './input-switch.component.html',
  styleUrls: ['./input-switch.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputSwitchComponent),
    multi: true
  }]
})
export class InputSwitchComponent implements OnInit, ControlValueAccessor {

  private _value:boolean;

  onChange: (_:any) => void = (_:any) => {};
  onTouched: () => void = () => {};

  @Input() label:string='';

  @Output() on = new EventEmitter<any>();
  @Output() off = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<boolean>();

  constructor() { }

  get value():boolean {
    return this._value;
  }

  @Input()
  set value(value:boolean) {
    this._value = value;
    this.onChange(value);
    value? this.on.emit(this.value) : this.off.emit(this.value);
  }

  toggleValue() {
    this.value = !this.value;
    this.toggle.emit(this.value);
  }

  ngOnInit() {
  }

  writeValue(value:boolean) {
    this.value = value;
  }

  registerOnChange(fn:any) {
    this.onChange = fn;
  }

  registerOnTouched(fn:any) {
    this.onTouched = fn;
  }

}
