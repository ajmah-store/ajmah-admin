import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { COLLECTIONS } from './constants';

admin.initializeApp();

const firestore = admin.firestore();

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