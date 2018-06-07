import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { ToggleSidebar } from '../../store/actions/ui.actions';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit {

  constructor(
    private store: Store
  ) { }

  ngOnInit() {
  }

  toggleSidebar() {
    this.store.dispatch(new ToggleSidebar());
  }

}
