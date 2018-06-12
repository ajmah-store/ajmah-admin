import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {

  @Input() progress: number;
  @Input() type:string = 'submit';
  @Input() iconLeft:boolean = false;
  @Input() iconRight:boolean = false;

  @Output() click = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  showProgress():boolean {
    return !this.showNormal() && (this.progress < 100);
  }

  showComplete():boolean {
    if(this.progress == 100) {
      setTimeout(() => { this.progress = null}, 5000);
      return true;
    }

    return false;
  }

  showNormal():boolean {
    return (this.progress === undefined || this.progress === null) ;
  }

  getStyle():any {
    return {
      'normal': this.showNormal(),
      'progress': this.showProgress(),
      'complete': this.showComplete(),
      'icon-left': this.iconLeft && this.showNormal(),
      'icon-right': this.iconRight && this.showNormal()
    }
  }

  emitClick() {
    this.click.emit(this.progress);
  }

}
