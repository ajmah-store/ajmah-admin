import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {

  private _task: Promise<any>;

  @Input() type:string = 'submit';
  @Input() iconLeft:boolean = false;
  @Input() iconRight:boolean = false;
  @Input() disabled:boolean = false;

  @Output() click = new EventEmitter<any>();
  @Output() complete = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  state = 'normal';

  constructor() { }

  ngOnInit() {
  }

  get task():Promise<any> {
    return this._task;
  }

  @Input()
  set task(val:Promise<any>) {
    
    this._task = val;

    //control state
    this.changeState(val);
  }

  getStyle():any {
    return {
      'normal': this.checkState('normal'),
      'progress': this.checkState('pending'),
      'complete': this.checkState('complete'),
      'error': this.checkState('error'),
      'icon-left': this.iconLeft && this.checkState('normal'),
      'icon-right': this.iconRight && this.checkState('normal')
    }
  }

  checkState(val:string) {
    return this.state === val;
  }

  emitClick() {

    //this.click.emit();

  }

  reset() {
    setTimeout(() => { this.state = 'normal' }, 1000);
  }

  changeState(val:Promise<any>) {

    if(val) {
      //set state to pending
      this.state = 'pending';

      this.task.then(() => {

        //set state to complete
        this.state = 'complete';

        //emit complete event
        this.complete.emit();

        //reset button
        this.reset();

      }).catch(error => {

        //set state to error
        this.state = 'error';

        //emit error event
        this.error.emit();

        //reset button
        this.reset();

      });
    }
    else {

      //set state to normal
      this.state = 'normal';

    }
  }

}
