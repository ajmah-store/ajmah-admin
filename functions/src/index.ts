import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { COLLECTIONS } from './constants';

//Initialize express
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

admin.initializeApp();

const firestore = admin.firestore();

const auth = admin.auth();

/**
 * 
 * @param categoryRef Reference to the category document in firestore.
 * @param change The amount of change to product count.
 */
const changeProductCount = (categoryRef:FirebaseFirestore.DocumentReference, change:number) => {

    return firestore.runTransaction(

        async transaction => {

            try {

                const categoryDoc = await transaction.get(categoryRef);
    
                //check if category exists
                if(!categoryDoc.exists) throw new Error(`Category does not exist for product`);
    
                //decrement product count
                const newProductCount = categoryDoc.data().productCount + change;
                
                //update value on firestore
                transaction.update(categoryRef, { productCount: newProductCount });

            }

            catch(error) {

                //log errors
                console.error(error);

            }

          }
    );
}

/**
 * Increment product count of corresponding category whenever a new product is added.
 */
export const incrementProductCount = functions.firestore.document(`${COLLECTIONS.PRODUCTS}/{productId}`).onCreate(
    (snap, context) => {

        //get product data
        const product = snap.data();

        //find the category corresponding to the product
        const categoryRef = firestore.collection(COLLECTIONS.CATEGORIES).doc(product.category);

        //run a transaction to increment product count
        return changeProductCount(categoryRef, 1);
    }
);

/**
 * Decrement product count from the corresponding category whenever a product is deleted.
 */
export const decrementProductCount = functions.firestore.document(`${COLLECTIONS.PRODUCTS}/{productId}`).onDelete(

    (snap, context) => {
        
        //get product data
        const product = snap.data();

        //find the category corresponding to the product
        const categoryRef = firestore.collection(COLLECTIONS.CATEGORIES).doc(product.category);

        //run a transaction to increment product count
        return changeProductCount(categoryRef, -1);
        
    }
);


export const updateProductCount = functions.firestore.document(`${COLLECTIONS.PRODUCTS}/{productId}`).onUpdate(

    (change, context) => {

        const oldCategory = firestore.collection(COLLECTIONS.CATEGORIES).doc(change.before.data().category);

        const newCategory = firestore.collection(COLLECTIONS.CATEGORIES).doc(change.after.data().category);

        return Promise.all([

            //decrement old category product count
            changeProductCount(oldCategory, -1),
    
            //increment new category product count
            changeProductCount(newCategory, 1)
            
        ]);

    }
    
);


/**
 * Get uid of a user from their email
 * @param {string} email Email of the user
 * @return {number} uid of the user
 */
export const getUserID = functions.https.onCall(
    async (email, context) => {

        try {

            const user = await auth.getUserByEmail(email);

            return user.uid;
        }

        catch(error) {

            throw new functions.https.HttpsError('not-found', `No user registered with the email ${email}.`);

        }
        
    }
);

/**
 * Get product as object
 * @param {number} limit number of products to display
 * @return {Promise} array of products
 */

 export const getLatestProducts = functions.https.onCall(

    async (limit) => {

        try {

            //get all latest products to the limit
            const productsRef = firestore.collection(COLLECTIONS.PRODUCTS).orderBy('createdAt').limit(limit);

            //get snapshot of reference
            const productsSnap = await productsRef.get()

            //get product array from snapshot and map it to an object
            const products = productsSnap.docs.map(

                async productRef => {

                    //read data of products
                    const product = productRef.data();

                    //get category snapshot of each product
                    const categorySnap = await firestore.collection(COLLECTIONS.CATEGORIES).doc(product.category).get();

                    return {
                        ...product,
                        category: categorySnap.data()
                    };

                }
            );

            //return the array of promises as promise of array
            return Promise.all(products);
        }

        catch(error) {

            //log the error
            console.log(error);

            //rethrow error
            throw new functions.https.HttpsError( 'unknown', `An error occured while fetching products.`);

        }
    }

 );//getLatestProduct

 //express app API

 /**
  * searchProduct
  */
 app.get('/searchProduct/:query', 
    async (req, response) => {

        try {

            //get all categories
            const categorySnap = await firestore.collection(COLLECTIONS.CATEGORIES).get();
            const categories = categorySnap.docs;

            //get category data
            const categoriesData = categories.map(

                doc => {

                    const category = doc.data();

                    return {
                        "id": category.id,
                        "title": category.name,
                        "image": category.imageUrl,
                        "description": `${category.name} in Categories`
                    };

                }

            );

            //get all products
            const productSnap = await firestore.collection(COLLECTIONS.PRODUCTS).get();

            //get product data from snapshot
            const productsData = productSnap.docs.map(

                doc => {
                    
                    const product = doc.data();

                    //find category of the product
                    const category = categories.find(cat => (cat.id === product.category)).data();
                    
                    return {
                        "id": product.id,
                        "title": product.name,
                        "image": product.featuredImageUrl,
                        "price": product.price,
                        "description": product.description
                    };
                }
            );

            //get search term regexp from request
            const query = new RegExp(req.params.query, 'i');

            //search the entire product list for matches
            const productRes = productsData.filter(

                data => {

                    //whether product name or description matches
                    return (data.title.match(query) || data.description.match(query));

                }
            );

            //search all categories
            const categoryRes = categoriesData.filter(

                data => {

                    //whether category name matches
                    return data.title.match(query);

                }
            );

            const combinedRes = [...productRes, ...categoryRes];

            response.send({
                results: combinedRes
            });

        }

        catch(error) {

            throw new Error(`Failed to fetch data from database.`);
            
        }

    }
 );

 //complete setting up express
 export const api = functions.https.onRequest(app);