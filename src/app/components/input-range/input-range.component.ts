import { Component, OnInit, Input, Output, forwardRef, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-range',
  templateUrl: './input-range.component.html',
  styleUrls: ['./input-range.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputRangeComponent),
    multi: true
  }]
})
export class InputRangeComponent implements OnInit, ControlValueAccessor {

  private _value: number;

  @ViewChild('inputRange') inputRange: ElementRef;

  onChange: (_:any) => void = (_:any) => {};
  onTouched: () => void = () => {};

  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() label: string;

  @Output() change = new EventEmitter<number>();

  constructor() { }

  get value():number {
    return this._value;
  }

  @Input()
  set value(val:number) {
    this._value = val;
    this.onChange(val);
    this.change.emit(val);
  }

  get fill():any {
    const fill =  (this.value / (this.max - this.min))*100;
    return {
      width: `calc(${fill}% - 6px)`
    };
  }

  ngOnInit() {
  }

  writeValue(val:number) {
    this.value = val;
  }

  registerOnChange(fn:any) {
    this.onChange = fn;
  }

  registerOnTouched(fn:any) {
    this.onTouched = fn;
  }

  track(ev:MouseEvent) {
    const input = this.inputRange.nativeElement;
    const width = input.clientWidth;
    const viewOffset = input.getBoundingClientRect();
    const left = viewOffset.left;
    const propVal = ev.clientX - left;
    this.value = Math.round(propVal/width * this.max);
  }

}
