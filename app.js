// State
// Theme Logic
function applyTheme() {
    const savedTheme = localStorage.getItem('VASIZ_theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && (new Date().getHours() >= 18 || new Date().getHours() < 6));
    
    const icons = document.querySelectorAll('#theme-icon');
    
    if (isDark) {
        document.body.classList.add('dark-mode');
        icons.forEach(icon => {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        });
    } else {
        document.body.classList.remove('dark-mode');
        icons.forEach(icon => {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        });
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        localStorage.setItem('VASIZ_theme', 'light');
    } else {
        localStorage.setItem('VASIZ_theme', 'dark');
    }
    applyTheme();
}
applyTheme();

let cart = [];
let currentUser = JSON.parse(localStorage.getItem('VASIZ_user'));

// Function to render products
function renderProducts(productsToRender = getProducts()) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = ''; // Clear existing content

    // Only show active products to customers
    productsToRender = productsToRender.filter(p => !p.status || p.status === 'active');

    if (productsToRender.length === 0) {
        mainContent.innerHTML = '<div style="background:var(--card-bg); padding:40px; text-align:center; border-radius:8px;"><h3 style="color:var(--text-secondary);">No products found matching your search.</h3></div>';
        return;
    }

    // Get unique categories for rendering main content
    const renderCategories = [...new Set(productsToRender.map(p => p.category))];

    renderCategories.forEach(category => {
        // Create category section
        const section = document.createElement('section');
        section.className = 'category-section';
        section.id = category.toLowerCase().replace(/ /g, '-');
        section.style.background = 'var(--card-bg)';
        section.style.borderRadius = '8px';
        section.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        section.style.marginBottom = '20px';
        section.style.padding = '20px';

        // Create title
        const title = document.createElement('h3');
        title.className = 'category-title';
        title.innerText = category;
        title.style.marginTop = '0';
        title.style.color = 'var(--text-primary)';
        section.appendChild(title);

        // Create grid
        const grid = document.createElement('div');
        grid.className = 'product-grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(170px, 1fr))';
        grid.style.gap = '15px';

        // Filter products for this category
        const categoryProducts = productsToRender.filter(p => p.category === category);

        categoryProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            // Open modal on click
            card.onclick = (e) => {
                if(e.target.tagName !== 'BUTTON') {
                    openProductModal(product);
                }
            };

            const imageSrc = product.image ? product.image : `https://via.placeholder.com/300x200/e2e8f0/475569?text=${product.name.replace(/ /g, '+')}`;
            
            const hasDiscount = product.discount && product.discount > 0;
            const finalPrice = hasDiscount ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;
            
            const badgeHtml = hasDiscount ? `<div style="position:absolute; top:5px; right:5px; background:#ef4444; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; z-index:10;">-${product.discount}%</div>` : '';
            const priceHtml = hasDiscount ? 
                `<p class="product-price" style="color: #ef4444; font-size:1.1rem; font-weight:700; margin-top:5px; margin-bottom:0;">Rs.${finalPrice.toLocaleString()}</p>
                 <p class="product-price" style="text-decoration: line-through; color: #94a3b8; font-size:0.75rem; margin-bottom:0;">Rs.${product.price.toLocaleString()}</p>` :
                `<p class="product-price" style="color: var(--accent-color); font-size:1.1rem; font-weight:700; margin-top:5px; margin-bottom:0;">Rs.${product.price.toLocaleString()}</p>`;

            const vendorTag = product.vendorId ? `<span style="display:inline-block; font-size:0.7rem; color:var(--text-secondary); background:var(--search-bg); padding:2px 5px; border-radius:3px; margin-bottom:5px;">Sold by: ${product.vendorId}</span>` : '';
            const stockHtml = (product.stock === undefined || product.stock > 0) ? 
                `<span style="display:block; color: #10b981; font-size: 0.75rem; font-weight: bold; margin-bottom: 5px;"><i class="fa-solid fa-check-circle"></i> In Stock: ${product.stock !== undefined ? product.stock : 'Available'}</span>` : 
                `<span style="display:block; color: #ef4444; font-size: 0.75rem; font-weight: bold; margin-bottom: 5px;"><i class="fa-solid fa-times-circle"></i> Out of Stock</span>`;
            const btnHtml = (product.stock === undefined || product.stock > 0) ? 
                `<button class="add-to-cart" onclick="addToCart(${product.id})">Add</button>` : 
                `<button class="add-to-cart" style="background:var(--search-bg); color:var(--text-primary); border:1px solid var(--border-color);" onclick="alert('Contacting seller: ${product.vendorId || 'Admin'} for ${product.name}...')"><i class="fa-solid fa-envelope"></i> Contact Seller</button>`;

            card.innerHTML = `
                ${badgeHtml}
                <div style="width:100%; height:150px; overflow:hidden; border-radius:4px; margin-bottom:10px; position:relative;">
                    <img src="${imageSrc}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; transition: transform 0.3s;">
                </div>
                <h4 class="product-name" style="font-size:0.9rem; color:var(--text-primary); margin-bottom:2px; line-height:1.2; height:2.4em; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${product.name}</h4>
                ${vendorTag}
                ${stockHtml}
                <div style="margin-top:auto;">
                    ${priceHtml}
                    ${btnHtml}
                </div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        mainContent.appendChild(section);
    });
}

// Render Flash Sales
function renderFlashSales() {
    const section = document.getElementById('flash-sale');
    const grid = document.getElementById('flash-sale-grid');
    if (!grid || !section) return;
    
    const allProducts = getProducts();
    const flashProducts = allProducts.filter(p => p.discount && p.discount > 0);
    
    if (flashProducts.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    grid.innerHTML = '';
    
    flashProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.border = '1px solid var(--border-color)';
        card.style.boxShadow = 'none';
        card.style.position = 'relative';
        
        card.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                openProductModal(product);
            }
        };

        const discountPrice = Math.floor(product.price * (1 - product.discount / 100));
        const imageSrc = product.image ? product.image : `https://via.placeholder.com/300x200/ef4444/ffffff?text=${product.name.replace(/ /g, '+')}`;

        let avgRating = 0;
        if (product.ratings && product.ratings.length > 0) {
            const sum = product.ratings.reduce((acc, r) => acc + r.score, 0);
            avgRating = (sum / product.ratings.length).toFixed(1);
        }
        
        const warrantyHtml = product.warranty ? `<div style="font-size:0.75rem; color:var(--accent-color); margin-bottom: 2px;"><i class="fa-solid fa-shield-halved"></i> Warranty: ${product.warranty}</div>` : '';
        const ratingHtml = avgRating > 0 ? `<div style="font-size:0.75rem; color:#f59e0b; margin-bottom: 5px;"><i class="fa-solid fa-star"></i> ${avgRating} (${product.ratings.length})</div>` : `<div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom: 5px;">No ratings yet</div>`;
        const stockHtml = (product.stock === undefined || product.stock > 0) ? 
            `<div style="font-size:0.75rem; color:#10b981; margin-bottom: 5px; font-weight:bold;"><i class="fa-solid fa-check-circle"></i> In Stock: ${product.stock !== undefined ? product.stock : 'Available'}</div>` : 
            `<div style="font-size:0.75rem; color:#ef4444; margin-bottom: 5px; font-weight:bold;"><i class="fa-solid fa-times-circle"></i> Out of Stock</div>`;
        const btnHtml = (product.stock === undefined || product.stock > 0) ? 
            `<button class="add-to-cart" style="background:var(--secondary-accent); color:white; border:none;" onclick="addToCart(${product.id})">Add</button>` : 
            `<button class="add-to-cart" style="background:var(--search-bg); color:var(--text-primary); border:1px solid var(--border-color);" onclick="alert('Contacting seller: ${product.vendorId || 'Admin'} for ${product.name}...')"><i class="fa-solid fa-envelope"></i> Contact Seller</button>`;

        card.innerHTML = `
            ${product.discount > 0 ? `<div style="position:absolute; top:5px; right:5px; background:var(--secondary-accent); color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; z-index:10;">-${product.discount}%</div>` : ''}
            <div style="width:100%; height:140px; overflow:hidden; border-radius:4px; margin-bottom:10px; position:relative;">
                <img src="${imageSrc}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <h4 class="product-name" style="font-size:0.85rem; color:var(--text-primary); margin-bottom:2px; line-height:1.2; height:2.4em; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${product.name}</h4>
            ${warrantyHtml}
            ${ratingHtml}
            ${stockHtml}
            <div style="margin-top:auto;">
                <p class="product-price" style="color: var(--secondary-accent); font-size:1.1rem; font-weight:700; margin-top:0px; margin-bottom:0;">Rs.${discountPrice.toLocaleString()}</p>
                ${product.discount > 0 ? `<p class="product-price" style="text-decoration: line-through; color: var(--text-secondary); font-size:0.75rem; margin-bottom:0;">Rs.${product.price.toLocaleString()}</p>` : ''}
                ${btnHtml}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render Categories Circle Grid
function renderCategoriesCircleGrid() {
    const grid = document.getElementById('categories-circle-grid');
    const section = document.getElementById('categories-circle-section');
    if (!grid || !section) return;

    const allProducts = getProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    if (categories.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    grid.innerHTML = '';
    
    // Add "All" Category
    const allDiv = document.createElement('div');
    allDiv.style = "display:flex; flex-direction:column; align-items:center; cursor:pointer; min-width:80px; transition: transform 0.2s;";
    allDiv.onclick = () => {
        renderProducts(getProducts());
        document.getElementById('main-content').scrollIntoView({behavior: 'smooth', block: 'start'});
    };
    allDiv.onmouseover = () => allDiv.style.transform = 'scale(1.05)';
    allDiv.onmouseout = () => allDiv.style.transform = 'scale(1)';
    allDiv.innerHTML = `
        <div style="width:70px; height:70px; border-radius:50%; background:var(--bg-color); display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:8px; border:1px solid var(--border-color);">
            <span style="font-size:2rem; color:var(--text-secondary);">🌟</span>
        </div>
        <span style="font-size:0.8rem; text-align:center; color:var(--text-primary); max-width:80px; line-height:1.2; font-weight:bold;">All</span>
    `;
    grid.appendChild(allDiv);
    
    categories.forEach(cat => {
        // Find one product in this category to use its image/icon
        const prod = allProducts.find(p => p.category === cat);
        
        const catDiv = document.createElement('div');
        catDiv.style = "display:flex; flex-direction:column; align-items:center; cursor:pointer; min-width:80px; transition: transform 0.2s;";
        catDiv.onclick = () => {
            const filtered = getProducts().filter(p => p.category === cat);
            renderProducts(filtered);
            document.getElementById('main-content').scrollIntoView({behavior: 'smooth', block: 'start'});
        };
        
        catDiv.onmouseover = () => catDiv.style.transform = 'scale(1.05)';
        catDiv.onmouseout = () => catDiv.style.transform = 'scale(1)';

        catDiv.innerHTML = `
            <div style="width:70px; height:70px; border-radius:50%; background:var(--bg-color); display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:8px; border:1px solid var(--border-color);">
                <span style="font-size:2rem; color:var(--text-secondary);">${prod.icon || '📦'}</span>
            </div>
            <span style="font-size:0.8rem; text-align:center; color:var(--text-primary); max-width:80px; line-height:1.2;">${cat}</span>
        `;
        grid.appendChild(catDiv);
    });
}

function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-details-content');
    
    const imageSrc = product.image ? product.image : `https://via.placeholder.com/300?text=${product.name.replace(/ /g, '+')}`;
    const descText = product.description ? product.description : `Experience the premium quality of our ${product.category.toLowerCase()}. Designed for performance and style, this is the perfect choice for your daily needs.`;
    
    const hasDiscount = product.discount && product.discount > 0;
    const finalPrice = hasDiscount ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;
    const priceHtml = hasDiscount ? 
        `<div style="display:flex; align-items:end; gap:10px;">
            <span style="color: var(--accent-color); font-size:2rem; font-weight:700;">Rs. ${finalPrice.toLocaleString()}</span>
            <span style="text-decoration: line-through; color: var(--text-secondary); font-size:1.1rem; margin-bottom:5px;">Rs. ${product.price.toLocaleString()}</span>
            <span style="background:var(--secondary-accent); color:white; padding:2px 8px; border-radius:4px; font-size:0.9rem; margin-bottom:6px; font-weight:bold;">-${product.discount}%</span>
        </div>` :
        `<div style="color: var(--accent-color); font-size:2rem; font-weight:700;">Rs. ${product.price.toLocaleString()}</div>`;
        
    let avgRating = 0;
    if (product.ratings && product.ratings.length > 0) {
        const sum = product.ratings.reduce((acc, r) => acc + r.score, 0);
        avgRating = (sum / product.ratings.length).toFixed(1);
    }
    const ratingHtml = avgRating > 0 ? `<span style="color:#f59e0b; font-weight:bold; font-size:1rem;"><i class="fa-solid fa-star"></i> ${avgRating} / 5 <span style="color:var(--text-secondary); font-weight:normal;">(${product.ratings.length} reviews)</span></span>` : `<span style="color:var(--text-secondary); font-size:0.95rem;">No ratings yet</span>`;
    const warrantyHtml = product.warranty ? `<div style="margin-top:20px; font-size:1rem; color:var(--text-primary);"><i class="fa-solid fa-shield-halved" style="color:var(--accent-color); margin-right:8px;"></i> <strong>Warranty:</strong> ${product.warranty}</div>` : '';
    const stockHtml = (product.stock === undefined || product.stock > 0) ? 
        `<div style="margin-top:10px; font-size:1rem; color:#10b981; font-weight:bold;"><i class="fa-solid fa-check-circle" style="margin-right:8px;"></i> In Stock: ${product.stock !== undefined ? product.stock : 'Available'}</div>` : 
        `<div style="margin-top:10px; font-size:1rem; color:#ef4444; font-weight:bold;"><i class="fa-solid fa-times-circle" style="margin-right:8px;"></i> Out of Stock</div>`;

    let specsRows = '';
    if(product.brand) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold; width:40%;">Brand</td><td style="padding:8px; border-bottom:1px solid var(--border-color);">${product.brand}</td></tr>`;
    if(product.condition) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold;">Condition</td><td style="padding:8px; border-bottom:1px solid var(--border-color);">${product.condition}</td></tr>`;
    if(product.weight) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold;">Weight</td><td style="padding:8px; border-bottom:1px solid var(--border-color);">${product.weight}</td></tr>`;
    if(product.dimensions) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold;">Dimensions</td><td style="padding:8px; border-bottom:1px solid var(--border-color);">${product.dimensions}</td></tr>`;
    if(product.packagingSize) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold;">Packaging Size</td><td style="padding:8px; border-bottom:1px solid var(--border-color);">${product.packagingSize}</td></tr>`;
    if(product.expDate) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold;">Expiration Date</td><td style="padding:8px; border-bottom:1px solid var(--border-color); color:#ef4444; font-weight:bold;">${product.expDate}</td></tr>`;
    if(product.manufacturer) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold;">Manufacturer</td><td style="padding:8px; border-bottom:1px solid var(--border-color);">${product.manufacturer}</td></tr>`;
    if(product.pharmacyLicenseUrl) specsRows += `<tr><td style="padding:8px; border-bottom:1px solid var(--border-color); font-weight:bold; color:#10b981;"><i class="fa-solid fa-shield-halved"></i> Pharmacy License</td><td style="padding:8px; border-bottom:1px solid var(--border-color); color:#10b981; font-weight:bold;"><i class="fa-solid fa-check-circle"></i> Verified</td></tr>`;
    
    const specsTableHtml = specsRows ? `<table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:0.95rem; color:var(--text-primary);">${specsRows}</table>` : '';
    const fullDescHtml = encodeURIComponent(specsTableHtml + '<h4 style="color:var(--text-primary);">Description</h4><p>' + descText.replace(/\n/g, '<br>') + '</p>');

    const btnsHtml = (product.stock === undefined || product.stock > 0) ? 
        `<button class="modal-btn cart-btn" onclick="addToCart(${product.id}); document.getElementById('product-modal').style.display='none';"><i class="fa-solid fa-cart-plus" style="margin-right:8px;"></i> Add to Cart</button>
         <button class="modal-btn buy-btn" onclick="addToCart(${product.id}); document.getElementById('product-modal').style.display='none'; openCheckout();">Buy Now</button>` : 
        `<button class="modal-btn" style="background:var(--search-bg) !important; color:var(--text-primary) !important; border:1px solid var(--border-color); cursor:pointer;" onclick="alert('Contacting seller: ${product.vendorId || 'Admin'} for ${product.name}...')"><i class="fa-solid fa-envelope" style="margin-right:8px;"></i> Contact Seller</button>`;

    content.innerHTML = `
        <div style="display:flex; gap:40px; flex-wrap:wrap; align-items:flex-start;" class="product-modal-flex">
            <div style="flex:1; min-width:300px; max-width:400px;">
                <div style="border-radius:12px; overflow:hidden; border:1px solid var(--border-color); background:var(--card-bg); display:flex; justify-content:center; align-items:center; padding:15px;">
                    <img src="${imageSrc}" alt="${product.name}" style="width:100%; max-height:400px; object-fit:contain;">
                </div>
            </div>
            <div class="details-info" style="flex:2; min-width:300px;">
                <h2 style="font-size: 1.8rem; margin-top: 0; margin-bottom: 15px; color:var(--text-primary); font-weight: 700; line-height:1.3;">${product.name}</h2>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                    ${ratingHtml}
                    <span style="color: var(--text-secondary);">|</span>
                    <span style="color: var(--text-secondary);">Category: <span style="color: var(--secondary-accent); font-weight:500;">${product.category}</span></span>
                </div>
                
                <div style="background: var(--search-bg); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    ${priceHtml}
                </div>
                
                ${warrantyHtml}
                ${stockHtml}
                
                <div style="margin-top: 25px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                        <h4 style="margin:0; font-size: 1.1rem; color: var(--text-primary);">Product Details</h4>
                        <button onclick="document.getElementById('full-desc-content').innerHTML = decodeURIComponent('${fullDescHtml}'); document.getElementById('desc-modal').style.display='block';" style="background:none; border:none; color:var(--secondary-accent); cursor:pointer; font-weight:bold; text-decoration:underline; font-size:0.95rem;"><i class="fa-solid fa-expand"></i> View Full Specs</button>
                    </div>
                    <div style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; max-height: 150px; overflow: hidden; position: relative; border:1px solid var(--border-color); padding:15px; border-radius:8px; background:var(--bg-color);">
                        ${descText.replace(/\n/g, '<br>')}
                        <div style="position:absolute; bottom:0; left:0; right:0; height:50px; background:linear-gradient(transparent, var(--bg-color)); pointer-events:none;"></div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 15px; flex-wrap:wrap;">
                    ${btnsHtml}
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

// Function to handle Add to Cart
function addToCart(productId) {
    const allProducts = getProducts();
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        if (product.stock !== undefined && product.stock <= 0) {
            alert("Sorry, this item is currently out of stock.");
            return;
        }

        const finalPrice = (product.discount && product.discount > 0) ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            if (product.stock !== undefined && existingItem.quantity >= product.stock) {
                alert(`Sorry, you cannot add more than ${product.stock} of this item.`);
                return;
            }
            existingItem.quantity += 1;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
        } else {
            cart.push({ ...product, price: finalPrice, originalPrice: product.price, quantity: 1, totalPrice: finalPrice });
        }
        
        document.getElementById('cart-count').innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
        updateCartDisplay();
        alert(`${product.name} has been added to your cart!`);
    }

    // Add a simple animation effect to the cart button
    const cartBtn = document.getElementById('cart-button');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.1)';
        cartBtn.style.backgroundColor = 'var(--accent-color)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
            cartBtn.style.backgroundColor = 'var(--card-bg)';
        }, 200);
    }
}

// Function to render cart contents
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    cartItemsDiv.innerHTML = ''; // Clear previous
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name} <span style="color:var(--text-secondary); font-size:0.8rem;">(x${item.quantity})</span></span>
                <span>Rs. ${itemTotal.toLocaleString()} <button onclick="removeFromCart(${index})" style="background:transparent; border:none; color:#ef4444; font-weight:bold; cursor:pointer; margin-left:15px; font-size:1.1rem;">&times;</button></span>
            `;
            cartItemsDiv.appendChild(div);
        });
    }

    cartTotalPrice.innerText = total.toLocaleString();
}

// Function to remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    document.getElementById('cart-count').innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
    updateCartDisplay();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderFlashSales();
    renderCategoriesCircleGrid();
    updateUserUI();

    // Search functionality
    const searchInput = document.getElementById('search-bar');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const allProducts = getProducts();
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.category.toLowerCase().includes(searchTerm)
            );
            renderProducts(filtered);
        });
    }

    // Modal Logic
    const cartModal = document.getElementById('cart-modal');
    const productModal = document.getElementById('product-modal');
    const authModal = document.getElementById('auth-modal');
    const checkoutModal = document.getElementById('checkout-modal');

    const closeCart = document.getElementById('close-cart');
    const closeProduct = document.getElementById('close-product');
    const closeAuth = document.getElementById('close-auth');
    const closeCheckout = document.getElementById('close-checkout');

    const cartBtn = document.getElementById('cart-button');
    const userBtn = document.getElementById('user-btn');

    if (cartBtn && cartModal) {
        cartBtn.onclick = () => cartModal.style.display = "block";
    }
    if (userBtn && authModal) {
        userBtn.onclick = () => {
            if(!currentUser) authModal.style.display = "block";
            else {
                const dropdown = document.getElementById('user-dropdown');
                if(dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        };
    }

    if (closeCart) closeCart.onclick = () => cartModal.style.display = "none";
    if (closeProduct) closeProduct.onclick = () => productModal.style.display = "none";
    if (closeAuth) closeAuth.onclick = () => authModal.style.display = "none";
    if (closeCheckout) closeCheckout.onclick = () => checkoutModal.style.display = "none";

    window.onclick = function(event) {
        if (event.target == cartModal) cartModal.style.display = "none";
        if (event.target == productModal) productModal.style.display = "none";
        if (event.target == authModal) authModal.style.display = "none";
        if (event.target == checkoutModal) checkoutModal.style.display = "none";
    }

    // Auth Form Submit (Login)
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loginId = document.getElementById('auth-login-id').value;
            const password = document.getElementById('auth-password').value;
            
            if(loginId === 'admin' && password === 'admin123') {
                const adminUser = { loginId: 'admin', name: 'Super Admin', role: 'admin' };
                loginSuccess(adminUser);
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
            const storedUser = users.find(u => u.loginId === loginId && u.password === password);
            
            if(storedUser) {
                if(storedUser.role === 'seller' && storedUser.sellerStatus === 'pending_approval') {
                    alert('Your seller account is pending approval by the Admin. Please wait until your account is approved.');
                    return;
                }
                if(storedUser.role === 'seller' && storedUser.sellerStatus === 'rejected') {
                    alert('Your seller account has been rejected. Please contact support for more information.');
                    return;
                }
                loginSuccess(storedUser);
            } else {
                alert("Invalid Login ID or Password!");
            }
        });
    }

    // Register Form Submit
    const regForm = document.getElementById('reg-form');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const loginId = document.getElementById('reg-login-id').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role').value;
            const cc = document.getElementById('reg-cc').value;
            const phone = document.getElementById('reg-phone').value;
            const address = document.getElementById('reg-address').value;
            const city = document.getElementById('reg-city').value;
            const postal = document.getElementById('reg-postal').value;
            const addressType = document.querySelector('input[name="address-type"]:checked').value;
            
            const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
            if(users.some(u => u.loginId === loginId)) {
                alert("Login ID already exists. Please choose another or Sign In.");
                return;
            }

            const fullPhone = cc + phone;
            const fullAddress = `${address}, ${city} ${postal} (${addressType})`;
            
            // Generate Vendor ID if they are a seller
            let vendorId = null;
            let nicDocUrl = null;
            let tradeDocUrl = null;
            let agreedToTerms = false;
            
            if (role === 'seller') {
                vendorId = 'VEND-' + Math.floor(Math.random() * 100000);
                const termsChecked = document.getElementById('reg-seller-terms').checked;
                if (!termsChecked) {
                    alert("You must agree to the Seller Terms & Conditions.");
                    return;
                }
                agreedToTerms = true;
                
                const readFileAsDataURL = (file) => new Promise((resolve) => {
                    if (!file) return resolve(null);
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                
                const nicFile = document.getElementById('reg-nic-doc').files[0];
                const tradeFile = document.getElementById('reg-trade-doc').files[0];
                nicDocUrl = await readFileAsDataURL(nicFile);
                tradeDocUrl = await readFileAsDataURL(tradeFile);
            }
            
            // Collect bank details if seller
            let bankDetails = null;
            if (role === 'seller') {
                bankDetails = {
                    bankName: document.getElementById('reg-bank-name') ? document.getElementById('reg-bank-name').value : '',
                    branch: document.getElementById('reg-bank-branch') ? document.getElementById('reg-bank-branch').value : '',
                    accountName: document.getElementById('reg-account-name') ? document.getElementById('reg-account-name').value : '',
                    accountNumber: document.getElementById('reg-account-number') ? document.getElementById('reg-account-number').value : ''
                };
            }
            
            const sellerStatus = role === 'seller' ? 'pending_approval' : null;
            const newUser = { loginId, password, name, phone: fullPhone, address: fullAddress, role, vendorId, nicDocUrl, tradeDocUrl, agreedToTerms, bankDetails, sellerStatus, registeredDate: new Date().toLocaleDateString() };
            
            users.push(newUser);
            localStorage.setItem('VASIZ_users', JSON.stringify(users));
            if(window.fbSaveUser) window.fbSaveUser(newUser);
            
            if (role === 'seller') {
                alert('Your seller account has been registered successfully! Your account is now pending approval by the Admin. You will be able to log in once approved.');
                document.getElementById('auth-modal').style.display = 'none';
                regForm.reset();
            } else {
                loginSuccess(newUser);
            }
        });
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('cust-name').value;
            const address = document.getElementById('cust-address').value;
            const cc = document.getElementById('checkout-cc').value;
            const phone = document.getElementById('cust-phone').value;
            const fullPhone = cc + phone;
            
            // Create Order and Deduct Stock
            let total = 0;
            const allProducts = getProducts();
            
            cart.forEach(item => {
                total += item.price * item.quantity;
                // Deduct stock
                const dbProduct = allProducts.find(p => p.id === item.id);
                if (dbProduct && dbProduct.stock !== undefined) {
                    dbProduct.stock -= item.quantity;
                    if (dbProduct.stock < 0) dbProduct.stock = 0;
                }
            });
            saveProducts(allProducts);
            
            const newOrder = {
                id: 'ORD-' + Math.floor(Math.random() * 10000),
                date: new Date().toLocaleDateString(),
                customerName: name,
                customerAddress: address,
                customerPhone: fullPhone,
                items: [...cart],
                total: total,
                status: 'Pending'
            };
            
            const orders = getOrders();
            orders.push(newOrder);
            saveOrders(orders);
            if(window.fbSaveOrder) window.fbSaveOrder(newOrder);
            
            alert(`Thank you, ${name}! Your order ${newOrder.id} has been placed successfully.`);
            
            // Clear cart
            cart = [];
            updateCartDisplay();
            document.getElementById('cart-count').innerText = 0;
            
            // Close modal and reset form
            checkoutModal.style.display = "none";
            checkoutForm.reset();
        });
    }

    // Feedback Form Logic
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('fb-name').value;
            const email = document.getElementById('fb-email').value;
            const message = document.getElementById('fb-message').value;
            
            const newFeedback = {
                date: new Date().toLocaleDateString(),
                name: name,
                email: email,
                message: message
            };
            
            const feedbacks = JSON.parse(localStorage.getItem('VASIZ_feedbacks')) || [];
            feedbacks.push(newFeedback);
            localStorage.setItem('VASIZ_feedbacks', JSON.stringify(feedbacks));
            
            if(window.fbSaveFeedback) window.fbSaveFeedback(newFeedback);
            
            alert("Thank you for your feedback!");
            feedbackForm.reset();
        });
    }
});

function updateUserUI() {
    const userBtnText = document.getElementById('user-btn-text');
    const dropdown = document.getElementById('user-dropdown');
    const userBtn = document.getElementById('user-btn');
    
    // We don't want the userBtn itself to trigger anything directly, 
    // since we hover to see the menu. But clicking can still open login if not logged in.
    if(userBtn) {
        userBtn.onclick = () => {
            if(!currentUser) {
                document.getElementById('auth-modal').style.display = 'block';
            }
        };
    }
    
    if(userBtnText && dropdown) {
        if(currentUser) {
            userBtnText.innerHTML = `<span style="color:#10b981;">${currentUser.name}</span>`;
            
            let dashboardLink = '';
            if (currentUser.role === 'seller') {
                dashboardLink = `<a class="dropdown-item" href="seller.html"><i class="fa-solid fa-shop" style="width:20px; text-align:center; color:var(--accent-color);"></i> Seller Dashboard</a>`;
            } else if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
                dashboardLink = `<a class="dropdown-item" href="admin.html"><i class="fa-solid fa-gauge" style="width:20px; text-align:center; color:var(--accent-color);"></i> Admin Dashboard</a>`;
            }

            dropdown.innerHTML = `
                <div style="padding: 5px 10px; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.85rem;">
                    Welcome back, <br><strong style="color:var(--text-primary); font-size:1rem;">${currentUser.name}</strong>
                </div>
                <hr style="border: none; border-top: 1px solid var(--border-color); margin: 10px 0;">
                ${dashboardLink}
                <a class="dropdown-item" onclick="openMyOrders()"><i class="fa-solid fa-box-open" style="width:20px; text-align:center;"></i> My Orders</a>
                <a class="dropdown-item" onclick="logoutUser()"><i class="fa-solid fa-arrow-right-from-bracket" style="width:20px; text-align:center; color:#ef4444;"></i> <span style="color:#ef4444;">Logout</span></a>
            `;
        } else {
            userBtnText.innerHTML = `Sign in / Register`;
            
            dropdown.innerHTML = `
                <div style="margin-bottom: 15px; text-align: center;">
                    <button class="cta-button" style="width: 100%; background: var(--text-primary); color: white; padding: 10px; margin-bottom: 10px;" onclick="document.getElementById('auth-modal').style.display='block'">Sign in</button>
                    <a href="#" style="color: var(--accent-color); text-decoration: none; font-size: 0.9rem; font-weight: 500;" onclick="document.getElementById('auth-modal').style.display='block'">Register</a>
                </div>
                <hr style="border: none; border-top: 1px solid var(--border-color); margin: 10px 0;">
                <a class="dropdown-item" onclick="document.getElementById('auth-modal').style.display='block'"><i class="fa-solid fa-box-open" style="width:20px; text-align:center;"></i> My Orders</a>
            `;
        }
    }
}

function toggleSellerRegFields() {
    const role = document.getElementById('reg-role').value;
    const sellerFields = document.getElementById('seller-reg-fields');
    if(sellerFields) {
        if(role === 'seller') {
            sellerFields.style.display = 'flex';
            document.getElementById('reg-nic-doc').required = true;
            document.getElementById('reg-trade-doc').required = true;
            document.getElementById('reg-seller-terms').required = true;
        } else {
            sellerFields.style.display = 'none';
            document.getElementById('reg-nic-doc').required = false;
            document.getElementById('reg-trade-doc').required = false;
            document.getElementById('reg-seller-terms').required = false;
        }
    }
}

function logoutUser() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('VASIZ_user');
        currentUser = null;
        updateUserUI();
        // hide dropdown immediately
        document.getElementById('user-dropdown').style.display = 'none';
        setTimeout(() => { document.getElementById('user-dropdown').style.display = ''; }, 100);
        alert("Logged out successfully!");
    }
}

// Function to open checkout modal
function openCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    // Calculate total
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('checkout-total').innerText = total.toLocaleString();
    
    // Auto-fill customer details if logged in
    if(currentUser) {
        const nameInput = document.getElementById('cust-name');
        const phoneInput = document.getElementById('cust-phone');
        if(nameInput) nameInput.value = currentUser.name;
        if(phoneInput) phoneInput.value = currentUser.phone;
    }
    
    // Hide cart modal, show checkout modal
    document.getElementById('cart-modal').style.display = "none";
    document.getElementById('checkout-modal').style.display = "block";
}

function openMyOrders() {
    document.getElementById('user-dropdown').style.display = 'none'; // hide dropdown
    setTimeout(() => { document.getElementById('user-dropdown').style.display = ''; }, 100);
    renderMyOrders();
    document.getElementById('orders-modal').style.display = 'block';
}

// Auth Logic
function switchAuthTab(tab) {
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.remove('active');
    
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-register').style.display = 'none';
    
    if(tab === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('form-login').style.display = 'block';
    } else {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('form-register').style.display = 'block';
    }
}

function mockSocialLogin(provider) {
    alert(`Connecting to ${provider}... (This is a placeholder. Server integration required for real OAuth).`);
    const mockUser = {
        name: `${provider} User`,
        phone: '0000000000',
        address: 'Social Login Address'
    };
    loginSuccess(mockUser);
}

function loginSuccess(userObj) {
    localStorage.setItem('VASIZ_user', JSON.stringify(userObj));
    currentUser = userObj;
    document.getElementById('auth-modal').style.display = 'none';
    updateUserUI();
    alert(`Welcome back, ${userObj.name}!`);
    
    // Redirect based on role
    if(userObj.role === 'admin') {
        window.location.href = 'admin.html';
    } else if(userObj.role === 'seller') {
        window.location.href = 'seller.html';
    }
}

function forgotPassword() {
    const loginId = prompt("Enter your Login ID (Email or Username):");
    if (!loginId) return;

    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const userIndex = users.findIndex(u => u.loginId === loginId);

    if (userIndex === -1) {
        alert("Account not found. Please check your Login ID.");
        return;
    }

    const phone = prompt("Enter the Phone Number registered with this account for verification:");
    if (!phone) return;

    if (users[userIndex].phone === phone || users[userIndex].phone.includes(phone)) {
        // Generate 6-digit Mock OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        // Simulate sending SMS
        alert(`[SIMULATED SMS]\nTo: ${phone}\nMessage: Your Vasiz password reset OTP is: ${otp}\n(Do not share this with anyone)`);
        
        const enteredOtp = prompt(`We have sent a 6-digit OTP to ${phone}.\nPlease enter the OTP below:`);
        
        if (enteredOtp && enteredOtp.trim() === otp.toString()) {
            const newPassword = prompt("OTP Verification successful! \n\nEnter your new password:");
            if (newPassword && newPassword.length > 3) {
                users[userIndex].password = newPassword;
                localStorage.setItem('VASIZ_users', JSON.stringify(users));
                alert("Password reset successfully! You can now sign in.");
            } else {
                alert("Password reset cancelled or invalid password.");
            }
        } else {
            alert("Verification failed. The OTP you entered is incorrect.");
        }
    } else {
        alert("Verification failed. The phone number does not match our records.");
    }
}

function renderMyOrders() {
    const list = document.getElementById('orders-list');
    if(!list) return;
    
    if(!currentUser) {
        list.innerHTML = '<p>Please login to view your orders.</p>';
        return;
    }
    
    const allOrders = getOrders();
    const myOrders = allOrders.filter(o => o.customerPhone === currentUser.phone || o.customerName === currentUser.name);
    
    if(myOrders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">You have no orders yet.</p>';
        return;
    }
    
    list.innerHTML = '';
    // Reverse to show newest first
    myOrders.reverse().forEach(order => {
        const itemNames = order.items.map(i => i.name).join(', ');
        
        let statusColor = '#f59e0b'; // Pending (orange)
        let progress = 0;
        let pColor = '#e2e8f0'; // default border
        let prColor = '#e2e8f0'; 
        let sColor = '#e2e8f0';
        let dColor = '#e2e8f0';

        if(order.status === 'Pending') {
            progress = 12.5; 
            pColor = 'var(--secondary-accent)';
        } else if(order.status === 'Processing') {
            statusColor = '#3b82f6'; 
            progress = 37.5; 
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)';
        } else if(order.status === 'Shipped') {
            statusColor = '#8b5cf6'; 
            progress = 62.5;
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)'; 
            sColor = 'var(--secondary-accent)';
        } else if(order.status === 'Delivered') {
            statusColor = '#10b981'; 
            progress = 100;
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)'; 
            sColor = 'var(--secondary-accent)'; 
            dColor = 'var(--secondary-accent)';
        }
        
        const itemNamesHtml = order.items.map(i => {
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span>${i.name}</span>
                    <button onclick="rateProduct(${i.id})" style="background:var(--accent-color); color:white; border:none; padding:4px 10px; border-radius:15px; font-size:0.75rem; cursor:pointer;">Rate Item</button>
                </div>
            `;
        }).join('');

        const div = document.createElement('div');
        div.style = `border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 15px; background: var(--search-bg);`;
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                <strong style="color:var(--text-primary); font-size:1.1rem;">${order.id}</strong>
                <span style="background:${statusColor}; color:white; padding:4px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">${order.status}</span>
            </div>
            <p style="margin:5px 0; color:var(--text-secondary); font-size:0.9rem;"><strong>Date:</strong> ${order.date}</p>
            <div style="margin:10px 0; color:var(--text-secondary); font-size:0.9rem;">
                <strong>Items:</strong>
                <div style="margin-top:5px; padding:10px; background:var(--card-bg); border-radius:5px;">
                    ${itemNamesHtml}
                </div>
            </div>
            <p style="margin:5px 0; color:var(--secondary-accent); font-size:1.1rem; font-weight:bold;"><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
            
            <!-- Tracking Timeline -->
            <div style="margin-top: 25px; position: relative;">
                <div style="position:absolute; top:12px; left:12.5%; right:12.5%; height:4px; background:var(--border-color); z-index:1;"></div>
                <div style="position:absolute; top:12px; left:12.5%; width:${progress - 12.5}%; height:4px; background:var(--secondary-accent); z-index:2; transition: width 0.5s;"></div>
                
                <div style="display:flex; justify-content:space-between; position:relative; z-index:3;">
                    <div style="text-align:center; width:25%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${pColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-clipboard-list"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Pending</p>
                    </div>
                    <div style="text-align:center; width:25%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${prColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-box-open"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Processing</p>
                    </div>
                    <div style="text-align:center; width:25%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${sColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-truck-fast"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Shipped</p>
                    </div>
                    <div style="text-align:center; width:25%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${dColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-house-circle-check"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Delivered</p>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Function to handle product rating
function rateProduct(productId) {
    if (!currentUser) {
        alert("Please login to rate products.");
        return;
    }
    
    let score = prompt("Rate this product from 1 to 5 stars (Enter a number between 1 and 5):");
    if (!score) return;
    score = parseInt(score);
    if (isNaN(score) || score < 1 || score > 5) {
        alert("Invalid rating! Please enter a number between 1 and 5.");
        return;
    }
    
    const comment = prompt("Add an optional comment/review for this product:") || "";
    
    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        if (!products[productIndex].ratings) {
            products[productIndex].ratings = [];
        }
        
        // Add new rating
        products[productIndex].ratings.push({
            user: currentUser.name,
            score: score,
            comment: comment,
            date: new Date().toLocaleDateString()
        });
        
        saveProducts(products);
        alert(`Thank you for rating ${products[productIndex].name} with ${score} stars!`);
        
        // Refresh products to show updated rating
        if (typeof renderAllCategories === 'function') {
            document.getElementById('product-list').innerHTML = '';
            renderAllCategories();
        }
    } else {
        alert("Product not found.");
    }
}

// --- Mobile Full Screen Menu Logic ---
function openMobileCategories() {
    const menu = document.getElementById('mobile-categories-menu');
    const list = document.getElementById('mobile-categories-list');
    if (!menu || !list) return;
    
    const allProducts = getProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    list.innerHTML = '';
    categories.forEach(cat => {
        const a = document.createElement('a');
        a.className = 'mobile-category-item';
        a.href = '#' + cat.toLowerCase().replace(/ /g, '-');
        a.innerHTML = `<i class="fa-solid fa-angle-right" style="margin-right: 10px; color: var(--accent-color);"></i> ${cat}`;
        a.onclick = () => { closeMobileCategories(); };
        list.appendChild(a);
    });
    
    menu.style.display = 'flex';
}

function closeMobileCategories() {
    const menu = document.getElementById('mobile-categories-menu');
    if (menu) menu.style.display = 'none';
}

