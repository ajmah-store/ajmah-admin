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


  private readonly PRODUCT_IMAGE_PATH:string = "images/products";
  private readonly CATEGORY_IMAGE_PATH:string = "images/categories";

  constructor(
    private fs: AngularFirestore,
    private storage: AngularFireStorage,
    private store:Store
  ) { }

    /**
   * Return all categories from the database wrapped as Observable
   */
  getCategories():Observable<Category[]> {

    //check if categories already exists if not fetch from firestore
    if( !this.categories$ ) this.categories$ = this.fs.collection(CATEGORY_COLLECTION).valueChanges() as Observable<Category[]>;

    //return categories
    return this.categories$;

  }

  /**
   * Return all categories in database as Observable of Map with category.id mapped to category
   */
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

  /**
   * Return all categories from the database as ArrayList wrapped as Observable
   */
  getCategoriesAsList():Observable<ArrayList<Category>> {

    if (!this.categories$) this.getCategories();

    //map observable to convert array to list
    return this.categories$.pipe(map(
      categories => {
        //create arraylist for array
        return new ArrayList<Category>(categories.length, ...categories)
      }
    ));

  }

  /**
   * Return all products from the database wrapped as Observable
   */
  getProducts():Observable<Product[]> {

    //check if products already exists if not fetch from firestore
    if( !this.products$ ) this.products$ = this.fs.collection(PRODUCT_COLLECTION, ref => ref.orderBy('category','asc')).valueChanges() as Observable<Product[]>;

    //return products
    return this.products$;

  }

  /**
   * Returns products as an ArrayList wrapped as Observable
   */
  getProductsAsList(): Observable<ArrayList<Product>> {

    if (!this.products$) this.getProducts();

    //map observable to convert array to list
    return this.products$.pipe(map(
      products => {
        //create list
        return new ArrayList(products.length, ...products);
      }
    ));

  }

  /**
   * Add a product to database.
   * @param {Product} product Product to be added
   * @param {Blob} featuredImage featured image to be tagged with the product
   * @returns Observable that tracks task progress
   */
  async addProduct(product:Product, featuredImage:Blob): Promise<void> {

    let uploadTask:AngularFireUploadTask;

    //create id
    product.id = this.fs.createId();

    //path to store featured image
    const path = `images/products/${product.id}`;

    //upload featured image to storage
    uploadTask = this.storage.upload(path, featuredImage);

    try {

      //wait for upload to complete
      let snap = await uploadTask.then(snap => snap);

      //get download URL of image
      product.featuredImageUrl = await snap.ref.getDownloadURL();

      //add to firestore
      await this.fs.collection(PRODUCT_COLLECTION).doc(product.id).set(product);
      
      //alert success message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.SUCCESS, 
        title: 'New Product', 
        content: `The new product ${product.name} has been added to Store`
      }));

    }
    
    catch(error) {
      //alert error message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error', 
        content: `An error occured while adding the product ${product.name}. ${error.message}`
      }));

      console.log(error);

      throw error;

    }

    
  }

  /**
   * Delete a product from the database.
   * @param {Product} product Product to be deleted
   * @return an empty Promise 
   */
  async deleteProduct(product:Product): Promise<void> {
    
    try {

      //remove the product from database
      await this.fs.collection(PRODUCT_COLLECTION).doc(product.id).delete();

      //path of image in the storage
      const path = `${this.PRODUCT_IMAGE_PATH}/${product.id}`;

      //delete the image from storage
      await this.storage.ref(path).delete().toPromise();

      //alert success
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.SUCCESS,
        title: 'Product Deleted',
        content: `The product ${product.name} has been removed from the store.`
      }));

    }

    catch(error) {

      //alert error message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error', 
        content: `An error occured while deleting the product ${product.name}.`
      }));

      //log error
      console.log(error);

      //throw the error back
      throw error;

    }
    
  }


  async updateProduct(product:Product, featuredImage?:Blob): Promise<void> {

    try {

      //if image was changed
      if(featuredImage) {
        //create uploadTask
        let uploadTask: AngularFireUploadTask;

        //path to store the image
        const path = `${this.PRODUCT_IMAGE_PATH}/${product.id}`;

        //start upload
        uploadTask = this.storage.upload(path, featuredImage);

        //wait for the upload to complete
        let snap = await uploadTask.then(snap => snap);

        //set featuredImageUrl
        product.featuredImageUrl = snap.getDownloadURL();

      }

      //update in firestore
      this.fs.collection(PRODUCT_COLLECTION).doc(product.id).update(product);

      //alert success message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.SUCCESS,
        title: 'Product Updated',
        content: `Successfully updated the product ${product.name}`
      }));

    }

    catch(error) {

      //alert error message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: `An Error occured while updating the product ${product.name}.`
      }));

      //log error
      console.log(error);

      //throw the error back
      throw error;

    }

  }



  /**
   * Add a category to database
   * @param {Category} category Category to be added
   * @param {Blob} featuredImage image to be attached with the category
   * @return Observable that tracks task progress
   */
  async addCategory(category:Category, featuredImage: Blob): Promise<void> {

    //create an upload task
    let uploadTask:AngularFireUploadTask;

    //generate an id
    category.id = this.fs.createId();

    //set product count and sales count as 0
    category.productCount = 0;
    category.salesCount = 0;

    //path to store featured image
    const path = `${this.CATEGORY_IMAGE_PATH}/${category.id}`;

    //upload featured image to storage
    uploadTask = this.storage.upload(path, featuredImage);

    

    try {

      //wait for upload to complete
      let snap = await uploadTask.then(snap => snap);
      //get download URL of featured image
      category.imageUrl = await snap.ref.getDownloadURL();

      //add to firestore
      await this.fs.collection(CATEGORY_COLLECTION).doc(category.id).set(category);

      //alert success message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.SUCCESS,
        title: 'New Category',
        content: `The new category ${category.name} has been added to store`
      }));

    }

    catch(error) {

      //alert error message
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: `An Error occured while adding the category ${category.name}`
      }));

      //log error
      console.log(error);

      //throw the error back
      throw error;

    }

  }

}
