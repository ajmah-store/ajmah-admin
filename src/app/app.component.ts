import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Alert, ALERT_TYPES } from './models/alert.model';
import { DismissAlert, CreateAlert } from './store/actions/ui.actions';
import { Confirm } from './models/confirm.model';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  alert$: Observable<Alert>;

  confirm$: Observable<Confirm>;

  constructor(
    private store:Store,
    private auth: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.alert$ = this.store.select(store => store.ui.alert);
    this.confirm$ = this.store.select(store => store.ui.confirm);
  }

  dismissAlert() {
    this.store.dispatch(new DismissAlert());
  }

}
