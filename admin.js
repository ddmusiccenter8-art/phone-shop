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

document.addEventListener('DOMContentLoaded', () => {
    renderAdminTable();
    populateDropdowns();
    renderOrdersTable();
    renderAdminCategoryFilters();
    renderFeedbacks();
    calculateGlobalStats();

    // Admin Search functionality
    const adminSearch = document.getElementById('admin-search');
    if (adminSearch) {
        adminSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const allProducts = getProducts();
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.category.toLowerCase().includes(searchTerm)
            );
            renderAdminTable(filtered);
        });
    }

    // Listen for category changes to show/hide compliance fields
    document.addEventListener('input', (e) => {
        if(e.target.id === 'new-category' || e.target.id === 'custom-category') {
            const selectVal = document.getElementById('new-category').value;
            const customVal = document.getElementById('custom-category') ? document.getElementById('custom-category').value : '';
            const actualCat = selectVal === '_add_new_' ? customVal : selectVal;
            
            const complianceFields = document.getElementById('compliance-fields');
            if(complianceFields) {
                if(actualCat && actualCat.toLowerCase().includes('medical')) {
                    complianceFields.style.display = 'flex';
                    document.getElementById('new-pharmacy-license').required = true;
                    document.getElementById('new-exp-date').required = true;
                    document.getElementById('new-manufacturer').required = true;
                } else {
                    complianceFields.style.display = 'none';
                    document.getElementById('new-pharmacy-license').required = false;
                    document.getElementById('new-exp-date').required = false;
                    document.getElementById('new-manufacturer').required = false;
                }
            }
        }
    });

    const addForm = document.getElementById('admin-add-form');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('new-name').value;
            const price = parseInt(document.getElementById('new-price').value);
            const desc = document.getElementById('new-desc').value;
            const warranty = document.getElementById('new-warranty').value;
            const stock = parseInt(document.getElementById('new-stock').value) || 0;
            
            const brandSelect = document.getElementById('new-brand').value;
            const brand = brandSelect === '_add_new_' ? document.getElementById('custom-brand').value : (brandSelect || '');
            const condition = document.getElementById('new-condition').value || '';
            const weight = document.getElementById('new-weight').value || '';
            const dimensions = document.getElementById('new-dimensions').value || '';
            const packagingSize = document.getElementById('new-packaging').value || '';
            
            const catSelect = document.getElementById('new-category').value;
            const category = catSelect === '_add_new_' ? document.getElementById('custom-category').value : catSelect;
            
            const expDate = document.getElementById('new-exp-date') ? document.getElementById('new-exp-date').value : '';
            const manufacturer = document.getElementById('new-manufacturer') ? document.getElementById('new-manufacturer').value : '';
            
            let pharmacyLicenseUrl = '';
            const pharmacyInput = document.getElementById('new-pharmacy-license');
            if(pharmacyInput && pharmacyInput.files[0]) {
                const readFile = (file) => new Promise((resolve) => {
                    const r = new FileReader();
                    r.onload = (ev) => resolve(ev.target.result);
                    r.readAsDataURL(file);
                });
                pharmacyLicenseUrl = await readFile(pharmacyInput.files[0]);
            }
            
            const imageFile = document.getElementById('new-image-file').files[0];
            
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    saveNewProduct(name, price, category, desc, warranty, stock, brand, condition, weight, dimensions, packagingSize, expDate, manufacturer, pharmacyLicenseUrl, event.target.result);
                };
                reader.readAsDataURL(imageFile);
            } else {
                saveNewProduct(name, price, category, desc, warranty, stock, brand, condition, weight, dimensions, packagingSize, expDate, manufacturer, pharmacyLicenseUrl, "");
            }
        });
        
        function saveNewProduct(name, price, category, desc, warranty, stock, brand, condition, weight, dimensions, packagingSize, expDate, manufacturer, pharmacyLicenseUrl, imageUrl) {
            let products = getProducts();
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            
            let icon = "📦";
            if(category === "Mobile Phones") icon = "📱";
            else if(category === "Laptops") icon = "💻";
            else if(category === "Accessories") icon = "🎧";
            else if(category === "Electronic Items") icon = "🔌";
            else if(category === "Sound Systems") icon = "🔊";

            const newProduct = {
                id: newId,
                name: name,
                price: price,
                category: category,
                image: imageUrl,
                icon: icon,
                description: desc,
                warranty: warranty,
                stock: stock,
                brand: brand,
                condition: condition,
                weight: weight,
                dimensions: dimensions,
                packagingSize: packagingSize,
                expDate: expDate,
                manufacturer: manufacturer,
                pharmacyLicenseUrl: pharmacyLicenseUrl,
                ratings: [],
                discount: 0,
                vendorId: 'Platform Owner',
                status: 'active'
            };
            
            products.push(newProduct);
            saveProducts(products);
            if(window.fbSaveProduct) window.fbSaveProduct(newProduct);
            
            renderAdminTable();
            populateDropdowns();
            renderAdminCategoryFilters();
            addForm.reset();
            alert("Product added successfully!");
        }
    }
});

function populateDropdowns() {
    const products = getProducts();
    const categories = [...new Set(products.map(p => p.category).filter(c => c))];
    const brands = [...new Set(products.map(p => p.brand).filter(b => b))];
    
    const catSelect = document.getElementById('new-category');
    if(catSelect) {
        let catHtml = '<option value="" disabled selected>Select Category</option>';
        categories.forEach(c => catHtml += `<option value="${c}">${c}</option>`);
        catHtml += '<option value="_add_new_">+ Add New Category</option>';
        catSelect.innerHTML = catHtml;
    }
    
    const brandSelect = document.getElementById('new-brand');
    if(brandSelect) {
        let brandHtml = '<option value="" disabled selected>Select Brand</option>';
        brands.forEach(b => brandHtml += `<option value="${b}">${b}</option>`);
        brandHtml += '<option value="_add_new_">+ Add New Brand</option>';
        brandSelect.innerHTML = brandHtml;
    }
}

function renderAdminCategoryFilters() {
    const container = document.getElementById('admin-category-filters');
    if (!container) return;

    const allProducts = getProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];

    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'action-btn';
    allBtn.style.backgroundColor = 'var(--accent-color)';
    allBtn.innerText = 'All';
    allBtn.onclick = () => renderAdminTable(getProducts());
    container.appendChild(allBtn);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.backgroundColor = 'rgba(255,255,255,0.1)';
        btn.innerText = cat;
        btn.onclick = () => {
            const filtered = getProducts().filter(p => p.category === cat);
            renderAdminTable(filtered);
        };
        container.appendChild(btn);
    });
}

function toggleNewInput(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    if(select && input) {
        if(select.value === '_add_new_') {
            input.style.display = 'block';
            input.required = select.hasAttribute('required');
        } else {
            input.style.display = 'none';
            input.required = false;
        }
    }
}

function renderAdminTable(productsToRender = getProducts()) {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (productsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
        return;
    }

    productsToRender.forEach(product => {
        const tr = document.createElement('tr');
        const discountText = product.discount ? `<span style="color:#10b981; font-size:0.85rem;"><br>${product.discount}% OFF</span>` : '';
        const vendorText = product.vendorId ? product.vendorId : 'Platform Owner';
        const statusText = product.status ? product.status : 'active';
        
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>Rs. ${product.price.toLocaleString()} ${discountText}</td>
            <td><span style="background:var(--search-bg); padding:2px 5px; border-radius:3px; font-size:0.8rem;">${vendorText}</span></td>
            <td><span style="color:${statusText === 'pending' ? '#f59e0b' : '#10b981'}; font-weight:bold;">${statusText.toUpperCase()}</span></td>
            <td>
                ${statusText === 'pending' ? `<button class="action-btn edit-btn" style="background-color: #f59e0b; margin-bottom: 5px;" onclick="approveProduct(${product.id})">Approve</button>` : ''}
                <button class="action-btn edit-btn" style="background-color: #3b82f6; margin-bottom: 5px;" onclick="editName(${product.id})">Edit Name</button>
                <button class="action-btn edit-btn" style="background-color: #10b981; margin-bottom: 5px;" onclick="setDiscount(${product.id})">Discount</button>
                <button class="action-btn edit-btn" style="margin-bottom: 5px;" onclick="editPrice(${product.id})">Edit Price</button>
                <button class="action-btn edit-btn" style="background-color: #8b5cf6; margin-bottom: 5px;" onclick="document.getElementById('edit-image-input-${product.id}').click()">Change Image</button>
                <input type="file" id="edit-image-input-${product.id}" accept="image/*" style="display:none;" onchange="updateProductImage(${product.id}, this)">
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function calculateGlobalStats() {
    const allOrders = getOrders();
    let totalSales = 0;
    
    allOrders.forEach(order => {
        totalSales += order.total || 0;
    });
    
    const commission = totalSales * 0.10; // 10%
    
    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const sellers = users.filter(u => u.role === 'seller');
    
    document.getElementById('global-sales').innerText = `Rs. ${totalSales.toLocaleString()}`;
    document.getElementById('global-commission').innerText = `Rs. ${commission.toLocaleString()}`;
    document.getElementById('global-sellers').innerText = sellers.length;
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        if(window.fbDeleteProduct) window.fbDeleteProduct(id);
        renderAdminTable();
        populateCategories(); // Update filters if needed
        renderAdminCategoryFilters();
    }
}

function approveProduct(id) {
    if (confirm("Approve this product for the store?")) {
        let products = getProducts();
        const product = products.find(p => p.id === id);
        if(product) {
            product.status = 'active';
            saveProducts(products);
            if(window.fbSaveProduct) window.fbSaveProduct(product);
            renderAdminTable();
        }
    }
}

function updateProductImage(id, inputElement) {
    const file = inputElement.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            let products = getProducts();
            const product = products.find(p => p.id === id);
            if (product) {
                product.image = event.target.result;
                saveProducts(products);
                if(window.fbSaveProduct) window.fbSaveProduct(product);
                renderAdminTable();
                alert("Image updated successfully!");
            }
        };
        reader.readAsDataURL(file);
    }
}

function editName(id) {
    let products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newName = prompt(`Enter new name for ${product.name}:`, product.name);
    if (newName !== null && newName.trim() !== "") {
        product.name = newName.trim();
        saveProducts(products);
        if(window.fbSaveProduct) window.fbSaveProduct(product);
        renderAdminTable();
        alert("Name updated successfully!");
    } else if (newName !== null) {
        alert("Name cannot be empty.");
    }
}

function editPrice(id) {
    let products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newPriceStr = prompt(`Enter new price for ${product.name}:`, product.price);
    if (newPriceStr !== null) {
        const newPrice = parseInt(newPriceStr);
        if (!isNaN(newPrice) && newPrice > 0) {
            product.price = newPrice;
            saveProducts(products);
            if(window.fbSaveProduct) window.fbSaveProduct(product);
            renderAdminTable();
            alert("Price updated successfully!");
        } else {
            alert("Invalid price entered. Please enter a valid number.");
        }
    }
}

function setDiscount(id) {
    let products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const currentDiscount = product.discount || 0;
    const newDiscountStr = prompt(`Enter discount percentage for ${product.name} (e.g. 20 for 20% off. Enter 0 to remove discount):`, currentDiscount);
    
    if (newDiscountStr !== null) {
        const newDiscount = parseInt(newDiscountStr);
        if (!isNaN(newDiscount) && newDiscount >= 0 && newDiscount <= 100) {
            product.discount = newDiscount;
            saveProducts(products);
            if(window.fbSaveProduct) window.fbSaveProduct(product);
            renderAdminTable();
            alert("Discount updated successfully!");
        } else {
            alert("Invalid discount percentage. Please enter a number between 0 and 100.");
        }
    }
}

function renderFeedbacks() {
    const tbody = document.getElementById('feedback-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const feedbacks = JSON.parse(localStorage.getItem('VASIZ_feedbacks')) || [];

    if (feedbacks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No feedback received yet.</td></tr>';
        return;
    }

    // Sort newest first
    feedbacks.reverse().forEach(fb => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fb.date}</td>
            <td>${fb.name}</td>
            <td>${fb.email}</td>
            <td>${fb.message}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Order Management
function renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    if(!tbody) return;
    
    const orders = getOrders();
    tbody.innerHTML = '';
    
    if(orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
        return;
    }
    
    // Copy array and reverse to show newest first without modifying original
    [...orders].reverse().forEach(order => {
        const tr = document.createElement('tr');
        
        const itemNames = order.items.map(i => i.name).join(', ');
        
        tr.innerHTML = `
            <td><strong>${order.id}</strong></td>
            <td>
                ${order.customerName}<br>
                <small style="color:var(--text-secondary);">${order.customerPhone}</small><br>
                <small style="color:var(--text-secondary);">${order.customerAddress}</small>
            </td>
            <td>${itemNames}</td>
            <td>Rs. ${order.total.toLocaleString()}</td>
            <td>${order.date}</td>
            <td>
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px; font-size: 0.9rem;">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if(orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        saveOrders(orders);
        if(window.fbSaveOrder) window.fbSaveOrder(orders[orderIndex]);
        alert(`Order ${orderId} status updated to ${newStatus}`);
    }
}

