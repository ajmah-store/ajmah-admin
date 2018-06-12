import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Alert, ALERT_TYPES } from './models/alert.model';
import { DismissAlert, CreateAlert } from './store/actions/ui.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  alert$: Observable<Alert>;

  constructor(
    private store:Store
  ) {}

  ngOnInit(): void {
    this.alert$ = this.store.select(store => store.ui.alert);
  }

  dismissAlert() {
    this.store.dispatch(new DismissAlert());
  }


}
