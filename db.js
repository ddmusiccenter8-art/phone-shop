// Firebase Compatibility Layer (v8 syntax) via CDN

const firebaseConfig = {
    apiKey: "AIzaSyAPJV8a_KJhUiLjQmS2iWDj58oQYX0hfVQ",
    authDomain: "methmi-mobile-pvt-ltd-web.firebaseapp.com",
    projectId: "methmi-mobile-pvt-ltd-web",
    storageBucket: "methmi-mobile-pvt-ltd-web.firebasestorage.app",
    messagingSenderId: "180266547289",
    appId: "1:180266547289:web:07ee6818082a76f16a5948",
    measurementId: "G-DL93EFNP4D"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ----------------------------------------------------
// HYBRID SYNC FUNCTIONS (Firebase -> LocalStorage)
// ----------------------------------------------------

async function syncProductsFromFirebase() {
    try {
        const snapshot = await db.collection("products").get();
        const products = [];
        snapshot.forEach(doc => {
            products.push(doc.data());
        });
        if (products.length > 0) {
            localStorage.setItem('VASIZ_products', JSON.stringify(products));
            console.log("Products synced from Firebase!");
        }
    } catch (error) {
        console.error("Error syncing products:", error);
    }
}

async function syncUsersFromFirebase() {
    try {
        const snapshot = await db.collection("users").get();
        const users = [];
        snapshot.forEach(doc => {
            users.push(doc.data());
        });
        if (users.length > 0) {
            localStorage.setItem('VASIZ_users', JSON.stringify(users));
        }
    } catch (error) {
        console.error("Error syncing users:", error);
    }
}

async function syncOrdersFromFirebase() {
    try {
        const snapshot = await db.collection("orders").get();
        const orders = [];
        snapshot.forEach(doc => {
            orders.push(doc.data());
        });
        if (orders.length > 0) {
            localStorage.setItem('VASIZ_orders', JSON.stringify(orders));
        }
    } catch (error) {
        console.error("Error syncing orders:", error);
    }
}

async function syncFeedbacksFromFirebase() {
    try {
        const snapshot = await db.collection("feedbacks").get();
        const feedbacks = [];
        snapshot.forEach(doc => {
            feedbacks.push(doc.data());
        });
        if (feedbacks.length > 0) {
            localStorage.setItem('VASIZ_feedbacks', JSON.stringify(feedbacks));
        }
    } catch (error) {
        console.error("Error syncing feedbacks:", error);
    }
}

// Global initialization sync
async function initialFirebaseSync() {
    console.log("Starting Firebase Sync...");
    await Promise.all([
        syncProductsFromFirebase(),
        syncUsersFromFirebase(),
        syncOrdersFromFirebase(),
        syncFeedbacksFromFirebase()
    ]);
    console.log("Firebase Sync Complete!");
    
    // Dispatch a custom event so other scripts know data is ready
    window.dispatchEvent(new Event('firebaseDataReady'));
}

// Run sync when script loads
initialFirebaseSync();

// ----------------------------------------------------
// HELPER WRITE FUNCTIONS (LocalStorage -> Firebase)
// ----------------------------------------------------

// Use these functions to save data to both places simultaneously

window.fbSaveProduct = function(product) {
    db.collection("products").doc(product.id.toString()).set(product)
        .then(() => console.log("Product saved to Firebase"))
        .catch(err => console.error("Error saving product to Firebase", err));
};

window.fbDeleteProduct = function(productId) {
    db.collection("products").doc(productId.toString()).delete()
        .then(() => console.log("Product deleted from Firebase"))
        .catch(err => console.error("Error deleting product", err));
};

window.fbSaveUser = function(user) {
    db.collection("users").doc(user.loginId).set(user)
        .then(() => console.log("User saved to Firebase"))
        .catch(err => console.error("Error saving user", err));
};

window.fbSaveOrder = function(order) {
    db.collection("orders").doc(order.id.toString()).set(order)
        .then(() => console.log("Order saved to Firebase"))
        .catch(err => console.error("Error saving order", err));
};

window.fbSaveFeedback = function(feedback) {
    db.collection("feedbacks").doc(feedback.id.toString()).set(feedback)
        .then(() => console.log("Feedback saved to Firebase"))
        .catch(err => console.error("Error saving feedback", err));
};
