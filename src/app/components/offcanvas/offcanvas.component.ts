import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { ChangeOffCanvas } from '../../store/actions/ui.actions';

@Component({
  selector: 'app-offcanvas',
  templateUrl: './offcanvas.component.html',
  styleUrls: ['./offcanvas.component.scss']
})
export class OffcanvasComponent implements OnInit {

  @Input() maximized: boolean = false;
  @Input() opened: boolean = false;
  @Input() frameTitle: string;

  constructor(private store:Store) { }

  ngOnInit() {
  }

  maximize() {
    this.maximized = true;
  }

  minimize() {
    this.maximized = false;
  }

  close() {
    this.maximized = false;
    this.store.dispatch(new ChangeOffCanvas(0));
  }

}
