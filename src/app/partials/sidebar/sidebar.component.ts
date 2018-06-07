import { Component, OnInit } from '@angular/core';
import { sidebarLinks } from '../../constants';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  navItems:any[] = sidebarLinks;
  sidebarCollapsed$: Observable<boolean>;

  constructor(private store:Store) {
    this.sidebarCollapsed$ = this.store.select(state => state.ui.sidebarCollapsed);
  }

  ngOnInit() {
  }

}
