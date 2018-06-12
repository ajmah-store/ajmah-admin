import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Alert, ALERT_TYPES } from '../../models/alert.model';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [
    trigger('enterAnim', [
      transition(':enter', [
        style({ height: '0px' }),
        animate('150ms', style({ height: '55px'}))
      ]),
      transition(':leave', [
        style({ height: '55px' }),
        animate('150ms', style({ height: '0px'}))
      ])
    ])
  ]
})
export class AlertComponent implements OnInit {

  @Input() alert:Alert;

  @Output() dismiss = new EventEmitter<Alert>();

  constructor() { }

  ngOnInit() {
  }

  emitDismiss() {
    this.dismiss.emit(this.alert);
  }

  getStyle():any {
    let type = this.alert.type;
    return {
      'info': type === ALERT_TYPES.INFO,
      'success': type === ALERT_TYPES.SUCCESS,
      'warn': type === ALERT_TYPES.WARN,
      'danger': type === ALERT_TYPES.DANGER
    };
  }

}
