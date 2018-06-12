import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { CreateAlert } from '../store/actions/ui.actions';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

import { Observable, Subscription } from 'rxjs';

import { Category, CATEGORY_COLLECTION } from '../models/category.model';
import { Product, PRODUCT_COLLECTION } from '../models/product.model';

import { ALERT_TYPES } from '../models/alert.model';

import { Dictionary, ArrayList } from '@arjunatlast/jsds';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private categories$: Observable<Category[]>;
  private products$: Observable<Product[]>;

  private subscriptions:Subscription[] = [];

  constructor(
    private fs: AngularFirestore,
    private storage: AngularFireStorage,
    private store:Store
  ) { }

  getCategories():Observable<Category[]> {

    //check if categories already exists if not fetch from firestore
    if( !this.categories$ ) this.categories$ = this.fs.collection(CATEGORY_COLLECTION).valueChanges() as Observable<Category[]>;

    //return categories
    return this.categories$;

  }

  getCategoriesAsMap():Observable<Dictionary<Category>> {

    if( !this.categories$ ) this.getCategories();

    return this.categories$.pipe(map(
      categories => {
          //intitialize map
          let catMap = new Dictionary<Category>();
          //for each category
          categories.forEach(
            category => {
              //add category to the map
              catMap.put(category.id, category);
            }
          );

          return catMap;

      }
    ))
  }

  getProducts():Observable<Product[]> {

    //check if products already exists if not fetch from firestore
    if( !this.products$ ) this.products$ = this.fs.collection(PRODUCT_COLLECTION, ref => ref.orderBy('category','asc')).valueChanges() as Observable<Product[]>;

    //return products
    return this.products$;

  }

  getProductsAsList(): Observable<ArrayList<Product>> {

    if (!this.products$) this.getProducts();

    return this.products$.pipe(map(
      products => {
        return new ArrayList(products.length, ...products);
      }
    ));

  }

  addProduct(product:Product, featuredImage:Blob):Observable<number> {

    let uploadTask:AngularFireUploadTask;

    //create id
    product.id = this.fs.createId();

    const path = `images/products/${product.id}`;

    //start upload
    uploadTask = this.storage.upload(path, featuredImage);

    //Add to firestore
    uploadTask.then(
      async (snap) => {
        //get download URL
        product.featuredImageUrl = await snap.ref.getDownloadURL();

        try {

          await this.fs.collection(PRODUCT_COLLECTION).doc(product.id).set(product);
          //log success
          this.store.dispatch(new CreateAlert({type: ALERT_TYPES.SUCCESS, title: 'New Product', content: `The new product ${product.name} has been added to Store`}));

        }
        catch(error) {
          //log error
          this.store.dispatch(new CreateAlert({type: ALERT_TYPES.DANGER, title: 'Error', content: `An error occured while adding the product ${product.name}`}))

        }

      }
    );

    //return percent task
    return uploadTask.percentageChanges();

  }

}
