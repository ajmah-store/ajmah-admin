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
import { AuthService } from './auth.service';
import { UploadMetadata } from '@firebase/storage-types';
import { UploadTaskSnapshot } from 'angularfire2/storage/interfaces';

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
    private store:Store,
    private auth: AuthService
  ) { }


  /**
   * Private Metadata generate function
   */
  private generateMetadata():UploadMetadata {
    return {
      customMetadata: {
        userId: this.auth.userId,
      },
      contentType: 'image/jpeg',
    }
  }

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
   * @returns {Promise} A Promise that resolves once the addition is complete
   */
  async addProduct(product:Product, featuredImage:Blob): Promise<void> {

    try {

      //check if user is authorized or not
      if(!this.auth.authenticated) throw new Error("Unauthorized");

      //create upload task
      let uploadTask:AngularFireUploadTask;

      //create id
      product.id = this.fs.createId();

      //path to store featured image
      const path = `images/products/${product.id}`;

      //metadata
      const metadata = this.generateMetadata();

      //upload featured image to storage
      uploadTask = this.storage.upload(path, featuredImage, metadata);

      //wait for upload to complete
      let snap: UploadTaskSnapshot = await uploadTask.then(snap => snap);

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
   * @return {Promise} A Promise that resolves once deletion is complete
   */
  async deleteProduct(product:Product): Promise<void> {
    
    try {

      //check if authorized or not
      if(!this.auth.authenticated) throw new Error('Unauthorized');

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

  /**
   * Update a product
   * @param {Product} product The product to be updated
   * @param {Blob} featuredImage The new image of the product (if changed)
   * @returns {Promise} A Promise that resolves once upadtion is complete
   */
  async updateProduct(product:Product, featuredImage?:Blob): Promise<void> {

    try {

      //check if authorized or not
      if(!this.auth.authenticated) throw new Error(`Unauthorized`);

      //if image was changed
      if(featuredImage) {
        //create uploadTask
        let uploadTask: AngularFireUploadTask;

        //path to store the image
        const path = `${this.PRODUCT_IMAGE_PATH}/${product.id}`;

        //generate metadata
        const metadata = this.generateMetadata();

        //start upload
        uploadTask = this.storage.upload(path, featuredImage, metadata);

        //wait for the upload to complete
        const snap: UploadTaskSnapshot = await uploadTask.then(snap => snap);

        //set featuredImageUrl
        product.featuredImageUrl = await snap.ref.getDownloadURL();

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

    try {

      //check if authorized or not
      if(!this.auth.authenticated) throw new Error('Unauthorized');

      //create an upload task
      let uploadTask:AngularFireUploadTask;

      //generate an id
      category.id = this.fs.createId();

      //set product count and sales count as 0
      category.productCount = 0;
      category.salesCount = 0;

      //path to store featured image
      const path = `${this.CATEGORY_IMAGE_PATH}/${category.id}`;

      //generate metadata
      const metadata = this.generateMetadata();

      //upload featured image to storage
      uploadTask = this.storage.upload(path, featuredImage, metadata);

      //wait for upload to complete
      const snap:UploadTaskSnapshot = await uploadTask.then(snap => snap);

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

  /**
   * Delete a category from database
   * @param {Category} category The category to be deleted
   * @returns {Promise} A promise that resolves once deletion is complete
   */
  async deleteCategory(category: Category): Promise<void> {

    try {

      //check if authorized or not 
      if(!this.auth.authenticated) throw new Error('Unauthorized');

      //check if category has any products associated with it if so throw an error
      if(category.productCount) throw new Error('Illegal Operation.');

      //delete category from firestore
      await this.fs.collection(CATEGORY_COLLECTION).doc(category.id).delete();

      //path to the image
      const path = `${this.CATEGORY_IMAGE_PATH}/${category.id}`;

      //delete image from storage
      await this.storage.ref(path).delete().toPromise();

      //alert success
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.SUCCESS,
        title: 'Category Deleted',
        content: `The category ${category.name} has been removed from the store.`
      }));

    }

    catch(error) {

      //alert error
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: `An Error occured while deleting the category ${category.name}`
      }));

      //log error
      console.log(error);

      //rethrow error
      throw error;

    }
  }

  /**
   * Update a category
   * @param {Category} category The category to be updated
   * @param {Blob} featuredImage new image of the category (if changed)
   * @returns {Promise} A promise that resolves once the updation is complete
   */
  async updateCategory(category: Category, featuredImage: Blob): Promise<void> {

    try {

      //check if authorized or not
      if(!this.auth.authenticated) throw new Error('Unauthorized access');

      //if image has been changed upload it to storage
      if(featuredImage) {

        //create an upload task
        let uploadTask: AngularFireUploadTask;

        //path to store the image
        const path = `${this.CATEGORY_IMAGE_PATH}/${category.id}`;

        //generate metadata
        const metadata = this.generateMetadata();

        //begin upload
        uploadTask = this.storage.upload(path, featuredImage, metadata);

        //get snapshot of uploadTask once completed
        const snap: UploadTaskSnapshot = await uploadTask.then(snap => snap);

        //set image url of category as downloadURL
        category.imageUrl = await snap.ref.getDownloadURL();

      }

      //update data on firestore
      await this.fs.collection(CATEGORY_COLLECTION).doc(category.id).update(category);

      //alert success
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.SUCCESS,
        title: 'Category Updated',
        content: `Successfully updated the category '${category.name}'`
      }));

    }

    catch(error) {

      //alert error
      this.store.dispatch({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: `An error occured while updating category ${category}`
      });

      //log error
      console.log(error);

      //rethrow error
      throw error;

    }
  }

}
