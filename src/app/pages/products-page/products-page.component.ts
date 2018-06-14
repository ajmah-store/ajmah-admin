import { Component, OnInit, OnDestroy } from '@angular/core';

import { offCanvasFrames } from '../../constants';

import { Store } from '@ngxs/store';
import { ToggleOffCanvas, CreateConfirm, DismissConfirm, ChangeOffCanvas } from '../../store/actions/ui.actions';

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

  //saves selected products
  selectedProducts = new ArrayList<Product>(Infinity);
  
  //datatable inputs
  datatableKeys:string[] = ['featuredImageUrl:image','name', 'category=>name', 'price:currency', 'unit'];
  datatableAttrs:string[] = ['Image', 'Name', 'Category', 'Price', 'Unit'];

  //used to filter datatable
  searchTxt:string = '';

  //product being edited
  productEditted: Product;

  //subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private ps: ProductService
  ) { }

  ngOnInit() {

    //get categories as Map and push it to subscription
    this.subscriptions.push(

      this.ps.getCategoriesAsMap().subscribe(
        categoryMap => {
          
          //if categoryMap exist
          if(categoryMap) {
            this.categories = categoryMap
          }

        }
      )

    );

    //get products and push it to subscription
    this.subscriptions.push(

      this.ps.getProductsAsList().subscribe(
        productList => {
          
          //if productList exists
          if(productList) {

            //save it to product list
            this.products = productList;

          }
        }
      )
    );

  }

  filteredProducts():ArrayList<Product> {
    return this.products.filter(product => !!product.name.toLowerCase().match(this.searchTxt.trim().toLocaleLowerCase()));
  }

  toggleFrame(val:number) {
    this.store.dispatch(new ToggleOffCanvas(val));
  }

  isFrameOpened$(val:number):Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened === val);
  }

  editProduct(product:Product) {
    //set the product as editted
    this.productEditted = product;

    //open edit product offcanvas
    this.store.dispatch(new ChangeOffCanvas(this.frameId.editProduct));
  }

  deleteProduct(product:Product) {

    //create a confirm box
    this.store.dispatch(new CreateConfirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete the product ${product.name}. This action cannot be undone.`,
      okButton: {
        text: 'Delete',
        onClick: () => {

          //delete the product
          this.ps.deleteProduct(product);

          //dismiss confirm
          this.store.dispatch(new DismissConfirm());
        }
      },
      cancelButton: {
        text: 'Cancel',
        onClick: () => {

          //dismiss confirm
          this.store.dispatch(new DismissConfirm());
        }
      }
    }))
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
