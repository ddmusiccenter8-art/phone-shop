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

    // Start Timer if not already started
    if (!window.flashTimerInterval) {
        window.flashTimerInterval = setInterval(() => {
            const timerSpan = document.getElementById('flash-timer');
            if (timerSpan) {
                const now = new Date();
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                const diff = endOfDay - now;
                if (diff > 0) {
                    const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                    const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                    timerSpan.innerText = `${h}:${m}:${s}`;
                }
            }
        }, 1000);
    }
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
    // Track Recently Viewed
    addToRecentlyViewed(product.id);
    
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

    let ratingsListHtml = '';
    if (product.ratings && product.ratings.length > 0) {
        ratingsListHtml = product.ratings.map(r => `
            <div style="border-bottom: 1px solid var(--border-color); padding: 10px 0; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between;">
                    <strong style="color:var(--text-primary); font-size:0.9rem;">${r.user}</strong>
                    <span style="color:var(--text-secondary); font-size:0.8rem;">${r.date}</span>
                </div>
                <div style="color:#f59e0b; font-size:0.8rem; margin:5px 0;">${'⭐'.repeat(r.score)}</div>
                <p style="color:var(--text-secondary); font-size:0.9rem; margin:5px 0;">${r.comment}</p>
                ${r.photo ? `<img src="${r.photo}" style="max-height:80px; border-radius:4px; margin-top:5px; border:1px solid var(--border-color);">` : ''}
            </div>
        `).join('');
    } else {
        ratingsListHtml = `<p style="color:var(--text-secondary); font-size:0.9rem;">No reviews yet. Be the first to review!</p>`;
    }

    content.innerHTML = `
        <div style="display:flex; gap:40px; flex-wrap:wrap; align-items:flex-start;" class="product-modal-flex">
            <div style="flex:1; min-width:300px; max-width:400px;">
                <div style="border-radius:12px; overflow:hidden; border:1px solid var(--border-color); background:var(--card-bg); display:flex; justify-content:center; align-items:center; padding:15px;">
                    <img src="${imageSrc}" alt="${product.name}" style="width:100%; max-height:400px; object-fit:contain;">
                </div>
                <div style="margin-top:20px; background:var(--search-bg); padding:15px; border-radius:8px; border:1px solid var(--border-color); max-height:300px; overflow-y:auto;">
                    <h4 style="margin-top:0; color:var(--text-primary);">Customer Reviews</h4>
                    ${ratingsListHtml}
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
                
                <!-- Variant Selection -->
                <div style="margin-top: 20px; padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color);">
                    <h4 style="margin-top: 0; margin-bottom: 10px; font-size: 1rem; color: var(--text-primary);">Select Options</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                        <div style="flex:1; min-width: 120px;">
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 5px;">Size</label>
                            <select id="variant-size" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--search-bg); color: var(--text-primary);">
                                <option value="Standard">Standard</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                        <div style="flex:1; min-width: 120px;">
                            <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 5px;">Color</label>
                            <select id="variant-color" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--search-bg); color: var(--text-primary);">
                                <option value="Default">Default</option>
                                <option value="Black">Black</option>
                                <option value="White">White</option>
                                <option value="Silver">Silver</option>
                            </select>
                        </div>
                    </div>
                </div>
                
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

        const sizeEl = document.getElementById('variant-size');
        const colorEl = document.getElementById('variant-color');
        let selectedSize = 'Standard';
        let selectedColor = 'Default';
        
        if (document.getElementById('product-modal').style.display !== 'none') {
            selectedSize = sizeEl ? sizeEl.value : 'Standard';
            selectedColor = colorEl ? colorEl.value : 'Default';
        }

        const cartItemId = `${productId}-${selectedSize}-${selectedColor}`;
        const finalPrice = (product.discount && product.discount > 0) ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;
        
        const existingItem = cart.find(item => item.cartItemId === cartItemId);
        if (existingItem) {
            if (product.stock !== undefined && existingItem.quantity >= product.stock) {
                alert(`Sorry, you cannot add more than ${product.stock} of this item.`);
                return;
            }
            existingItem.quantity += 1;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
        } else {
            cart.push({ 
                ...product, 
                cartItemId: cartItemId, 
                selectedSize: selectedSize, 
                selectedColor: selectedColor, 
                price: finalPrice, 
                originalPrice: product.price, 
                quantity: 1, 
                totalPrice: finalPrice 
            });
        }
        
        document.getElementById('cart-count').innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
        updateCartDisplay();
        alert(`${product.name} (${selectedSize}, ${selectedColor}) has been added to your cart!`);
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
                <span>${item.name} <br><small style="color:var(--text-secondary);">${item.selectedSize}, ${item.selectedColor}</small> <span style="color:var(--text-secondary); font-size:0.8rem;">(x${item.quantity})</span></span>
                <span>Rs. ${itemTotal.toLocaleString()} <button onclick="removeFromCart(${index})" style="background:transparent; border:none; color:#ef4444; font-weight:bold; cursor:pointer; margin-left:15px; font-size:1.1rem;">&times;</button></span>
            `;
            cartItemsDiv.appendChild(div);
        });
    }

    cartTotalPrice.innerText = total.toLocaleString();
    updateFreeShippingBar();
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
    renderRecentlyViewed();
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
            const email = document.getElementById('reg-email').value;
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
                
                const faceBase64 = document.getElementById('reg-face-base64') ? document.getElementById('reg-face-base64').value : '';
                const nicBase64 = document.getElementById('reg-nic-base64') ? document.getElementById('reg-nic-base64').value : '';
                const nicBackBase64 = document.getElementById('reg-nicback-base64') ? document.getElementById('reg-nicback-base64').value : '';
                
                if (!faceBase64) {
                    alert("Please capture your Live Face Photo.");
                    return;
                }
                if (!nicBase64) {
                    alert("Please capture your Live NIC Photo (FRONT).");
                    return;
                }
                if (!nicBackBase64) {
                    alert("Please capture your Live NIC Photo (BACK).");
                    return;
                }
                
                agreedToTerms = true;
                
                const readFileAsDataURL = (file) => new Promise((resolve) => {
                    if (!file) return resolve(null);
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                
                const tradeFile = document.getElementById('reg-trade-doc').files[0];
                if(!tradeFile) {
                    alert("Please upload your Trade/Business License (BR).");
                    return;
                }
                
                nicDocUrl = nicBase64; // Use the live photo front
                var nicBackUrl = nicBackBase64;
                tradeDocUrl = await readFileAsDataURL(tradeFile);
                var facePhotoUrl = faceBase64;
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
            const newUser = { loginId, email, password, name, phone: fullPhone, address: fullAddress, role, vendorId, nicDocUrl, nicBackUrl: (typeof nicBackUrl !== 'undefined' ? nicBackUrl : null), tradeDocUrl, facePhotoUrl: (typeof facePhotoUrl !== 'undefined' ? facePhotoUrl : null), agreedToTerms, bankDetails, sellerStatus, registeredDate: new Date().toLocaleDateString() };
            
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
            const paymentMethod = document.getElementById('payment-method') ? document.getElementById('payment-method').value : 'Cash on Delivery';
            
            const newOrder = {
                id: 'ORD-' + Math.floor(Math.random() * 10000),
                trackingId: 'VASIZ-TRK-' + Math.floor(100000 + Math.random() * 900000),
                date: new Date().toLocaleDateString(),
                customerName: name,
                customerAddress: address,
                customerPhone: fullPhone,
                paymentMethod: paymentMethod,
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
        let oColor = '#e2e8f0'; // Out for delivery
        let dColor = '#e2e8f0';

        if(order.status === 'Pending') {
            progress = 10; 
            pColor = 'var(--secondary-accent)';
        } else if(order.status === 'Processing') {
            statusColor = '#3b82f6'; 
            progress = 30; 
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)';
        } else if(order.status === 'Shipped') {
            statusColor = '#8b5cf6'; 
            progress = 50;
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)'; 
            sColor = 'var(--secondary-accent)';
        } else if(order.status === 'Out for Delivery') {
            statusColor = '#f97316'; 
            progress = 70;
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)'; 
            sColor = 'var(--secondary-accent)';
            oColor = 'var(--secondary-accent)';
        } else if(order.status === 'Delivered') {
            statusColor = '#10b981'; 
            progress = 100;
            pColor = 'var(--secondary-accent)'; 
            prColor = 'var(--secondary-accent)'; 
            sColor = 'var(--secondary-accent)'; 
            oColor = 'var(--secondary-accent)'; 
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
                <div>
                    <strong style="color:var(--text-primary); font-size:1.1rem; margin-right:10px;">${order.trackingId || order.id}</strong>
                    <button onclick="printCustomerInvoice('${order.id}')" style="background:transparent; border:1px solid var(--accent-color); color:var(--accent-color); padding:3px 8px; border-radius:5px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-file-invoice"></i> Invoice</button>
                    ${order.status === 'Delivered' ? `<button onclick="requestReturn('${order.id}')" style="background:transparent; border:1px solid #f97316; color:#f97316; padding:3px 8px; border-radius:5px; font-size:0.75rem; cursor:pointer; margin-left:5px;"><i class="fa-solid fa-rotate-left"></i> Return</button>` : ''}
                    <button onclick="openDispute('${order.id}')" style="background:transparent; border:1px solid #ef4444; color:#ef4444; padding:3px 8px; border-radius:5px; font-size:0.75rem; cursor:pointer; margin-left:5px;"><i class="fa-solid fa-flag"></i> Dispute</button>
                </div>
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
                <div style="position:absolute; top:12px; left:10%; right:10%; height:4px; background:var(--border-color); z-index:1;"></div>
                <div style="position:absolute; top:12px; left:10%; width:${progress - 10}%; height:4px; background:var(--secondary-accent); z-index:2; transition: width 0.5s;"></div>
                
                <div style="display:flex; justify-content:space-between; position:relative; z-index:3;">
                    <div style="text-align:center; width:20%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${pColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-clipboard-list"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Pending</p>
                    </div>
                    <div style="text-align:center; width:20%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${prColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-box-open"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Processing</p>
                    </div>
                    <div style="text-align:center; width:20%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${sColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-truck-fast"></i></div>
                        <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Shipped</p>
                    </div>
                    <div style="text-align:center; width:20%;">
                        <div style="width:28px; height:28px; border-radius:50%; background:${oColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-motorcycle"></i></div>
                        <p style="font-size:0.7rem; margin-top:5px; color:var(--text-primary); font-weight:bold; line-height:1;">Out for<br>Delivery</p>
                    </div>
                    <div style="text-align:center; width:20%;">
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
    
    document.getElementById('rating-product-id').value = productId;
    setRatingStars(5);
    document.getElementById('rating-comment').value = '';
    document.getElementById('rating-photo').value = '';
    document.getElementById('rating-modal').style.display = 'flex';
}

function setRatingStars(score) {
    document.getElementById('rating-score').value = score;
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById('star-rating-container').children[i-1];
        if (i <= score) {
            btn.style.background = 'var(--accent-color)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'var(--search-bg)';
            btn.style.color = 'var(--text-primary)';
        }
    }
}

async function submitProductRating() {
    const productId = parseInt(document.getElementById('rating-product-id').value);
    const score = parseInt(document.getElementById('rating-score').value);
    const comment = document.getElementById('rating-comment').value.trim();
    const photoInput = document.getElementById('rating-photo');
    
    let photoBase64 = '';
    if (photoInput.files && photoInput.files[0]) {
        photoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photoInput.files[0]);
        });
    }
    
    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        if (!products[productIndex].ratings) {
            products[productIndex].ratings = [];
        }
        
        products[productIndex].ratings.push({
            user: currentUser.name,
            score: score,
            comment: comment,
            photo: photoBase64,
            date: new Date().toLocaleDateString()
        });
        
        saveProducts(products);
        if (window.fbSaveProduct) window.fbSaveProduct(products[productIndex]);
        
        document.getElementById('rating-modal').style.display = 'none';
        alert("Thank you for your review!");
        
        // Re-render product details if open
        if (document.getElementById('product-modal').style.display === 'flex') {
            openProductModal(productId);
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

// ============================
// LIVE CAMERA CAPTURE LOGIC
// ============================
let activeStreams = {};
let currentFacingMode = {
    face: 'user',
    nic: 'environment',
    nicback: 'environment'
};

async function startCamera(type) {
    const video = document.getElementById(`${type}-video`);
    const cameraContainer = document.getElementById(`${type}-camera-container`);
    const startBtn = document.getElementById(`start-${type}-btn`);
    
    // Stop any existing stream for this type
    stopCamera(type);
    
    try {
        const mode = currentFacingMode[type] || 'user';
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
        video.srcObject = stream;
        activeStreams[type] = stream;
        
        cameraContainer.style.display = 'flex';
        startBtn.style.display = 'none';
    } catch (err) {
        console.error("Camera access error:", err);
        // Fallback to default if environment fails (e.g., desktop webcam)
        if (currentFacingMode[type] === 'environment') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                activeStreams[type] = stream;
                cameraContainer.style.display = 'flex';
                startBtn.style.display = 'none';
                return;
            } catch (fallbackErr) {
                console.error("Fallback camera error:", fallbackErr);
            }
        }
        alert("Unable to access camera. Please make sure you have a camera and have granted browser permissions.");
    }
}

function switchCamera(type) {
    currentFacingMode[type] = currentFacingMode[type] === 'user' ? 'environment' : 'user';
    startCamera(type);
}

function capturePhoto(type) {
    const video = document.getElementById(`${type}-video`);
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById(`${type}-preview`);
    const cameraContainer = document.getElementById(`${type}-camera-container`);
    const previewContainer = document.getElementById(`${type}-preview-container`);
    const hiddenInput = document.getElementById(`reg-${type}-base64`);
    
    if (!video.srcObject) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // 0.8 quality to save space
    
    // Set preview and hidden input
    preview.src = dataUrl;
    hiddenInput.value = dataUrl;
    
    // Stop camera stream
    stopCamera(type);
    
    // Switch UI
    cameraContainer.style.display = 'none';
    previewContainer.style.display = 'flex';
}

function retakePhoto(type) {
    document.getElementById(`${type}-preview-container`).style.display = 'none';
    document.getElementById(`reg-${type}-base64`).value = '';
    startCamera(type);
}

function stopCamera(type) {
    if (activeStreams[type]) {
        activeStreams[type].getTracks().forEach(track => track.stop());
        delete activeStreams[type];
    }
}

// Ensure cameras stop if modal is closed
const origCloseModal = window.onclick;
window.onclick = function(event) {
    if (event.target.classList && event.target.classList.contains('modal')) {
        stopCamera('face');
        stopCamera('nic');
    }
    if (origCloseModal) origCloseModal(event);
}

// Render Desktop Sidebar Categories
function renderDesktopSidebar() {
    const list = document.getElementById('desktop-category-list');
    if (!list) return;
    
    const allProducts = getProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    list.innerHTML = '';
    
    categories.forEach(cat => {
        // Find one product in this category to get the icon, or use a default
        const prod = allProducts.find(p => p.category === cat);
        const icon = prod && prod.icon ? prod.icon : '📌';
        
        const li = document.createElement('li');
        li.innerHTML = `<span>${icon} &nbsp; ${cat}</span> <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; color:var(--text-secondary);"></i>`;
        li.onclick = () => {
            const filtered = getProducts().filter(p => p.category === cat);
            renderProducts(filtered);
            document.getElementById('main-content').scrollIntoView({behavior: 'smooth', block: 'start'});
        };
        list.appendChild(li);
    });
}

// Call init functions globally when script loads
if (document.getElementById('desktop-category-list')) {
    renderDesktopSidebar();
}

// Track Order Lookup
function trackOrderLookup() {
    const input = document.getElementById('track-id-input').value.trim();
    const container = document.getElementById('track-result-container');
    if(!input) {
        alert("Please enter a Tracking ID");
        return;
    }
    
    const orders = getOrders();
    const order = orders.find(o => o.trackingId === input || o.id === input);
    
    if(!order) {
        container.style.display = 'block';
        container.innerHTML = `<p style="color:#ef4444; font-weight:bold;"><i class="fa-solid fa-circle-exclamation"></i> No order found with Tracking ID: ${input}</p>`;
        return;
    }
    
    let statusColor = '#f59e0b';
    let progress = 10;
    let pColor = 'var(--secondary-accent)';
    let prColor = '#e2e8f0'; 
    let sColor = '#e2e8f0';
    let oColor = '#e2e8f0';
    let dColor = '#e2e8f0';

    if(order.status === 'Processing') {
        statusColor = '#3b82f6'; progress = 30; 
        prColor = 'var(--secondary-accent)';
    } else if(order.status === 'Shipped') {
        statusColor = '#8b5cf6'; progress = 50;
        prColor = 'var(--secondary-accent)'; sColor = 'var(--secondary-accent)';
    } else if(order.status === 'Out for Delivery') {
        statusColor = '#f97316'; progress = 70;
        prColor = 'var(--secondary-accent)'; sColor = 'var(--secondary-accent)'; oColor = 'var(--secondary-accent)';
    } else if(order.status === 'Delivered') {
        statusColor = '#10b981'; progress = 100;
        prColor = 'var(--secondary-accent)'; sColor = 'var(--secondary-accent)'; oColor = 'var(--secondary-accent)'; dColor = 'var(--secondary-accent)';
    }
    
    const courierInfo = order.courierName ? `<p style="margin-top:15px; font-size:0.9rem; color:var(--text-secondary);"><strong>Courier:</strong> ${order.courierName} <br><strong>Courier Tracking ID:</strong> ${order.courierTrackingId || 'N/A'}</p>` : '';

    container.style.display = 'block';
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:20px;">
            <strong style="color:var(--text-primary); font-size:1.1rem;">${order.trackingId || order.id}</strong>
            <span style="background:${statusColor}; color:white; padding:4px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">${order.status}</span>
        </div>
        
        <!-- Tracking Timeline -->
        <div style="position: relative; margin-bottom: 30px;">
            <div style="position:absolute; top:12px; left:10%; right:10%; height:4px; background:var(--border-color); z-index:1;"></div>
            <div style="position:absolute; top:12px; left:10%; width:${progress - 10}%; height:4px; background:var(--secondary-accent); z-index:2;"></div>
            
            <div style="display:flex; justify-content:space-between; position:relative; z-index:3;">
                <div style="text-align:center; width:20%;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${pColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-clipboard-list"></i></div>
                    <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Pending</p>
                </div>
                <div style="text-align:center; width:20%;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${prColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-box-open"></i></div>
                    <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Processing</p>
                </div>
                <div style="text-align:center; width:20%;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${sColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-truck-fast"></i></div>
                    <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Shipped</p>
                </div>
                <div style="text-align:center; width:20%;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${oColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-motorcycle"></i></div>
                    <p style="font-size:0.7rem; margin-top:5px; color:var(--text-primary); font-weight:bold; line-height:1;">Out for<br>Delivery</p>
                </div>
                <div style="text-align:center; width:20%;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${dColor}; color:white; line-height:28px; margin:0 auto; font-size:0.8rem;"><i class="fa-solid fa-house-circle-check"></i></div>
                    <p style="font-size:0.75rem; margin-top:5px; color:var(--text-primary); font-weight:bold;">Delivered</p>
                </div>
            </div>
        </div>
        ${courierInfo}
        <p style="margin-top:15px; font-size:0.9rem; color:var(--text-secondary);"><strong>Order Date:</strong> ${order.date}</p>
        <p style="margin-top:5px; font-size:0.9rem; color:var(--text-secondary);"><strong>Deliver To:</strong> ${order.customerName}, ${order.customerAddress}</p>
    `;
}

// Print Invoice Function
function printCustomerInvoice(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if(!order) return;
    
    let itemsHtml = order.items.map(i => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;">${i.name}</td>
            <td style="padding: 10px 0; text-align:center;">${i.quantity || 1}</td>
            <td style="padding: 10px 0; text-align:right;">Rs. ${i.price.toLocaleString()}</td>
            <td style="padding: 10px 0; text-align:right;">Rs. ${(i.price * (i.quantity || 1)).toLocaleString()}</td>
        </tr>
    `).join('');

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
        <html>
        <head>
            <title>Invoice - ${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #10b981; }
                .invoice-details { text-align: right; }
                .bill-to { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { text-align: left; padding: 10px 0; border-bottom: 2px solid #eee; color: #666; }
                .total { text-align: right; font-size: 1.2rem; font-weight: bold; color: #10b981; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">VASIZ MARKETPLACE</div>
                    <p style="margin: 5px 0; color: #666;">Colombo, Sri Lanka<br>info@vasiz.com<br>0773705309</p>
                </div>
                <div class="invoice-details">
                    <h2 style="margin: 0; color: #333; text-transform: uppercase;">Invoice</h2>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
                    <p style="margin: 5px 0;"><strong>Tracking ID:</strong> ${order.trackingId || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${order.date}</p>
                </div>
            </div>
            
            <div class="bill-to">
                <h3 style="margin-top: 0; color: #666;">BILL TO:</h3>
                <p style="margin: 5px 0;"><strong>${order.customerName}</strong></p>
                <p style="margin: 5px 0;">${order.customerAddress}</p>
                <p style="margin: 5px 0;">${order.customerPhone}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th style="text-align:center;">Qty</th>
                        <th style="text-align:right;">Unit Price</th>
                        <th style="text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="total">
                Total Amount: Rs. ${order.total.toLocaleString()}
            </div>
            
            <div style="margin-top: 50px; text-align: center; color: #666; font-size: 0.9rem;">
                <p>Thank you for shopping with VASIZ!</p>
            </div>
            
            <div style="text-align:center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">Print Invoice</button>
            </div>
        </body>
        </html>
    `);
    invoiceWindow.document.close();
}

// Print Waybill (Shipping Label)
function printWaybill(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if(!order) return;
    
    const waybillWindow = window.open('', '_blank');
    waybillWindow.document.write(`
        <html>
        <head>
            <title>Waybill - ${order.trackingId || order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #000; display:flex; justify-content:center; }
                .label-container { width: 10cm; border: 2px solid #000; padding: 15px; border-radius: 8px; position:relative; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; text-align: center; }
                .logo { font-size: 20px; font-weight: bold; }
                .barcode { margin: 10px 0; text-align: center; padding: 10px; border: 1px dashed #000; font-family: monospace; font-size: 18px; letter-spacing: 2px; }
                .section { margin-bottom: 15px; }
                .section-title { font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2px; }
                .text-bold { font-weight: bold; font-size: 14px; }
                @media print { button { display: none; } .label-container { border: none; width: 100%; } body { padding:0; } }
            </style>
        </head>
        <body>
            <div class="label-container">
                <div class="header">
                    <div class="logo">VASIZ EXPRESS</div>
                    <div style="font-size:12px;">Standard Delivery</div>
                </div>
                
                <div class="barcode">
                    *${order.trackingId || order.id}*<br>
                    <span style="font-size:12px; letter-spacing:0;">${order.trackingId || order.id}</span>
                </div>
                
                <div class="section" style="border-bottom:1px solid #ccc; padding-bottom:10px;">
                    <div class="section-title">TO (CONSIGNEE):</div>
                    <div class="text-bold" style="font-size:16px;">${order.customerName}</div>
                    <div style="font-size:14px; margin-top:5px;">${order.customerAddress}</div>
                    <div class="text-bold" style="margin-top:5px;">TEL: ${order.customerPhone}</div>
                </div>
                
                <div class="section" style="border-bottom:1px solid #ccc; padding-bottom:10px; display:flex; justify-content:space-between;">
                    <div>
                        <div class="section-title">COD AMOUNT:</div>
                        <div class="text-bold" style="font-size:18px;">Rs. ${order.total.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="section-title">ORDER DATE:</div>
                        <div class="text-bold">${order.date}</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">SENDER:</div>
                    <div class="text-bold">VASIZ Marketplace Vendor</div>
                    <div style="font-size:12px;">Items: ${order.items.length} piece(s)</div>
                </div>
                
                <div style="text-align:center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 8px 15px; background: #000; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Label</button>
                </div>
            </div>
        </body>
        </html>
    `);
    waybillWindow.document.close();
}

// ============================
// RECENTLY VIEWED PRODUCTS
// ============================
function addToRecentlyViewed(productId) {
    let viewed = JSON.parse(localStorage.getItem('VASIZ_recently_viewed') || '[]');
    viewed = viewed.filter(id => id !== productId);
    viewed.unshift(productId);
    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem('VASIZ_recently_viewed', JSON.stringify(viewed));
    renderRecentlyViewed();
}

function renderRecentlyViewed() {
    const section = document.getElementById('recently-viewed-section');
    const grid = document.getElementById('recently-viewed-grid');
    if (!section || !grid) return;

    const viewedIds = JSON.parse(localStorage.getItem('VASIZ_recently_viewed') || '[]');
    const allProducts = getProducts();
    const viewedProducts = viewedIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);

    if (viewedProducts.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = '';

    viewedProducts.forEach(product => {
        const card = document.createElement('div');
        card.style = 'min-width:160px; max-width:170px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:10px; cursor:pointer; transition: transform 0.2s, box-shadow 0.2s; flex-shrink:0;';
        card.onmouseover = () => { card.style.transform = 'translateY(-3px)'; card.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)'; };
        card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; };
        card.onclick = () => openProductModal(product);

        const imageSrc = product.image || `https://via.placeholder.com/150x100/6366f1/ffffff?text=${product.name.replace(/ /g, '+')}`;
        const displayPrice = (product.discount && product.discount > 0) ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;

        card.innerHTML = `
            <div style="width:100%; height:100px; overflow:hidden; border-radius:4px; margin-bottom:8px;">
                <img src="${imageSrc}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <p style="font-size:0.8rem; color:var(--text-primary); margin:0; line-height:1.2; height:2.4em; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${product.name}</p>
            <p style="font-size:0.9rem; color:var(--accent-color); font-weight:700; margin:5px 0 0 0;">Rs.${displayPrice.toLocaleString()}</p>
        `;
        grid.appendChild(card);
    });
}

// ============================
// FREE SHIPPING PROGRESS BAR
// ============================
const FREE_SHIPPING_THRESHOLD = 5000; // Rs. 5000 for free shipping

function updateFreeShippingBar() {
    const bar = document.getElementById('free-shipping-bar');
    const progressEl = document.getElementById('free-ship-progress');
    const textEl = document.getElementById('free-ship-text');
    if (!bar || !progressEl || !textEl) return;

    if (cart.length === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'block';
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const percentage = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    progressEl.style.width = percentage + '%';

    if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
        textEl.innerHTML = '🎉 You qualify for FREE Shipping!';
        bar.style.background = 'linear-gradient(135deg, #d1fae5, #a7f3d0)';
        bar.style.borderColor = '#34d399';
    } else {
        const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;
        textEl.innerHTML = `Add Rs. ${remaining.toLocaleString()} more for FREE Shipping`;
    }
}

// ============================
// PROMO CODE SYSTEM
// ============================
let appliedPromo = null;

const PROMO_CODES = {
    'VASIZ10': { discount: 10, type: 'percent', description: '10% off your order!' },
    'VASIZ20': { discount: 20, type: 'percent', description: '20% off your order!' },
    'SAVE500': { discount: 500, type: 'fixed', description: 'Rs. 500 off your order!' },
    'SAVE1000': { discount: 1000, type: 'fixed', description: 'Rs. 1,000 off your order!' },
    'FREESHIP': { discount: 0, type: 'freeship', description: 'Free shipping on your order!' },
    'WELCOME': { discount: 15, type: 'percent', description: '15% Welcome Discount!' }
};

function applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const resultDiv = document.getElementById('promo-result');
    const discountLine = document.getElementById('promo-discount-line');
    if (!input || !resultDiv) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
        resultDiv.style.display = 'block';
        resultDiv.style.background = '#fef2f2';
        resultDiv.style.color = '#dc2626';
        resultDiv.style.border = '1px solid #fecaca';
        resultDiv.innerHTML = '<i class="fa-solid fa-xmark"></i> Please enter a promo code';
        return;
    }

    const promo = PROMO_CODES[code];
    if (!promo) {
        resultDiv.style.display = 'block';
        resultDiv.style.background = '#fef2f2';
        resultDiv.style.color = '#dc2626';
        resultDiv.style.border = '1px solid #fecaca';
        resultDiv.innerHTML = '<i class="fa-solid fa-xmark"></i> Invalid promo code. Please try again.';
        appliedPromo = null;
        recalcCheckoutTotal();
        return;
    }

    appliedPromo = { code, ...promo };
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#f0fdf4';
    resultDiv.style.color = '#16a34a';
    resultDiv.style.border = '1px solid #bbf7d0';
    resultDiv.innerHTML = `<i class="fa-solid fa-check"></i> "${code}" applied! ${promo.description}`;

    recalcCheckoutTotal();
}

function recalcCheckoutTotal() {
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountLine = document.getElementById('promo-discount-line');

    if (appliedPromo) {
        let discountAmount = 0;
        if (appliedPromo.type === 'percent') {
            discountAmount = Math.floor(total * (appliedPromo.discount / 100));
        } else if (appliedPromo.type === 'fixed') {
            discountAmount = appliedPromo.discount;
        }
        total = Math.max(0, total - discountAmount);

        if (discountLine && discountAmount > 0) {
            discountLine.style.display = 'block';
            discountLine.innerHTML = `<i class="fa-solid fa-tag"></i> Promo "${appliedPromo.code}": -Rs. ${discountAmount.toLocaleString()} saved!`;
        }
    } else {
        if (discountLine) discountLine.style.display = 'none';
    }

    document.getElementById('checkout-total').innerText = total.toLocaleString();
}

// ============================
// DISPUTE CENTER
// ============================
function openDispute(orderId) {
    const reason = prompt('Please describe the issue with your order (e.g. item not received, wrong item, damaged):');
    if (!reason || reason.trim() === '') return;

    const disputes = JSON.parse(localStorage.getItem('VASIZ_disputes') || '[]');
    const newDispute = {
        id: 'DSP-' + Math.floor(10000 + Math.random() * 90000),
        orderId: orderId,
        customerName: currentUser ? currentUser.name : 'Guest',
        customerPhone: currentUser ? currentUser.phone : '',
        reason: reason.trim(),
        status: 'Open',
        date: new Date().toLocaleDateString(),
        adminResponse: ''
    };
    disputes.push(newDispute);
    localStorage.setItem('VASIZ_disputes', JSON.stringify(disputes));
    alert(`Dispute ${newDispute.id} has been filed successfully! Our team will review it within 24-48 hours.`);
    renderMyOrders();
}

function requestReturn(orderId) {
    const reason = prompt('Please describe why you want to return this order (e.g. wrong size, defective):');
    if (!reason || reason.trim() === '') return;

    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'Return Requested';
        orders[orderIndex].returnReason = reason.trim();
        saveOrders(orders);
        alert('Your return request has been submitted successfully.');
        renderMyOrders();
    }
}
