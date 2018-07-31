import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { COLLECTIONS } from './constants';

//Initialize express
const express = require('express');
const cors = require('cors');
const app = express();

//use cross origin scripts
app.use(cors());

//init admin
const serviceAccount = require("../private/adminKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ajmah-2a334.firebaseio.com"
});

const firestore = admin.firestore();
const auth = admin.auth();

/* Init Razorpay*/

const Razorpay = require("razorpay");
const razorpayKey = require("../private/razorpayKey.json")

const razorpay = new Razorpay(razorpayKey);

/*End Init Razorpay*/

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
                    
                    return {
                        "id": product.id,
                        "title": product.name,
                        "image": product.featuredImageUrl,
                        "price": product.price,
                        "description": product.description,
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

/******************** */
 /* RAZORPAY PAYMENTS */ 
 /******************* */
 
 //ASYNC FUNCTIONS


 /**
  * Create an order
  * @param data data passed via request to api
  */
async function createOrder(data:{currency, address, items, uid}) {

    if(data.uid) {

        //create a new razorpay order
        // const order = await razorpay.orders.create({
        //     amount: data.amount,
        //     currency: data.currency,
        //     receipt: `rec_${new Date().getTime()}`,
        // });

        // const order = await razorpay.orders.fetch('order_Afhj8XupzWR5Ji');

        //if(order.error) throw new functions.https.HttpsError('invalid-argument', order.error.description);

        //crete the invoice which will automatically create an order
        const invoice = await createInvoice(data);

        const order = {
            id: invoice.order_id,
            uid: data.uid,
            amount: invoice.amount,
            currency: data.currency,
            address: data.address,
            items: data.items,
            created_at: invoice.created_at,
            invoice_id: invoice.id,
            state: 'created'
        };

        // //if no error create a document in firestore
        await firestore.collection(COLLECTIONS.ORDERS).doc(invoice.order_id).set(order);
        
        //send order_details back for client processing
        return order;

    }

    else {

        throw new functions.https.HttpsError('unauthenticated', 'You have to be authenticated to send this request');

    }

}//createOrder

/**
 * Create Invoice
 * @param data data passed via request to api
 */
async function createInvoice(order: {currency, address, items, uid}) {

    if(order.uid) {

        //get address from order
        const address = order.address;

        //get items from order as a promise array
        const items = (order.items as any[]).map(

            ({product, quantity}) => {

                return {
                    name: product.name,
                    description: product.description,
                    amount: Math.floor(product.price * (100 - product.discount)/100)*100,
                    currency: "INR",
                    quantity: quantity
                };
            }
            
        );

        //get user's email id
        const email = (await firestore.collection(COLLECTIONS.USERS).doc(order.uid).get()).data().email;

        //create a new razorpay invoice
        const invoice = await razorpay.invoices.create({
            type: 'invoice',
            //expire_by: new Date().getTime() + MONTH,
            customer: {
                name: address.name,
                email: email,
                contact: address.phone,
                billing_address: {
                    line1: `${address.building}, ${address.locality}`,
                    line2: address.landmark,
                    city: address.city,
                    state: address.state,
                    zipcode: address.pin,
                    country: "India"
                }
            },
            line_items: items,
            currency: "INR",
            sms_notify: 1,
            email_notify: 1,
            receipt: `BILL${new Date().getTime()}`,
            comment: `You must show this invoice while recieving the order.`,
            terms: 'For terms and policies visit www.ajmah.com'
        });

        if(invoice.error) throw new functions.https.HttpsError('invalid-argument', invoice.error.description);
        
        //return invoice for processing
        return invoice;

    }

    else {

        throw new functions.https.HttpsError('unauthenticated', 'You have to be authenticated to send this request');

    }

}//createInvoice

async function completePayment(data: {uid, payment_id, amount}) {

    if(data.uid) {

        const payment_details = await razorpay.payments.capture(data.payment_id, data.amount);

        if(payment_details.error) throw new functions.https.HttpsError('invalid-argument', payment_details.error.description);
        
        //send payment details back for client processing
        return payment_details;
    }

    else {

        throw new functions.https.HttpsError('unauthenticated', 'You have to be authenticated to send this request');

    }

}//completePayment

//API

 /**
  * @param {uid, payment_id, amount} data
  */
 app.post('/completePayment', (request, response) => {

    const data = request.body;

    //complete payment
    completePayment(data).then(

        payment_details => response.send(payment_details)

    ).catch(

        error => response.status(400).send({code: 400, message: error.message || error})

    );

 }); //complete payment



/**
 * Create a Razorpay order
 * @param {amount, currency, address, items, uid} data
 */
app.post('/createOrder', (request, response) => {

    const data = request.body;

    createOrder(data).then(

        order => response.send(order)

    ).catch(

        error => response.status(400).send({code: 400, message: error.message || error})
    );

});//create order

/**
 * Create Razorpay Invoice
 * @param {order_id, uid} data 
 * items : { name, description, amount, currency='INR', quantity }
 *
app.post('/createInvoice', (request, response) => {

    const data = request.body;

    createInvoice(data).then(

        invoice => response.send(invoice)

    ).catch(

        error => response.status(400).send({code: 400, message: error.message || error})

    );

});*/


//complete setting up express
export const api = functions.https.onRequest(app);