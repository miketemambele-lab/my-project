import { 
    auth, 
    db, 
    getUserRole, 
    getUserData,
    logoutUser
} from "./firebase-config.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    setDoc,
    updateDoc,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

let currentUserID = null;
let currentUserData = null;
let medicationsData = [];

// Page load
window.addEventListener('DOMContentLoaded', async () => {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const role = await getUserRole(user.uid);
    if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    currentUserID = user.uid;
    currentUserData = await getUserData(user.uid);
    document.getElementById('userName').textContent = currentUserData?.userName || 'User';

    // Load data
    await loadMedications();
    await loadInventory();
    await loadSalesHistory();
    await loadStats();

    // Setup event handlers
    setupEventHandlers();

    // Set current date and time
    const now = new Date().toISOString().slice(0, 16);
    document.getElementById('saleDate').value = now;

    // Auto-update status and data every 30 seconds
    setInterval(async () => {
        currentUserData = await getUserData(currentUserID);
        updateStatus();
        await loadMedications();
        await loadInventory();
        await loadStats();
    }, 30000);
});

// Load Medications
async function loadMedications() {
    try {
        const medsSnapshot = await getDocs(collection(db, "medications"));
        medicationsData = [];
        const select = document.getElementById('medicationSelect');
        select.innerHTML = '<option value="">-- Select a medication --</option>';

        medsSnapshot.forEach((doc) => {
            const med = { id: doc.id, ...doc.data() };
            if (med.quantity > 0) {
                medicationsData.push(med);
                const option = document.createElement('option');
                option.value = med.id;
                option.textContent = `${med.name} (${med.dosage}) - TSH ${med.price.toFixed(2)} - Stock: ${med.quantity}`;
                select.appendChild(option);
            }
        });

        document.getElementById('availableMeds').textContent = medicationsData.length;
    } catch (error) {
        console.error("Error loading medications:", error);
    }
}

// Load Inventory with Cards
async function loadInventory() {
    try {
        const medsSnapshot = await getDocs(collection(db, "medications"));
        const cardsContainer = document.getElementById('medicationCards');
        const emptyState = document.getElementById('emptyInventory');

        cardsContainer.innerHTML = '';
        let totalMeds = 0;
        let availableCount = 0;
        let lowStockCount = 0;
        let criticalStockCount = 0;

        medsSnapshot.forEach((doc) => {
            const med = { id: doc.id, ...doc.data() };
            totalMeds++;

            // Calculate stock status
            let stockStatus = 'ok';
            let stockClass = 'stock-ok';
            let stockText = 'Available';

            if (med.quantity === 0) {
                stockStatus = 'out';
                stockClass = 'stock-out';
                stockText = 'Out of Stock';
            } else if (med.quantity <= med.minQuantity) {
                stockStatus = 'critical';
                stockClass = 'stock-critical';
                stockText = 'Critical';
                criticalStockCount++;
            } else if (med.quantity <= med.minQuantity * 1.5) {
                stockStatus = 'low';
                stockClass = 'stock-low';
                stockText = 'Low Stock';
                lowStockCount++;
            } else {
                availableCount++;
            }

            // Create medication card
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.setAttribute('data-medication', med.name.toLowerCase());
            card.setAttribute('data-stock-status', stockStatus);

            card.innerHTML = `
                <div class="medication-card">
                    <div class="medication-header">
                        <div class="medication-title">${med.name}</div>
                        <div class="medication-dosage">${med.dosage}</div>
                    </div>
                    <div class="medication-body">
                        <div class="medication-price">TSH ${med.price.toFixed(2)}</div>
                        <div class="stock-indicator ${stockClass}">
                            <i class="fas fa-circle"></i>
                            ${stockText}
                        </div>
                        ${med.description ? `<div class="medication-description">${med.description}</div>` : ''}
                        <div class="medication-stats">
                            <div class="stat-item">
                                <span class="stat-value">${med.quantity}</span>
                                <span class="stat-label">In Stock</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${med.minQuantity}</span>
                                <span class="stat-label">Min Qty</span>
                            </div>
                            <div class="stat-item">
                                <a href="#sell" class="quick-action-btn" onclick="selectMedication('${med.id}')">
                                    <i class="fas fa-shopping-cart"></i>
                                    Sell
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            cardsContainer.appendChild(card);
        });

        // Update stats
        document.getElementById('totalMeds').textContent = totalMeds;
        document.getElementById('availableMedsCount').textContent = availableCount;
        document.getElementById('lowStockCount').textContent = lowStockCount;
        document.getElementById('criticalStockCount').textContent = criticalStockCount;

        // Show/hide empty state
        if (totalMeds === 0) {
            emptyState.style.display = 'block';
            cardsContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            cardsContainer.style.display = 'flex';
        }

    } catch (error) {
        console.error("Error loading inventory:", error);
        showAlert('Error loading inventory: ' + error.message, 'danger');
    }
}

// Select medication from inventory card
function selectMedication(medId) {
    // Switch to sell tab
    const sellTab = new bootstrap.Tab(document.getElementById('sell-tab'));
    sellTab.show();

    // Find and select the medication
    const select = document.getElementById('medicationSelect');
    select.value = medId;

    // Trigger change event to update price and info
    select.dispatchEvent(new Event('change'));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup Event Handlers
function setupEventHandlers() {
    // Search functionality
    document.getElementById('searchInventory').addEventListener('input', filterInventory);

    // Filter functionality
    document.getElementById('filterStock').addEventListener('change', filterInventory);

    // Medication select change
    document.getElementById('medicationSelect').addEventListener('change', updateMedInfo);

    // Quantity input change
    document.getElementById('saleQuantity').addEventListener('input', calculateTotal);

    // Sale form submission
    document.getElementById('saleForm').addEventListener('submit', recordSale);

    // Profile modal
    document.getElementById('profileModal').addEventListener('show.bs.modal', loadProfileData);
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const logoutBtn = document.getElementById('logoutBtn');
        const originalText = logoutBtn.textContent;

        // Check network connectivity
        if (!navigator.onLine) {
            showAlert('No internet connection. Using offline logout.', 'warning');
            // Force logout without Firebase calls
            localStorage.removeItem('userSettings');
            setTimeout(() => window.location.href = 'login.html', 1000);
            return;
        }

        // Disable button and show loading state
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Logging out...';

        // Set a timeout for the logout operation
        const logoutTimeout = setTimeout(() => {
            console.warn('Logout timeout - forcing redirect');
            localStorage.removeItem('userSettings');
            window.location.href = 'login.html';
        }, 10000); // 10 second timeout

        try {
            // First try the custom logout function
            const result = await logoutUser(currentUserID);
            clearTimeout(logoutTimeout);

            if (result.success) {
                // Clear local settings and redirect
                localStorage.removeItem('userSettings');
                window.location.href = 'login.html';
            } else {
                // If custom logout fails, try direct Firebase signOut
                console.warn('Custom logout failed, trying direct signOut:', result.message);
                await auth.signOut();
                localStorage.removeItem('userSettings');
                window.location.href = 'login.html';
            }
        } catch (error) {
            clearTimeout(logoutTimeout);
            console.error('Logout error:', error);

            // Final fallback - force redirect even if logout fails
            try {
                await auth.signOut();
            } catch (signOutError) {
                console.error('Direct signOut also failed:', signOutError);
            }

            localStorage.removeItem('userSettings');
            window.location.href = 'index.html';
        }
    });
}

// Filter Inventory
function filterInventory() {
    const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
    const stockFilter = document.getElementById('filterStock').value;
    const cards = document.querySelectorAll('#medicationCards .col-md-6');

    cards.forEach(card => {
        const medName = card.getAttribute('data-medication');
        const stockStatus = card.getAttribute('data-stock-status');

        const matchesSearch = medName.includes(searchTerm);
        const matchesFilter = stockFilter === 'all' || stockStatus === stockFilter;

        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Check if any cards are visible
    const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
    const emptyState = document.getElementById('emptyInventory');

    if (visibleCards.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
}
                <td>${med.quantity}</td>
                <td>TSH ${med.price.toFixed(2)}</td>
                <td>${med.description || 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading inventory:", error);
    }
}

// Load Sales History
async function loadSalesHistory() {
    try {
        const salesQuery = query(
            collection(db, "sales"),
            where("userId", "==", currentUserID),
            orderBy("saleDate", "desc"),
            limit(50)
        );
        
        const salesSnapshot = await getDocs(salesQuery);
        const tbody = document.querySelector('#salesHistoryTable tbody');
        tbody.innerHTML = '';

        let totalSales = 0;
        let totalRevenue = 0;

        salesSnapshot.forEach((doc) => {
            const sale = doc.data();
            totalSales++;
            totalRevenue += sale.totalAmount;

            const saleDate = new Date(sale.saleDate.toDate()).toLocaleString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${saleDate}</td>
                <td>${sale.medicationName}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.pricePerUnit.toFixed(2)}</td>
                <td>$${sale.totalAmount.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
    } catch (error) {
        console.error("Error loading sales history:", error);
    }
}

// Load Stats
async function loadStats() {
    updateStatus();
}

// Update user status
async function updateStatus() {
    const status = currentUserData?.isOnline ? '<span class="badge badge-status badge-online"><span class="status-indicator status-online"></span>Online</span>' 
                                              : '<span class="badge badge-status badge-offline"><span class="status-indicator status-offline"></span>Offline</span>';
    document.getElementById('userStatus').innerHTML = status;
}

// Setup Event Handlers
function setupEventHandlers() {
    // Medication select change
    document.getElementById('medicationSelect').addEventListener('change', (e) => {
        const med = medicationsData.find(m => m.id === e.target.value);
        if (med) {
            document.getElementById('salePrice').value = med.price.toFixed(2);
            document.getElementById('availableQty').textContent = med.quantity;
            
            let stockStatus = 'Stock Status: ';
            if (med.quantity <= med.minQuantity) {
                stockStatus += '<span style="color: #e74c3c;">Critical - Stock Low!</span>';
            } else if (med.quantity <= med.minQuantity * 1.5) {
                stockStatus += '<span style="color: #f39c12;">Warning - Stock Below Optimal</span>';
            } else {
                stockStatus += '<span style="color: #2ecc71;">Good</span>';
            }
            document.getElementById('stockStatus').innerHTML = stockStatus;
        }
    });

    // Quantity change
    document.getElementById('saleQuantity').addEventListener('input', calculateTotal);

    // Sale Form Submit
    document.getElementById('saleForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const medicationId = document.getElementById('medicationSelect').value;
        const medication = medicationsData.find(m => m.id === medicationId);
        const quantity = parseInt(document.getElementById('saleQuantity').value);
        const pricePerUnit = parseFloat(document.getElementById('salePrice').value);
        const saleDate = new Date(document.getElementById('saleDate').value);

        if (!medication) {
            showAlert('Please select a medication', 'danger');
            return;
        }

        if (quantity > medication.quantity) {
            showAlert('Insufficient stock available', 'danger');
            return;
        }

        try {
            const totalAmount = quantity * pricePerUnit;

            // Add sale record
            await addDoc(collection(db, "sales"), {
                userId: currentUserID,
                userName: currentUserData.userName,
                medicationId,
                medicationName: medication.name,
                quantity,
                pricePerUnit,
                totalAmount,
                saleDate: new Date(saleDate),
                createdAt: new Date()
            });

            // Update medication stock
            await updateDoc(doc(db, "medications", medicationId), {
                quantity: medication.quantity - quantity
            });

            // Update user stats
            await updateDoc(doc(db, "users", currentUserID), {
                totalSales: (currentUserData.totalSales || 0) + 1
            });

            showAlert('Sale recorded successfully!', 'success');
            e.target.reset();
            document.getElementById('saleDate').value = new Date().toISOString().slice(0, 16);
            
            // Reload data
            await loadMedications();
            await loadInventory();
            await loadSalesHistory();
            await loadStats();
        } catch (error) {
            showAlert('Error recording sale: ' + error.message, 'danger');
        }
    });

    // Profile Modal
    const profileModal = document.getElementById('profileModal');
    profileModal.addEventListener('show.bs.modal', () => {
        document.getElementById('profileUsername').value = currentUserData.userName;
        document.getElementById('profileEmail').value = currentUserData.email;
        document.getElementById('profileRole').value = currentUserData.role;
        const createdAt = new Date(currentUserData.createdAt.toDate()).toLocaleDateString();
        document.getElementById('profileCreatedAt').value = createdAt;
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const logoutBtn = document.getElementById('logoutBtn');
        const originalText = logoutBtn.textContent;
        
        // Check network connectivity
        if (!navigator.onLine) {
            showAlert('No internet connection. Using offline logout.', 'warning');
            // Force logout without Firebase calls
            localStorage.removeItem('userSettings');
            setTimeout(() => window.location.href = 'login.html', 1000);
            return;
        }
        
        // Disable button and show loading state
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Logging out...';
        
        // Set a timeout for the logout operation
        const logoutTimeout = setTimeout(() => {
            console.warn('Logout timeout - forcing redirect');
            localStorage.removeItem('userSettings');
            window.location.href = 'login.html';
        }, 10000); // 10 second timeout
        
        try {
            // First try the custom logout function
            const result = await logoutUser(currentUserID);
            clearTimeout(logoutTimeout);
            
            if (result.success) {
                // Clear local settings and redirect
                localStorage.removeItem('userSettings');
                window.location.href = 'login.html';
            } else {
                // If custom logout fails, try direct Firebase signOut
                console.warn('Custom logout failed, trying direct signOut:', result.message);
                await auth.signOut();
                localStorage.removeItem('userSettings');
                window.location.href = 'login.html';
            }
        } catch (error) {
            clearTimeout(logoutTimeout);
            console.error('Logout error:', error);
            
            // Final fallback - force redirect even if logout fails
            try {
                await auth.signOut();
            } catch (signOutError) {
                console.error('Direct signOut also failed:', signOutError);
            }
            
            localStorage.removeItem('userSettings');
            window.location.href = 'login.html';
        }
    });
}

// Calculate total
function calculateTotal() {
    const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    const total = (quantity * price).toFixed(2);
    document.getElementById('saleTotal').textContent = total;
}

// Show Alert
function showAlert(message, type = 'danger') {
    const alertDiv = document.getElementById('alertDiv');
    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show alert-custom" role="alert" style="margin-bottom: 20px;">
            <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}
