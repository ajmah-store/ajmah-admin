import { Directive, Input, HostBinding, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[dragItem]'
})
export class DragItemDirective {

  @Input() dragData:any;

  @Output() dragged = new EventEmitter<any>();

  @HostBinding('draggable') draggable = true;

  constructor() { }

  @HostListener('dragstart', ['$event'])
  onDragged($event:DragEvent) {

    //set data
    $event.dataTransfer.setData('data', this.dragData);
    
  }

}
