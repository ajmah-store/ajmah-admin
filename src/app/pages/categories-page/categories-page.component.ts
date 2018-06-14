import { Component, OnInit, OnDestroy } from '@angular/core';
import { offCanvasFrames } from '../../constants';
import { Store } from '@ngxs/store';
import { ToggleOffCanvas } from '../../store/actions/ui.actions';
import { Observable, Subscription } from 'rxjs';
import { ArrayList } from '@arjunatlast/jsds';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent implements OnInit, OnDestroy {

  frameId = offCanvasFrames;

  categories = new ArrayList<Category>();

  //used to filter datatable
  searchTxt:string = '';

  //keep selected datas
  selectedCategories = new ArrayList<Category>();

  //datatable inputs
  datatableKeys = ["imageUrl:image","name","productCount:number"];
  datatableAttrs = ['Image', 'Name', 'Product Count'];

  //subscriptions
  private subscriptions:Subscription[] = [];

  constructor(
    private store: Store,
    private ps: ProductService
  ) { }

  ngOnInit() {

    //push each subscription to subscriptions so that we can unsubscribe at the end.
    this.subscriptions.push(

      //get categories
      this.ps.getCategoriesAsList().subscribe(
        categoryList => {

          //if categoryList exists
          if(categoryList) {

            //store it to categories
            this.categories = categoryList
          }
        }
      )
    );

  }

  filteredCategories() {
    return this.categories.filter(category => !!category.name.toLowerCase().match(this.searchTxt.toLowerCase()));
  }

  isFrameOpened$(id:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened == id);
  }

  toggleFrame(id:number) {
    this.store.dispatch(new ToggleOffCanvas(id));
  }

  ngOnDestroy() {

    //unsubscribe from all subscriptions
    this.subscriptions.forEach(
      subs => subs.unsubscribe()
    );
  }

}
