import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Confirm } from '../../models/confirm.model';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  animations: [
    trigger('enterAnim', [
      transition(':enter', [
        style({ transform: 'scale(0,0)', opacity:0, transformOrigin:'50% 50%' }),
        animate('300ms ease-in-out', keyframes([
          style({transform: 'scale(0,0)', opacity:0, offset:0}),
          style({transform: 'scale(1,1)', opacity:1, offset:1})
        ]))
      ])
    ])
  ]
})
export class ConfirmComponent implements OnInit {

  @Input() confirm: Confirm;

  @Output() confirmed = new EventEmitter<Confirm>();
  @Output() canceled = new EventEmitter<Confirm>();

  constructor() { }

  ngOnInit() {
    console.log(this.confirm);
  }

  okButtonClicked() {
    this.confirm.okButton.onClick();
    this.confirmed.emit(this.confirm);
  }

  cancelButtonClicked() {
    this.confirm.cancelButton.onClick();
    this.canceled.emit(this.confirm);
  }

}
