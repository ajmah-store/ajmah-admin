import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { ToggleSidebar } from '../../store/actions/ui.actions';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit {

  constructor(
    private store: Store,
    private auth: AuthService
  ) { }

  ngOnInit() {
  }

  toggleSidebar() {
    this.store.dispatch(new ToggleSidebar());
  }

  logout() {
    this.auth.logout();
  }

}
