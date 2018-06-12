import { Component, OnInit, OnDestroy } from '@angular/core';

import { offCanvasFrames } from '../../constants';

import { Store } from '@ngxs/store';
import { ToggleOffCanvas } from '../../store/actions/ui.actions';

import { Observable, Subscription } from 'rxjs';

import { Product } from '../../models/product.model';

import { ProductService } from '../../services/product.service';
import { Category } from '../../models/category.model';
import { Dictionary, ArrayList } from '@arjunatlast/jsds';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit, OnDestroy {

  frameId = offCanvasFrames;

  products = new ArrayList<Product>();
  categories = new Dictionary<Category>();

  subscriptions: Subscription[] = [];

  selectedProducts = new ArrayList<Product>(Infinity);

  datatableKeys:string[] = ['featuredImageUrl:image','name', 'price:currency', 'category=>name'];
  datatableAttrs:string[] = ['Image', 'Name', 'Price', 'Category'];

  searchTxt:string = '';

  constructor(
    private store: Store,
    private ps: ProductService
  ) { }

  ngOnInit() {

    //get categories as Map
    this.subscriptions.push(

      this.ps.getCategoriesAsMap().subscribe(
        categoryMap => {
          this.categories = categoryMap
        }
      )

    );

    //get products
    this.subscriptions.push(

      this.ps.getProductsAsList().subscribe(
        productList => {
          this.products = productList;
        }
      )
    );

  }

  filteredProducts():ArrayList<Product> {
    return this.products.filter(product => !!product.name.match(this.searchTxt));
  }

  toggleFrame(val:number) {
    this.store.dispatch(new ToggleOffCanvas(val));
  }

  isFrameOpened$(val:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened === val);
  }

  editProduct() {
    console.log('Edit');
  }

  deleteProduct() {
    console.log('Delete');
  }

  selectProduct(product:Product) {
    this.selectedProducts.add(product);
    console.log('Select');
  }

  unselectProduct(product:Product) {
    this.selectedProducts.remove(product);
    console.log('Unselect');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(
      sub => sub.unsubscribe()
    );
  }

}
