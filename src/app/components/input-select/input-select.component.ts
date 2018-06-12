import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputSelectComponent),
    multi: true
  }]
})
export class InputSelectComponent implements OnInit, ControlValueAccessor {

  private _value:string;

  searchTxt:string = '';
  content:string;
  dropdown:boolean = false;

  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input('default') def: SelectOption;
  @Input() invalid:boolean = false;

  onChange: (_:any) => void = (_:any) => {};
  onTouched: () => void = () => {};

  @Output() change: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if(this.def){
      this._value = this.def.value;
      this.content = this.def.content;
    }
  }

  get value():string {
    return this._value;
  }

  set value(val:string) {
    this._value = val;
    this.onChange(val);
    this.emitChange();
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

  emitChange() {
    this.change.emit(this.value);
  }

  filteredOptions():SelectOption[] {
    return this.options? this.options.filter(
      ({content}) => {
        return content.toLowerCase().match(this.searchTxt.toLowerCase());
      }
    ):[];
  }

  toggleDropdown() {
    this.dropdown = !this.dropdown;
  }

  selectOption(option:SelectOption) {
    this.value = option.value;
    this.content = option.content;
    this.toggleDropdown();
  }

}

export interface SelectOption {
  value: string;
  content: string;
}
