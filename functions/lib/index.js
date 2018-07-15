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
admin.initializeApp();
const firestore = admin.firestore();
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
 * @param {String} email Email of the user
 * @return {Number} uid of the user
 */
exports.getUserID = functions.https.onCall((email, context) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield admin.auth().getUserByEmail(email);
        return user.uid;
    }
    catch (error) {
        throw new functions.https.HttpsError('not-found', `No user registered with the email ${email}.`);
    }
}));
//# sourceMappingURL=index.js.map