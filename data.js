// Default Initial Products
const defaultProducts = [
    { id: 1, name: "iPhone 15 Pro", price: 320000, category: "Electronics", image: "", icon: "📱", warranty: "1 Year", ratings: [], stock: 15 },
    { id: 2, name: "Men's Casual T-Shirt", price: 2500, category: "Fashion & Apparel", image: "", icon: "👕", warranty: "No Warranty", ratings: [], stock: 100 },
    { id: 3, name: "MacBook Pro M3", price: 550000, category: "Electronics", image: "", icon: "💻", warranty: "2 Years", ratings: [], stock: 5 },
    { id: 4, name: "Organic Arabica Coffee (500g)", price: 4500, category: "Groceries", image: "", icon: "☕", warranty: "No Warranty", ratings: [], stock: 50 },
    { id: 5, name: "Nike Running Shoes", price: 25000, category: "Sports & Outdoors", image: "", icon: "👟", warranty: "6 Months", ratings: [], stock: 20 },
    { id: 6, name: "Premium Bed Sheet Set", price: 8500, category: "Home & Garden", image: "", icon: "🛏️", warranty: "No Warranty", ratings: [], stock: 50 },
    { id: 7, name: "Sony 55' 4K Smart TV", price: 210000, category: "Electronics", image: "", icon: "📺", warranty: "3 Years", ratings: [], stock: 8 },
    { id: 8, name: "Adjustable Dumbbell Set", price: 16000, category: "Sports & Outdoors", image: "", icon: "🏋️", warranty: "1 Year", ratings: [], stock: 12 },
    { id: 9, name: "Stainless Steel Blender", price: 14500, category: "Home & Garden", image: "", icon: "🥤", warranty: "1 Year", ratings: [], stock: 30 }
];

// Initialize Local Storage if empty
if (!localStorage.getItem('VASIZ_products')) {
    localStorage.setItem('VASIZ_products', JSON.stringify(defaultProducts));
}

// Function to get products
function getProducts() {
    return JSON.parse(localStorage.getItem('VASIZ_products'));
}

// Function to save products
function saveProducts(products) {
    localStorage.setItem('VASIZ_products', JSON.stringify(products));
}

// Order Management Functions
function getOrders() {
    const orders = localStorage.getItem('VASIZ_orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('VASIZ_orders', JSON.stringify(orders));
}

