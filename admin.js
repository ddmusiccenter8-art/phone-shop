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
    renderSellerApprovals();
    renderDisputes();

    // Init Super Admin Settings
    const userStr = localStorage.getItem('VASIZ_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'superadmin') {
            document.getElementById('superadmin-settings').style.display = 'block';
            const currentComm = parseFloat(localStorage.getItem('VASIZ_COMMISSION') || '10');
            document.getElementById('platform-commission').value = currentComm;
        }
    }

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
            const weightGrams = parseInt(document.getElementById('new-weight-grams').value) || 0;
            const lengthCm = parseInt(document.getElementById('new-length-cm').value) || 0;
            const widthCm = parseInt(document.getElementById('new-width-cm').value) || 0;
            const heightCm = parseInt(document.getElementById('new-height-cm').value) || 0;
            
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
                    saveNewProduct(name, price, category, desc, warranty, stock, brand, condition, weightGrams, lengthCm, widthCm, heightCm, expDate, manufacturer, pharmacyLicenseUrl, event.target.result);
                };
                reader.readAsDataURL(imageFile);
            } else {
                saveNewProduct(name, price, category, desc, warranty, stock, brand, condition, weightGrams, lengthCm, widthCm, heightCm, expDate, manufacturer, pharmacyLicenseUrl, "");
            }
        });
        
        function saveNewProduct(name, price, category, desc, warranty, stock, brand, condition, weightGrams, lengthCm, widthCm, heightCm, expDate, manufacturer, pharmacyLicenseUrl, imageUrl) {
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
                weightGrams: weightGrams,
                lengthCm: lengthCm,
                widthCm: widthCm,
                heightCm: heightCm,
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
    
    // Track item sales
    const itemSales = {};
    
    allOrders.forEach(order => {
        totalSales += order.total || 0;
        
        // Count sold items
        if(order.items) {
            order.items.forEach(item => {
                if(!itemSales[item.id]) {
                    itemSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                }
                itemSales[item.id].quantity += (item.quantity || 1);
                itemSales[item.id].revenue += ((item.price || 0) * (item.quantity || 1));
            });
        }
    });
    
    // Sort and render top sellers
    const sortedItems = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const topSellingBody = document.getElementById('top-selling-table-body');
    if(topSellingBody) {
        topSellingBody.innerHTML = '';
        if(sortedItems.length === 0) {
            topSellingBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No sales data available.</td></tr>';
        } else {
            sortedItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td><strong>${item.quantity}</strong></td>
                    <td>Rs. ${item.revenue.toLocaleString()}</td>
                `;
                topSellingBody.appendChild(tr);
            });
        }
    }
    
    const commissionRate = parseFloat(localStorage.getItem('VASIZ_COMMISSION') || '10') / 100;
    const commission = totalSales * commissionRate;
    
    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const sellers = users.filter(u => u.role === 'seller');
    
    document.getElementById('global-sales').innerText = `Rs. ${totalSales.toLocaleString()}`;
    const commElement = document.getElementById('global-commission');
    if(commElement) {
        commElement.innerText = `Rs. ${commission.toLocaleString()}`;
        commElement.parentElement.querySelector('h4').innerText = `Total Commission (${commissionRate * 100}%)`;
    }
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

// Order Management - Daraz Style
let currentOrderFilter = 'All';
let currentOrderPage = 1;
const ORDERS_PER_PAGE = 10;

function filterOrders(status) {
    currentOrderFilter = status;
    currentOrderPage = 1;
    // Update tab styles
    const tabs = document.querySelectorAll('#order-status-tabs .order-tab');
    tabs.forEach(tab => {
        tab.style.borderBottom = '3px solid transparent';
        tab.style.fontWeight = '500';
        tab.style.color = 'var(--text-secondary)';
    });
    const activeIndex = ['All', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(status);
    if (tabs[activeIndex]) {
        tabs[activeIndex].style.borderBottom = '3px solid var(--accent-color)';
        tabs[activeIndex].style.fontWeight = '600';
        tabs[activeIndex].style.color = 'var(--text-primary)';
    }
    renderOrdersTable();
}

function searchOrders(term) {
    currentOrderPage = 1;
    renderOrdersTable(term.toLowerCase());
}

function changeOrderPage(dir) {
    currentOrderPage += dir;
    if (currentOrderPage < 1) currentOrderPage = 1;
    renderOrdersTable();
}

function exportOrders() {
    const orders = getOrders();
    let csv = 'Order ID,Tracking ID,Customer,Phone,Address,Items,Total,Payment,Status,Date\n';
    orders.forEach(o => {
        const items = o.items.map(i => i.name).join(' | ');
        csv += `"${o.id}","${o.trackingId || ''}","${o.customerName}","${o.customerPhone}","${o.customerAddress || ''}","${items}",${o.total},"${o.paymentMethod || 'COD'}","${o.status}","${o.date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vasiz_orders_export.csv'; a.click();
    URL.revokeObjectURL(url);
}

function renderOrdersTable(searchTerm = '') {
    const container = document.getElementById('orders-table-body');
    if(!container) return;
    
    let orders = getOrders();
    
    // Filter by status
    if (currentOrderFilter !== 'All') {
        orders = orders.filter(o => o.status === currentOrderFilter);
    }
    
    // Search
    if (searchTerm) {
        orders = orders.filter(o => 
            (o.id || '').toLowerCase().includes(searchTerm) ||
            (o.trackingId || '').toLowerCase().includes(searchTerm) ||
            (o.customerName || '').toLowerCase().includes(searchTerm) ||
            (o.customerPhone || '').includes(searchTerm)
        );
    }
    
    // Sort
    const sortEl = document.getElementById('order-sort');
    const sortDir = sortEl ? sortEl.value : 'newest';
    if (sortDir === 'newest') {
        orders = [...orders].reverse();
    }
    
    // Update counts
    const countBadge = document.getElementById('order-count-badge');
    const allOrders = getOrders();
    if (countBadge) {
        const pendingCount = allOrders.filter(o => o.status === 'Pending').length;
        countBadge.innerHTML = `Total: <strong>${allOrders.length}</strong> | Pending: <strong style="color:#f59e0b;">${pendingCount}</strong>`;
    }
    
    // Pagination
    const totalOrders = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalOrders / ORDERS_PER_PAGE));
    if (currentOrderPage > totalPages) currentOrderPage = totalPages;
    const start = (currentOrderPage - 1) * ORDERS_PER_PAGE;
    const paginatedOrders = orders.slice(start, start + ORDERS_PER_PAGE);
    
    const pageInfo = document.getElementById('order-page-info');
    if (pageInfo) pageInfo.innerHTML = `Page ${currentOrderPage}, ${start + 1}-${Math.min(start + ORDERS_PER_PAGE, totalOrders)} of ${totalOrders} item(s)`;
    const pageNum = document.getElementById('order-page-number');
    if (pageNum) pageNum.innerText = currentOrderPage;
    const pagInfo2 = document.getElementById('order-pagination-info');
    if (pagInfo2) pagInfo2.innerHTML = `Items per page: <strong>${ORDERS_PER_PAGE}</strong>`;
    
    container.innerHTML = '';
    
    if(paginatedOrders.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-secondary);"><i class="fa-solid fa-inbox" style="font-size:2rem; margin-bottom:10px; display:block;"></i>No orders found.</div>';
        return;
    }
    
    paginatedOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.style = 'background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; margin-bottom:15px; box-shadow:0 2px 5px rgba(0,0,0,0.02); overflow:hidden;';
        
        // Calculate SLA hours
        const orderDate = new Date(order.date);
        const now = new Date();
        const hoursElapsed = Math.round((now - orderDate) / (1000 * 60 * 60));
        const slaColor = hoursElapsed > 48 ? '#ef4444' : hoursElapsed > 24 ? '#f59e0b' : '#10b981';
        const slaText = hoursElapsed > 0 ? `${hoursElapsed} hrs` : 'Just now';
        
        // Status badge
        const statusColors = { 'Pending': '#f59e0b', 'Processing': '#3b82f6', 'Shipped': '#8b5cf6', 'Out for Delivery': '#f97316', 'Delivered': '#10b981' };
        const stColor = statusColors[order.status] || '#64748b';
        
        // Customer header row
        let headerHtml = `
            <div style="padding:15px 20px; background:var(--search-bg); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-user-circle" style="font-size:1.3rem; color:var(--text-secondary);"></i>
                    <strong style="color:var(--text-primary); font-size:0.9rem;">${order.customerName}</strong>
                    <span style="font-size:0.75rem; color:var(--text-secondary);">(${order.items.length} item${order.items.length > 1 ? 's' : ''})</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px; font-size:0.8rem; color:var(--text-secondary);">
                    <span>Order: <strong style="color:var(--accent-color);">${order.id}</strong></span>
                    <span>Track: <code style="background:var(--card-bg); padding:1px 5px; border-radius:3px; font-size:0.75rem;">${order.trackingId || 'N/A'}</code></span>
                    <span>Created: ${order.date}</span>
                </div>
            </div>
        `;
        
        // Product rows
        let productsHtml = '';
        const allProducts = getProducts();
        order.items.forEach(item => {
            const dbProduct = allProducts.find(p => p.id === item.id);
            const imgSrc = (dbProduct && dbProduct.image) ? dbProduct.image : `https://via.placeholder.com/60x60/e2e8f0/64748b?text=${(item.name || 'Item').substring(0,3)}`;
            const sku = item.cartItemId || `${item.id}-STD`;
            
            productsHtml += `
                <div style="display:grid; grid-template-columns: 3fr 1.2fr 1.2fr 1fr 1.5fr; padding:15px 25px; align-items:center; gap:10px;">
                    <!-- Product -->
                    <div style="display:flex; gap:12px; align-items:center;">
                        <img src="${imgSrc}" alt="${item.name}" style="width:55px; height:55px; object-fit:cover; border-radius:6px; border:1px solid var(--border-color); flex-shrink:0;">
                        <div>
                            <p style="margin:0; font-size:0.85rem; color:var(--text-primary); font-weight:500; line-height:1.3;">${item.name}</p>
                            ${item.selectedSize && item.selectedSize !== 'Standard' ? `<span style="font-size:0.7rem; color:var(--text-secondary);"> × ${item.quantity || 1}</span>` : `<span style="font-size:0.7rem; color:var(--text-secondary);"> × ${item.quantity || 1}</span>`}
                            <p style="margin:2px 0 0 0; font-size:0.7rem; color:var(--text-secondary);">SKU: ${sku}</p>
                        </div>
                    </div>
                    <!-- Total Amount -->
                    <div>
                        <p style="margin:0; font-size:0.9rem; font-weight:600; color:var(--text-primary);">Rs ${(item.price * (item.quantity || 1)).toLocaleString()}</p>
                        <p style="margin:2px 0 0; font-size:0.75rem; color:var(--text-secondary);">${order.paymentMethod || 'Cash on Delivery'}</p>
                    </div>
                    <!-- Delivery -->
                    <div>
                        <p style="margin:0; font-size:0.8rem; color:var(--text-primary); font-weight:500;">Standard</p>
                        <p style="margin:2px 0 0; font-size:0.7rem; color:var(--text-secondary);">${order.courierName || 'Vasiz Express'}</p>
                    </div>
                    <!-- Status -->
                    <div>
                        <span style="background:${stColor}; color:white; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; display:inline-block;">${order.status}</span>
                        <div style="margin-top:6px;"><span style="background:${slaColor}15; color:${slaColor}; padding:3px 8px; border-radius:15px; font-size:0.7rem; font-weight:bold;">${slaText}</span></div>
                    </div>
                    <!-- Actions -->
                    <div style="text-align:right; display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding:8px 12px; font-size:0.8rem; border-radius:20px; border:1px solid var(--border-color); background:var(--accent-color); color:white; cursor:pointer; font-weight:bold; width:150px; outline:none;">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>📦 Processing</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
                            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>🏍️ Out for Delivery</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
                        </select>
                        <div style="display:flex; gap:6px;">
                            <button onclick="printWaybill('${order.id}')" style="background:var(--secondary-accent); color:white; border:none; padding:6px 12px; border-radius:20px; font-size:0.75rem; font-weight:500; cursor:pointer; transition:0.3s;" title="Print AWB"><i class="fa-solid fa-barcode"></i> AWB</button>
                            <button onclick="printCustomerInvoice('${order.id}')" style="background:transparent; border:1px solid var(--border-color); color:var(--text-primary); padding:6px 12px; border-radius:20px; font-size:0.75rem; font-weight:500; cursor:pointer; transition:0.3s;" title="Invoice"><i class="fa-solid fa-file-invoice"></i> Invoice</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        orderDiv.innerHTML = headerHtml + productsHtml;
        container.appendChild(orderDiv);
    });
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if(orderIndex !== -1) {
        if(newStatus === 'Shipped') {
            const courierName = prompt("Enter Courier Name (e.g. Domex, PromptX):", orders[orderIndex].courierName || "");
            const trackingId = prompt("Enter Courier Tracking ID (if available):", orders[orderIndex].courierTrackingId || "");
            
            if (courierName !== null) {
                orders[orderIndex].courierName = courierName;
            }
            if (trackingId !== null) {
                orders[orderIndex].courierTrackingId = trackingId;
            }
        }
        
        orders[orderIndex].status = newStatus;
        saveOrders(orders);
        if(window.fbSaveOrder) window.fbSaveOrder(orders[orderIndex]);
        alert(`Order ${orderId} status updated to ${newStatus}`);
    }
}

// ============================
// SELLER APPROVAL MANAGEMENT
// ============================

function renderSellerApprovals() {
    const tbody = document.getElementById('seller-approval-body');
    const countBadge = document.getElementById('pending-seller-count');
    if (!tbody) return;

    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const sellers = users.filter(u => u.role === 'seller');

    tbody.innerHTML = '';

    if (sellers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No seller registrations found.</td></tr>';
        if(countBadge) countBadge.innerText = '';
        return;
    }

    const pendingCount = sellers.filter(s => s.sellerStatus === 'pending_approval').length;
    if(countBadge) {
        countBadge.innerText = pendingCount > 0 ? `${pendingCount} Pending` : 'All Reviewed';
        countBadge.style.background = pendingCount > 0 ? '#f59e0b' : '#10b981';
    }

    // Show pending first, then approved, then rejected
    const sortOrder = { 'pending_approval': 0, 'approved': 1, 'rejected': 2 };
    sellers.sort((a, b) => (sortOrder[a.sellerStatus] || 0) - (sortOrder[b.sellerStatus] || 0));

    sellers.forEach(seller => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        let actionBtns = '';
        
        if (seller.sellerStatus === 'pending_approval') {
            statusBadge = '<span style="background:#f59e0b; color:white; padding:3px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">⏳ Pending</span>';
            actionBtns = `
                <button class="action-btn" style="background:#10b981;" onclick="approveSeller('${seller.loginId}')"><i class="fa-solid fa-check"></i> Approve</button>
                <button class="action-btn delete-btn" onclick="rejectSeller('${seller.loginId}')"><i class="fa-solid fa-times"></i> Reject</button>
            `;
        } else if (seller.sellerStatus === 'approved') {
            statusBadge = '<span style="background:#10b981; color:white; padding:3px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">✅ Approved</span>';
            actionBtns = `<button class="action-btn delete-btn" onclick="rejectSeller('${seller.loginId}')"><i class="fa-solid fa-ban"></i> Suspend</button>`;
        } else if (seller.sellerStatus === 'rejected') {
            statusBadge = '<span style="background:#ef4444; color:white; padding:3px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">❌ Rejected</span>';
            actionBtns = `<button class="action-btn" style="background:#10b981;" onclick="approveSeller('${seller.loginId}')"><i class="fa-solid fa-check"></i> Re-Approve</button>`;
        }

        const bank = seller.bankDetails || {};
        const bankInfo = bank.bankName ? 
            `<strong>${bank.bankName}</strong><br><small>${bank.branch || '-'}</small><br><small>A/C: ${bank.accountName || '-'}</small><br><small>No: ${bank.accountNumber || '-'}</small>` :
            '<span style="color:#ef4444;">No bank details</span>';

        const docsHtml = `
            <div style="display:flex; gap:5px; flex-wrap:wrap;">
                ${seller.facePhotoUrl ? `<img src="${seller.facePhotoUrl}" title="Live Face Photo" onclick="viewDoc('${seller.facePhotoUrl}', 'Seller Face Photo')" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #ccc;cursor:pointer;">` : '<span style="color:#ef4444; font-size:0.7rem;">No Face</span>'}
                
                ${seller.nicDocUrl ? `<img src="${seller.nicDocUrl}" title="NIC Front" onclick="viewDoc('${seller.nicDocUrl}', 'NIC Front Document')" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #ccc;cursor:pointer;">` : '<span style="color:#ef4444; font-size:0.7rem;">No NIC Front</span>'}
                
                ${seller.nicBackUrl ? `<img src="${seller.nicBackUrl}" title="NIC Back" onclick="viewDoc('${seller.nicBackUrl}', 'NIC Back Document')" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #ccc;cursor:pointer;">` : '<span style="color:#ef4444; font-size:0.7rem;">No NIC Back</span>'}
                
                ${seller.tradeDocUrl ? `<img src="${seller.tradeDocUrl}" title="Trade License (BR)" onclick="viewDoc('${seller.tradeDocUrl}', 'Trade License (BR)')" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #ccc;cursor:pointer;">` : '<span style="color:#ef4444; font-size:0.7rem;">No BR</span>'}
            </div>
            <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:3px;">Click image to enlarge</div>
        `;

        tr.innerHTML = `
            <td><strong>${seller.name}</strong><br><small style="color:var(--text-secondary);">${seller.registeredDate || '-'}</small></td>
            <td>${seller.loginId}<br><small style="color:var(--accent-color);">${seller.email || 'No Email'}</small></td>
            <td>${seller.phone || '-'}</td>
            <td><code style="background:var(--search-bg); padding:2px 6px; border-radius:4px;">${seller.vendorId || '-'}</code></td>
            <td style="font-size:0.85rem;">${bankInfo}</td>
            <td>${docsHtml}</td>
            <td>${statusBadge}</td>
            <td style="display:flex; gap:5px; flex-wrap:wrap;">${actionBtns}</td>
        `;
        tbody.appendChild(tr);
    });
}

function viewDoc(url, title) {
    // Check if it's a PDF (Trade doc could be PDF)
    if (url.startsWith('data:application/pdf')) {
        const win = window.open();
        win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        return;
    }
    
    // Create image modal
    const overlay = document.createElement('div');
    overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center; flex-direction:column;';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa-solid fa-times"></i> Close';
    closeBtn.style = 'position:absolute; top:20px; right:20px; background:#ef4444; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1rem;';
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    const h3 = document.createElement('h3');
    h3.innerText = title;
    h3.style = 'color:white; margin-bottom:15px;';
    
    const img = document.createElement('img');
    img.src = url;
    img.style = 'max-width:90%; max-height:80%; object-fit:contain; border:2px solid white; border-radius:8px;';
    
    overlay.appendChild(closeBtn);
    overlay.appendChild(h3);
    overlay.appendChild(img);
    
    document.body.appendChild(overlay);
}

function approveSeller(loginId) {
    if (!confirm(`Are you sure you want to APPROVE seller "${loginId}"?`)) return;
    
    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const userIndex = users.findIndex(u => u.loginId === loginId);
    
    if (userIndex !== -1) {
        users[userIndex].sellerStatus = 'approved';
        localStorage.setItem('VASIZ_users', JSON.stringify(users));
        if(window.fbSaveUser) window.fbSaveUser(users[userIndex]);
        renderSellerApprovals();
        alert(`Seller "${loginId}" has been APPROVED! They can now log in and start selling.`);
    }
}

function rejectSeller(loginId) {
    const reason = prompt(`Enter reason for rejecting seller "${loginId}" (optional):`);
    if (reason === null) return; // cancelled
    
    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const userIndex = users.findIndex(u => u.loginId === loginId);
    
    if (userIndex !== -1) {
        users[userIndex].sellerStatus = 'rejected';
        users[userIndex].rejectionReason = reason || 'No reason provided';
        localStorage.setItem('VASIZ_users', JSON.stringify(users));
        if(window.fbSaveUser) window.fbSaveUser(users[userIndex]);
        renderSellerApprovals();
        alert(`Seller "${loginId}" has been REJECTED.`);
    }
}

// ============================
// DISPUTES MANAGEMENT
// ============================
function renderDisputes() {
    const tbody = document.getElementById('disputes-table-body');
    const countBadge = document.getElementById('open-dispute-count');
    if (!tbody) return;

    const disputes = JSON.parse(localStorage.getItem('VASIZ_disputes') || '[]');
    
    tbody.innerHTML = '';

    if (disputes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No disputes filed yet.</td></tr>';
        if(countBadge) countBadge.innerText = '';
        return;
    }

    const openCount = disputes.filter(d => d.status === 'Open').length;
    if(countBadge) {
        countBadge.innerText = openCount > 0 ? `${openCount} Open` : 'All Resolved';
        countBadge.style.background = openCount > 0 ? '#ef4444' : '#10b981';
    }

    // Show Open first, then Resolved
    disputes.sort((a, b) => (a.status === 'Open' ? 0 : 1) - (b.status === 'Open' ? 0 : 1));

    disputes.forEach(dispute => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        let actionBtns = '';
        
        if (dispute.status === 'Open') {
            statusBadge = '<span style="background:#ef4444; color:white; padding:3px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">🔴 Open</span>';
            actionBtns = `
                <button class="action-btn" style="background:#10b981; margin-bottom:5px;" onclick="resolveDispute('${dispute.id}')"><i class="fa-solid fa-check"></i> Resolve</button>
                <button class="action-btn" style="background:#3b82f6;" onclick="respondToDispute('${dispute.id}')"><i class="fa-solid fa-reply"></i> Respond</button>
            `;
        } else {
            statusBadge = '<span style="background:#10b981; color:white; padding:3px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;">✅ Resolved</span>';
            actionBtns = `<span style="color:var(--text-secondary); font-size:0.85rem;">${dispute.adminResponse || 'Resolved'}</span>`;
        }

        tr.innerHTML = `
            <td><code style="background:var(--search-bg); padding:2px 6px; border-radius:4px;">${dispute.id}</code></td>
            <td><strong>${dispute.orderId}</strong></td>
            <td>${dispute.customerName}<br><small style="color:var(--text-secondary);">${dispute.customerPhone}</small></td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis;">${dispute.reason}</td>
            <td>${dispute.date}</td>
            <td>${statusBadge}</td>
            <td style="display:flex; gap:5px; flex-wrap:wrap;">${actionBtns}</td>
        `;
        tbody.appendChild(tr);
    });
}

function resolveDispute(disputeId) {
    if (!confirm(`Are you sure you want to mark dispute "${disputeId}" as RESOLVED?`)) return;
    
    const disputes = JSON.parse(localStorage.getItem('VASIZ_disputes') || '[]');
    const index = disputes.findIndex(d => d.id === disputeId);
    
    if (index !== -1) {
        disputes[index].status = 'Resolved';
        disputes[index].adminResponse = 'Resolved by Admin on ' + new Date().toLocaleDateString();
        localStorage.setItem('VASIZ_disputes', JSON.stringify(disputes));
        renderDisputes();
        alert(`Dispute "${disputeId}" has been marked as RESOLVED.`);
    }
}

function respondToDispute(disputeId) {
    const response = prompt(`Enter your response to dispute "${disputeId}":`);
    if (!response || response.trim() === '') return;
    
    const disputes = JSON.parse(localStorage.getItem('VASIZ_disputes') || '[]');
    const index = disputes.findIndex(d => d.id === disputeId);
    
    if (index !== -1) {
        disputes[index].adminResponse = response.trim();
        localStorage.setItem('VASIZ_disputes', JSON.stringify(disputes));
        renderDisputes();
        alert(`Response sent for dispute "${disputeId}".`);
    }
}

// Global search filter
document.getElementById('admin-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#admin-table-body tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

// --- SPA Navigation Logic ---
function switchAdminView(viewId) {
    // 1. Hide all views
    document.querySelectorAll('.admin-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // 2. Show target view
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    // 3. Update sidebar active state
    document.querySelectorAll('.admin-sidebar-menu li').forEach(li => {
        li.classList.remove('active');
        if(li.getAttribute('onclick') && li.getAttribute('onclick').includes(viewId)) {
            li.classList.add('active');
        }
    });
    
    // 4. Close mobile sidebar if open
    closeSidebarMobile();
}

function toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if(sidebar) sidebar.classList.toggle('open');
}

function closeSidebarMobile() {
    if(window.innerWidth <= 768) {
        const sidebar = document.getElementById('admin-sidebar');
        if(sidebar) sidebar.classList.remove('open');
    }
}
