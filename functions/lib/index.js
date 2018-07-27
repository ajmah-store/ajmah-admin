"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants_1 = require("./constants");
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
const changeProductCount = (categoryRef, change) => {
    return firestore.runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
        try {
            const categoryDoc = yield transaction.get(categoryRef);
            //check if category exists
            if (!categoryDoc.exists)
                throw new Error(`Category does not exist for product`);
            //decrement product count
            const newProductCount = categoryDoc.data().productCount + change;
            //update value on firestore
            transaction.update(categoryRef, { productCount: newProductCount });
        }
        catch (error) {
            //log errors
            console.error(error);
        }
    }));
};
/**
 * Increment product count of corresponding category whenever a new product is added.
 */
exports.incrementProductCount = functions.firestore.document(`${constants_1.COLLECTIONS.PRODUCTS}/{productId}`).onCreate((snap, context) => {
    //get product data
    const product = snap.data();
    //find the category corresponding to the product
    const categoryRef = firestore.collection(constants_1.COLLECTIONS.CATEGORIES).doc(product.category);
    //run a transaction to increment product count
    return changeProductCount(categoryRef, 1);
});
/**
 * Decrement product count from the corresponding category whenever a product is deleted.
 */
exports.decrementProductCount = functions.firestore.document(`${constants_1.COLLECTIONS.PRODUCTS}/{productId}`).onDelete((snap, context) => {
    //get product data
    const product = snap.data();
    //find the category corresponding to the product
    const categoryRef = firestore.collection(constants_1.COLLECTIONS.CATEGORIES).doc(product.category);
    //run a transaction to increment product count
    return changeProductCount(categoryRef, -1);
});
exports.updateProductCount = functions.firestore.document(`${constants_1.COLLECTIONS.PRODUCTS}/{productId}`).onUpdate((change, context) => {
    const oldCategory = firestore.collection(constants_1.COLLECTIONS.CATEGORIES).doc(change.before.data().category);
    const newCategory = firestore.collection(constants_1.COLLECTIONS.CATEGORIES).doc(change.after.data().category);
    return Promise.all([
        //decrement old category product count
        changeProductCount(oldCategory, -1),
        //increment new category product count
        changeProductCount(newCategory, 1)
    ]);
});
/**
 * Get uid of a user from their email
 * @param {string} email Email of the user
 * @return {number} uid of the user
 */
exports.getUserID = functions.https.onCall((email, context) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield auth.getUserByEmail(email);
        return user.uid;
    }
    catch (error) {
        throw new functions.https.HttpsError('not-found', `No user registered with the email ${email}.`);
    }
}));
/**
 * Get product as object
 * @param {number} limit number of products to display
 * @return {Promise} array of products
 */
exports.getLatestProducts = functions.https.onCall((limit) => __awaiter(this, void 0, void 0, function* () {
    try {
        //get all latest products to the limit
        const productsRef = firestore.collection(constants_1.COLLECTIONS.PRODUCTS).orderBy('createdAt').limit(limit);
        //get snapshot of reference
        const productsSnap = yield productsRef.get();
        //get product array from snapshot and map it to an object
        const products = productsSnap.docs.map((productRef) => __awaiter(this, void 0, void 0, function* () {
            //read data of products
            const product = productRef.data();
            //get category snapshot of each product
            const categorySnap = yield firestore.collection(constants_1.COLLECTIONS.CATEGORIES).doc(product.category).get();
            return Object.assign({}, product, { category: categorySnap.data() });
        }));
        //return the array of promises as promise of array
        return Promise.all(products);
    }
    catch (error) {
        //log the error
        console.log(error);
        //rethrow error
        throw new functions.https.HttpsError('unknown', `An error occured while fetching products.`);
    }
})); //getLatestProduct
//express app API
/**
 * searchProduct
 */
app.get('/searchProduct/:query', (req, response) => __awaiter(this, void 0, void 0, function* () {
    try {
        //get all categories
        const categorySnap = yield firestore.collection(constants_1.COLLECTIONS.CATEGORIES).get();
        const categories = categorySnap.docs;
        //get category data
        const categoriesData = categories.map(doc => {
            const category = doc.data();
            return {
                "id": category.id,
                "title": category.name,
                "image": category.imageUrl,
                "description": `${category.name} in Categories`
            };
        });
        //get all products
        const productSnap = yield firestore.collection(constants_1.COLLECTIONS.PRODUCTS).get();
        //get product data from snapshot
        const productsData = productSnap.docs.map(doc => {
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
        });
        //get search term regexp from request
        const query = new RegExp(req.params.query, 'i');
        //search the entire product list for matches
        const productRes = productsData.filter(data => {
            //whether product name or description matches
            return (data.title.match(query) || data.description.match(query));
        });
        //search all categories
        const categoryRes = categoriesData.filter(data => {
            //whether category name matches
            return data.title.match(query);
        });
        const combinedRes = [...productRes, ...categoryRes];
        response.send({
            results: combinedRes
        });
    }
    catch (error) {
        throw new Error(`Failed to fetch data from database.`);
    }
}));
//complete setting up express
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map