// firebase-config.js

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

const productsCol = db.collection('products');
const ordersCol = db.collection('orders');
const usersCol = db.collection('users');
const feedbackCol = db.collection('feedbacks');

// --- REAL-TIME SYNC TO LOCAL STORAGE ---

// Sync Products
productsCol.onSnapshot(snapshot => {
    let products = [];
    snapshot.forEach(doc => products.push(doc.data()));
    
    // Seed database if empty and we have local data
    if (products.length === 0) {
        const local = JSON.parse(localStorage.getItem('methmi_products'));
        if (local && local.length > 0) {
            local.forEach(p => productsCol.doc(p.id.toString()).set(p));
        }
    } else {
        localStorage.setItem('methmi_products', JSON.stringify(products));
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof renderAdminTable === 'function') renderAdminTable();
    }
});

// Sync Orders
ordersCol.onSnapshot(snapshot => {
    let orders = [];
    snapshot.forEach(doc => orders.push(doc.data()));
    localStorage.setItem('methmi_orders', JSON.stringify(orders));
    
    if (typeof renderOrdersTable === 'function') renderOrdersTable(); // admin.js
    if (typeof renderMyOrders === 'function') renderMyOrders(); // app.js
});

// Sync Users
usersCol.onSnapshot(snapshot => {
    let users = [];
    snapshot.forEach(doc => users.push(doc.data()));
    localStorage.setItem('methmi_users', JSON.stringify(users));
});

// Sync Feedbacks
feedbackCol.onSnapshot(snapshot => {
    let feedbacks = [];
    snapshot.forEach(doc => feedbacks.push(doc.data()));
    localStorage.setItem('methmi_feedbacks', JSON.stringify(feedbacks));
    
    if (typeof renderFeedbacks === 'function') renderFeedbacks(); // admin.js
});

// --- HELPER FUNCTIONS FOR APP TO WRITE TO FIREBASE ---

window.fbSaveProduct = function(product) {
    productsCol.doc(product.id.toString()).set(product);
};

window.fbDeleteProduct = function(id) {
    productsCol.doc(id.toString()).delete();
};

window.fbSaveOrder = function(order) {
    ordersCol.doc(order.id.toString()).set(order);
};

window.fbSaveUser = function(user) {
    usersCol.doc(user.loginId).set(user);
};

window.fbSaveFeedback = function(feedback) {
    feedbackCol.add(feedback);
};
