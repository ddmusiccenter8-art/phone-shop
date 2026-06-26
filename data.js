// Default Initial Products
const defaultProducts = [
    { id: 1, name: "iPhone 15 Pro", price: 320000, category: "Mobile Phones", image: "", icon: "📱", warranty: "1 Year", ratings: [], stock: 15 },
    { id: 2, name: "Samsung Galaxy S24", price: 280000, category: "Mobile Phones", image: "", icon: "📱", warranty: "1 Year", ratings: [], stock: 10 },
    { id: 3, name: "MacBook Pro M3", price: 550000, category: "Laptops", image: "", icon: "💻", warranty: "2 Years", ratings: [], stock: 5 },
    { id: 4, name: "Asus ROG Zephyrus", price: 450000, category: "Laptops", image: "", icon: "💻", warranty: "2 Years", ratings: [], stock: 0 },
    { id: 5, name: "Apple AirPods Pro", price: 75000, category: "Accessories", image: "", icon: "🎧", warranty: "6 Months", ratings: [], stock: 20 },
    { id: 6, name: "Samsung Fast Charger", price: 8500, category: "Accessories", image: "", icon: "🔌", warranty: "6 Months", ratings: [], stock: 50 },
    { id: 7, name: "Sony 55' 4K Smart TV", price: 210000, category: "Electronic Items", image: "", icon: "📺", warranty: "3 Years", ratings: [], stock: 8 },
    { id: 8, name: "JBL PartyBox 310", price: 160000, category: "Sound Systems", image: "", icon: "🔊", warranty: "1 Year", ratings: [], stock: 12 },
    { id: 9, name: "Bose SoundLink", price: 45000, category: "Sound Systems", image: "", icon: "🔉", warranty: "1 Year", ratings: [], stock: 0 }
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

