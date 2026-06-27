const currentUser = JSON.parse(localStorage.getItem('VASIZ_user'));

if (currentUser && currentUser.role === 'seller') {
    document.getElementById('seller-name-display').innerText = `Vendor: ${currentUser.name}`;
}

const vendorId = currentUser ? currentUser.vendorId : null;
const PLATFORM_COMMISSION_RATE = parseFloat(localStorage.getItem('VASIZ_COMMISSION') || '10') / 100;

document.addEventListener('DOMContentLoaded', () => {
    if(!vendorId) return;
    
    // Load Seller Data
    populateDropdowns();
    renderSellerProducts();
    renderSellerOrders();
    loadBankDetails();
    
    // Listen for real-time Firebase changes if connected
    if(typeof db !== 'undefined') {
        db.collection('products').where('vendorId', '==', vendorId).onSnapshot(snapshot => {
            const products = [];
            snapshot.forEach(doc => products.push(doc.data()));
            renderTable(products);
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

    // Add Product
    const addForm = document.getElementById('seller-add-form');
    if(addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-name').value;
            const price = parseInt(document.getElementById('new-price').value);
            const catSelect = document.getElementById('new-category').value;
            const category = catSelect === '_add_new_' ? document.getElementById('custom-category').value : catSelect;
            
            const warranty = document.getElementById('new-warranty').value;
            const stock = parseInt(document.getElementById('new-stock').value) || 0;
            const desc = document.getElementById('new-desc').value;
            
            const brandSelect = document.getElementById('new-brand').value;
            const brand = brandSelect === '_add_new_' ? document.getElementById('custom-brand').value : (brandSelect || '');
            
            const condition = document.getElementById('new-condition').value || '';
            const weight = document.getElementById('new-weight').value || '';
            const dimensions = document.getElementById('new-dimensions').value || '';
            const packagingSize = document.getElementById('new-packaging').value || '';
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
            
            const fileInput = document.getElementById('new-image-file');
            
            const newProduct = {
                id: Date.now(),
                name,
                price,
                category,
                warranty,
                stock,
                brand,
                condition,
                weight,
                dimensions,
                packagingSize,
                expDate,
                manufacturer,
                pharmacyLicenseUrl,
                ratings: [],
                description: desc,
                vendorId: vendorId, // Assign to this seller!
                status: 'pending' // Maybe admin needs to approve? Or 'active' directly
            };

            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newProduct.image = e.target.result;
                    saveSellerProduct(newProduct);
                    addForm.reset();
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                saveSellerProduct(newProduct);
                addForm.reset();
            }
        });
    }
});

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

function saveSellerProduct(product) {
    let products = getProducts();
    products.push(product);
    saveProducts(products);
    
    // Save to Firebase
    if(typeof db !== 'undefined') {
        db.collection("products").doc(product.id.toString()).set(product)
        .then(() => console.log("Product added to Firebase"))
        .catch(error => console.error("Error adding product: ", error));
    }
    
    renderSellerProducts();
    alert("Product added successfully!");
}

function renderSellerProducts() {
    const allProducts = getProducts();
    const myProducts = allProducts.filter(p => p.vendorId === vendorId);
    renderTable(myProducts);
    
    document.getElementById('total-products').innerText = myProducts.length;
}

function renderTable(products) {
    const tbody = document.getElementById('seller-table-body');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    if(products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">You have no products yet. Add one above!</td></tr>';
        return;
    }
    
    products.forEach(p => {
        const imageSrc = p.image || `https://via.placeholder.com/50?text=No+Img`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id}</td>
            <td><img src="${imageSrc}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>Rs. ${p.price.toLocaleString()}</td>
            <td>
                <button class="action-btn delete-btn" onclick="deleteSellerProduct(${p.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteSellerProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        
        if(typeof db !== 'undefined') {
            db.collection("products").doc(id.toString()).delete()
            .then(() => console.log("Product deleted from Firebase"))
            .catch(error => console.error("Error deleting document: ", error));
        }
        
        renderSellerProducts();
    }
}

function renderSellerOrders() {
    const allOrders = getOrders();
    const tbody = document.getElementById('orders-table-body');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    let totalEarnings = 0;
    let totalOrders = 0;
    
    allOrders.forEach(order => {
        // Filter items in the order that belong to this seller
        const myItemsInOrder = order.items.filter(item => item.vendorId === vendorId);
        
        if(myItemsInOrder.length > 0) {
            totalOrders++;
            const myTotalForOrder = myItemsInOrder.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
            
            // Deduct 10% Platform fee
            const myEarningsForOrder = myTotalForOrder - (myTotalForOrder * PLATFORM_COMMISSION_RATE);
            totalEarnings += myEarningsForOrder;
            
            const itemNames = myItemsInOrder.map(i => i.name).join(', ');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    ${order.trackingId || order.id}<br>
                    <span style="font-size:0.75rem; background:var(--search-bg); padding:2px 5px; border-radius:3px;">${order.paymentMethod || 'Cash on Delivery'}</span>
                </td>
                <td>${order.customerName}</td>
                <td>${itemNames}</td>
                <td>Rs. ${myEarningsForOrder.toLocaleString()}</td>
                <td>${order.date} <br><button onclick="printWaybill('${order.id}')" style="background:#3b82f6; color:white; border:none; padding:4px 10px; border-radius:5px; font-size:0.75rem; cursor:pointer; margin-top:5px;"><i class="fa-solid fa-print"></i> Waybill</button></td>
            `;
            tbody.appendChild(tr);
        }
    });
    
    document.getElementById('total-orders').innerText = totalOrders;
    document.getElementById('total-earnings').innerText = `Rs. ${totalEarnings.toLocaleString()}`;
    
    if(totalOrders === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No orders yet for your products.</td></tr>';
    }
}

// ============================
// BANK DETAILS MANAGEMENT
// ============================

function loadBankDetails() {
    if (!currentUser) return;
    
    // Get latest user data from localStorage
    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const user = users.find(u => u.loginId === currentUser.loginId);
    
    if (user && user.bankDetails) {
        const bank = user.bankDetails;
        const bankName = document.getElementById('seller-bank-name');
        const bankBranch = document.getElementById('seller-bank-branch');
        const accountName = document.getElementById('seller-account-name');
        const accountNumber = document.getElementById('seller-account-number');
        
        if(bankName) bankName.value = bank.bankName || '';
        if(bankBranch) bankBranch.value = bank.branch || '';
        if(accountName) accountName.value = bank.accountName || '';
        if(accountNumber) accountNumber.value = bank.accountNumber || '';
    }
}

function saveBankDetails() {
    if (!currentUser) {
        alert('Please log in first.');
        return;
    }
    
    const bankName = document.getElementById('seller-bank-name').value;
    const branch = document.getElementById('seller-bank-branch').value;
    const accountName = document.getElementById('seller-account-name').value;
    const accountNumber = document.getElementById('seller-account-number').value;
    
    if (!bankName || !accountNumber) {
        alert('Please enter at least the Bank Name and Account Number.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('VASIZ_users')) || [];
    const userIndex = users.findIndex(u => u.loginId === currentUser.loginId);
    
    if (userIndex !== -1) {
        users[userIndex].bankDetails = {
            bankName,
            branch,
            accountName,
            accountNumber
        };
        localStorage.setItem('VASIZ_users', JSON.stringify(users));
        
        // Update session
        currentUser.bankDetails = users[userIndex].bankDetails;
        localStorage.setItem('VASIZ_user', JSON.stringify(currentUser));
        
        if(window.fbSaveUser) window.fbSaveUser(users[userIndex]);
        
        alert('Bank details saved successfully! Admin can now see your payment information.');
    }
}

