import { Component, OnInit } from '@angular/core';
import { offCanvasFrames } from '../../constants';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeOffCanvas } from '../../store/actions/ui.actions';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit {

  frameId = offCanvasFrames;

  constructor(private store: Store) {
  }

  ngOnInit() {
  }

  openFrame(val:number) {
    this.store.dispatch(new ChangeOffCanvas(val));
  }

  isFrameOpened$(val:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened === val);
  }

}
