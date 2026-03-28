// ========================================
// APPLICATION STATE
// ========================================
let cart = [];
let currentCategory = "all";
let searchQuery = "";
let currentPage = "home";
let currentUser = null;

// Your Google Sheets Web App URL
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxKPjXQNO0MY29lYFBzRDg-V8siqPwFPNexVFLCcmHO7iCprCLO_AGkxr8iirWUhtjyBg/exec";

// ========================================
// HELPER FUNCTIONS
// ========================================
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function showToast(message, duration = 1800) {
  const toast = document.getElementById("toastMsg");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, duration);
}

// ========================================
// ACCOUNT MODAL FUNCTIONS
// ========================================
function openAccountModal() {
  const modal = document.getElementById("accountModal");
  modal.classList.add("show");
  document.getElementById("loginForm").reset();
  document.getElementById("registerForm").reset();
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.disabled = false;
    registerBtn.innerHTML = "Create Account";
  }
  const loadingIndicator = document.getElementById("registerLoading");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }
}

function closeAccountModal() {
  const modal = document.getElementById("accountModal");
  modal.classList.remove("show");
}

function openProfileModal() {
  if (!currentUser) {
    openAccountModal();
    return;
  }
  
  document.getElementById("profileName").innerText = currentUser.name;
  document.getElementById("profileId").innerText = currentUser.id;
  document.getElementById("profilePhone").innerText = currentUser.phone;
  document.getElementById("profileJoined").innerText = currentUser.joined || new Date().toLocaleDateString();
  document.getElementById("profileBalance").innerHTML = `₱${(currentUser.balance || 0).toLocaleString()}`;
  
  const modal = document.getElementById("profileModal");
  modal.classList.add("show");
}

function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  modal.classList.remove("show");
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (tabName === 'login') {
    document.querySelector('.tab-btn:first-child').classList.add('active');
  } else {
    document.querySelector('.tab-btn:last-child').classList.add('active');
  }
  
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  if (tabName === 'login') {
    document.getElementById('loginTab').classList.add('active');
  } else {
    document.getElementById('registerTab').classList.add('active');
  }
}

// ========================================
// LOGIN WITH PHONE NUMBER FIX
// ========================================
async function handleLogin(event) {
  event.preventDefault();
  let phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;
  const loginBtn = document.getElementById("loginBtn");
  
  if (!phone || !password) {
    showToast("Please fill in all fields", 1500);
    return;
  }
  
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  
  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getUsers`);
    const users = await response.json();
    
    console.log("Available users:", users);
    console.log("Trying to login with phone:", phone, "password:", password);
    
    const user = users.find(u => {
      const sheetPhone = u.phone.toString();
      const inputPhone = phone.toString();
      
      if (sheetPhone === inputPhone) return true;
      if (inputPhone.startsWith('09') && sheetPhone === inputPhone.substring(1)) return true;
      if (sheetPhone.startsWith('09') && inputPhone === sheetPhone.substring(1)) return true;
      
      return false;
    });
    
    if (user) {
      console.log("✅ User found:", user);
      
      currentUser = {
        id: user.accountId,
        name: user.name,
        phone: user.phone,
        password: user.password,
        balance: user.balance || 0,
        joined: new Date().toLocaleDateString()
      };
      
      localStorage.setItem("nova_user", JSON.stringify(currentUser));
      document.getElementById("userNameDisplay").innerText = currentUser.name.split(' ')[0];
      showToast(`Welcome back, ${user.name}!`, 2000);
      closeAccountModal();
      renderCartUI();
    } else {
      console.log("❌ No user found");
      showToast("Invalid phone number or password", 1500);
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("Login failed. Please try again.", 1500);
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
  }
}

// ========================================
// REGISTER FUNCTION
// ========================================
async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("regFullName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const registerBtn = document.getElementById("registerBtn");
  const loadingIndicator = document.getElementById("registerLoading");
  
  if (!name || !phone || !password) {
    showToast("Please fill in all fields", 1500);
    return;
  }
  
  if (password !== confirmPassword) {
    showToast("Passwords do not match", 1500);
    return;
  }
  
  if (!/^09\d{9}$/.test(phone) && !/^\d{10}$/.test(phone)) {
    showToast("Please enter a valid phone number (09XXXXXXXXX)", 1500);
    return;
  }
  
  const accountId = Math.floor(100000000 + Math.random() * 900000000).toString();
  const joinedDate = new Date().toLocaleDateString();
  
  registerBtn.disabled = true;
  registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
  loadingIndicator.style.display = "block";
  
  try {
    const formData = new URLSearchParams();
    formData.append("action", "addUser");
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("accountId", accountId);
    formData.append("timestamp", new Date().toISOString());
    
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentUser = {
        id: accountId,
        name: name,
        phone: phone,
        password: password,
        balance: 0,
        joined: joinedDate
      };
      
      localStorage.setItem("nova_user", JSON.stringify(currentUser));
      document.getElementById("userNameDisplay").innerText = currentUser.name.split(' ')[0];
      showToast(`✅ Account created successfully!\n\nWelcome, ${name}!\nYour Account ID: ${accountId}`, 4000);
      closeAccountModal();
      document.getElementById("registerForm").reset();
    } else {
      showToast(result.message || "Registration failed. Phone may already exist.", 1500);
    }
  } catch (error) {
    console.error("Registration error:", error);
    showToast("Registration failed. Please try again.", 1500);
  } finally {
    registerBtn.disabled = false;
    registerBtn.innerHTML = "Create Account";
    loadingIndicator.style.display = "none";
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("nova_user");
  document.getElementById("userNameDisplay").innerText = "";
  closeProfileModal();
  showToast("Logged out successfully", 1500);
  cart = [];
  updateCartBadge();
  saveCartToLocal();
  renderCartUI();
}

// ========================================
// CREDIT FUNCTIONS
// ========================================
function loadUserCredit() {
  if (currentUser) {
    return currentUser.balance || 0;
  }
  return 0;
}

function saveUserCredit() {
  if (currentUser) {
    localStorage.setItem("nova_user", JSON.stringify(currentUser));
  }
}

async function addUserCredit(amount) {
  if (!currentUser) return 0;
  
  try {
    const formData = new URLSearchParams();
    formData.append("action", "updateBalance");
    formData.append("phone", currentUser.phone);
    formData.append("amount", amount);
    formData.append("operation", "add");
    
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentUser.balance = result.newBalance;
      localStorage.setItem("nova_user", JSON.stringify(currentUser));
      showToast(`₱${amount} added to your credit balance! Current balance: ₱${currentUser.balance}`, 2500);
      return currentUser.balance;
    } else {
      showToast(result.message || "Failed to add credit", 1500);
      return 0;
    }
  } catch (error) {
    console.error("Credit error:", error);
    showToast("Failed to add credit. Please try again.", 1500);
    return 0;
  }
}

// ========================================
// ORDERS FUNCTIONS
// ========================================
async function placeOrder() {
  if (!currentUser) {
    showToast("Please login to place order", 1500);
    openAccountModal();
    return false;
  }
  
  if (cart.length === 0) {
    showToast("Your cart is empty. Add some items first!", 1500);
    return false;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const userBalance = currentUser.balance || 0;
  
  console.log("Placing order...");
  console.log("Total:", total);
  console.log("User Balance:", userBalance);
  console.log("Cart items:", cart);
  
  if (userBalance < total) {
    showToast(`Insufficient balance! You have ₱${userBalance}, need ₱${total}`, 2000);
    return false;
  }
  
  const orderList = cart.map(item => `${item.name} x${item.quantity} (₱${item.price * item.quantity})`).join(", ");
  
  try {
    const balanceData = new URLSearchParams();
    balanceData.append("action", "updateBalance");
    balanceData.append("phone", currentUser.phone);
    balanceData.append("amount", total);
    balanceData.append("operation", "deduct");
    
    const balanceResponse = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: balanceData
    });
    
    const balanceResult = await balanceResponse.json();
    console.log("Balance update result:", balanceResult);
    
    if (!balanceResult.success) {
      showToast(balanceResult.message || "Failed to process payment", 1500);
      return false;
    }
    
    const orderData = new URLSearchParams();
    orderData.append("action", "addOrder");
    orderData.append("timestamp", new Date().toISOString());
    orderData.append("fullName", currentUser.name);
    orderData.append("accountId", currentUser.id);
    orderData.append("phone", currentUser.phone);
    orderData.append("orderList", orderList);
    orderData.append("totalPrice", total);
    orderData.append("status", "Pending");
    
    const orderResponse = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: orderData
    });
    
    const orderResult = await orderResponse.json();
    console.log("Order save result:", orderResult);
    
    if (orderResult.success) {
      currentUser.balance = balanceResult.newBalance;
      localStorage.setItem("nova_user", JSON.stringify(currentUser));
      
      cart = [];
      updateCartBadge();
      saveCartToLocal();
      renderCartUI();
      
      showToast(`✅ Order placed successfully! Total: ₱${total}. Remaining balance: ₱${currentUser.balance}`, 3000);
      return true;
    } else {
      const refundData = new URLSearchParams();
      refundData.append("action", "updateBalance");
      refundData.append("phone", currentUser.phone);
      refundData.append("amount", total);
      refundData.append("operation", "add");
      await fetch(GOOGLE_SHEETS_URL, { method: "POST", body: refundData });
      
      showToast(orderResult.message || "Order failed. Please try again.", 1500);
      return false;
    }
  } catch (error) {
    console.error("Order error:", error);
    showToast("Order failed. Please try again.", 1500);
    return false;
  }
}

async function loadUserOrders() {
  if (!currentUser) {
    return;
  }
  
  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) return;
  
  ordersContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading orders...</div>';
  
  try {
    const formData = new URLSearchParams();
    formData.append("action", "getUserOrders");
    formData.append("phone", currentUser.phone);
    
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      body: formData
    });
    
    const orders = await response.json();
    console.log("Orders loaded:", orders);
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-orders">
          <i class="fas fa-receipt" style="font-size: 4rem; color: #e63946; margin-bottom: 20px;"></i>
          <p>No orders yet. Start shopping!</p>
          <button class="btn-primary-apple" onclick="switchPage('shop')" style="margin-top: 20px;">Shop Now</button>
        </div>
      `;
      return;
    }
    
    ordersContainer.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span class="order-date">📅 ${new Date(order.timestamp).toLocaleString()}</span>
          <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
        </div>
        <div class="order-items">
          ${order.orderList.split(', ').map(item => {
            const parts = item.split(' (₱');
            return `<div class="order-item">
              <span class="order-item-name">${parts[0]}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="order-total">
          <span>Total:</span>
          <span>₱${parseFloat(order.totalPrice).toLocaleString()}</span>
        </div>
      </div>
    `).reverse().join('');
    
  } catch (error) {
    console.error("Load orders error:", error);
    ordersContainer.innerHTML = `
      <div class="empty-orders">
        <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #e63946; margin-bottom: 20px;"></i>
        <p>Failed to load orders. Please try again.</p>
      </div>
    `;
  }
}

// ========================================
// PAGE NAVIGATION
// ========================================
function switchPage(pageName) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  const targetPage = document.getElementById(`${pageName}Page`);
  if (targetPage) targetPage.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageName) link.classList.add('active');
  });
  currentPage = pageName;
  if (pageName === 'featured') loadFeaturedPage();
  else if (pageName === 'shop') renderProducts();
  else if (pageName === 'orders') loadUserOrders();
}

// ========================================
// CART FUNCTIONS
// ========================================
function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cartCountBadge");
  if (badge) badge.innerText = totalItems;
  saveCartToLocal();
}

function saveCartToLocal() { 
  localStorage.setItem("nova_cart", JSON.stringify(cart)); 
}

function loadCartFromLocal() {
  const saved = localStorage.getItem("nova_cart");
  cart = saved ? JSON.parse(saved) : [];
  updateCartBadge();
  renderCartUI();
}

function addToCart(productId) {
  if (!currentUser) {
    showToast("Please login to add items to cart", 1500);
    openAccountModal();
    return;
  }
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
  updateCartBadge();
  saveCartToLocal();
  renderCartUI();
  showToast(`${product.name} added to cart! 🍢`);
}

function updateQuantity(itemId, delta) {
  const idx = cart.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const newQty = cart[idx].quantity + delta;
  if (newQty <= 0) cart.splice(idx, 1);
  else cart[idx].quantity = newQty;
  updateCartBadge();
  saveCartToLocal();
  renderCartUI();
}

function removeItem(itemId) {
  cart = cart.filter(i => i.id !== itemId);
  updateCartBadge();
  saveCartToLocal();
  renderCartUI();
}

function renderCartUI() {
  const cartListDiv = document.getElementById("cartItemsList");
  const totalSpan = document.getElementById("cartTotalPrice");
  if (!cartListDiv) return;
  if (cart.length === 0) {
    cartListDiv.innerHTML = `<div class="empty-cart-msg">Your cart is empty.<br>Add something delicious ✨</div>`;
    if (totalSpan) totalSpan.innerText = "₱0.00";
    return;
  }
  let total = 0;
  let html = "";
  for (let item of cart) {
    total += item.price * item.quantity;
    html += `<div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img" style="font-size: 2rem;">${item.image}</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-id="${item.id}" data-delta="-1">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-id="${item.id}" data-delta="+1">+</button>
            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>`;
  }
  cartListDiv.innerHTML = html;
  let finalTotal = total;
  if (currentUser && (currentUser.balance || 0) > 0 && finalTotal > 0) {
    const creditToUse = Math.min(currentUser.balance, finalTotal);
    finalTotal = finalTotal - creditToUse;
    if (totalSpan) totalSpan.innerText = `₱${finalTotal.toFixed(2)} (Saved ₱${creditToUse} with credit)`;
  } else {
    if (totalSpan) totalSpan.innerText = `₱${total.toFixed(2)}`;
  }
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      const delta = parseInt(btn.getAttribute('data-delta'));
      if (!isNaN(id) && !isNaN(delta)) updateQuantity(id, delta);
    });
  });
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      if (!isNaN(id)) removeItem(id);
    });
  });
}

// ========================================
// PRODUCT DISPLAY
// ========================================
function getFilteredProducts() {
  let filtered = [...products];
  if (currentCategory !== "all") filtered = filtered.filter(p => p.category === currentCategory);
  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  return filtered;
}

function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  const filtered = getFilteredProducts();
  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 60px;">✨ No products match. Try another filter.</div>`;
    return;
  }
  let productHtml = "";
  filtered.forEach(prod => {
    productHtml += `<div class="product-card-apple" data-id="${prod.id}">
        <div class="product-img-apple" style="font-size: 4rem; background: #f5f5f7;">${prod.image}</div>
        <div class="product-info-apple">
          <div class="product-category-apple">${escapeHtml(prod.category)}</div>
          <div class="product-title-apple">${escapeHtml(prod.name)}</div>
          <div class="product-price-apple">₱${prod.price.toFixed(2)}</div>
          <button class="add-to-cart-apple" data-id="${prod.id}"><i class="fas fa-plus-circle"></i> Add to Cart</button>
        </div>
      </div>`;
  });
  container.innerHTML = productHtml;
  document.querySelectorAll('.add-to-cart-apple').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

// ========================================
// FEATURED PAGE
// ========================================
function loadFeaturedPage() {
  renderFeaturedProducts();
  if (currentUser) loadUserCredit();
}

async function redeemCode() {
  if (!currentUser) {
    showToast("Please login to redeem codes", 1500);
    openAccountModal();
    return;
  }
  
  const codeInput = document.getElementById("redemptionCode");
  const code = codeInput.value.trim();
  const messageDiv = document.getElementById("codeMessage");
  
  if (!code) {
    showToast("Please enter a code", 1500);
    return;
  }
  
  if (promoCodeRewards[code]) {
    const reward = promoCodeRewards[code];
    const redeemBtn = document.querySelector('#featuredPage .btn-primary-apple');
    const originalBtnText = redeemBtn.innerHTML;
    
    redeemBtn.disabled = true;
    redeemBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redeeming...';
    
    try {
      const formData = new URLSearchParams();
      formData.append("action", "updateBalance");
      formData.append("phone", currentUser.phone);
      formData.append("amount", reward.value);
      formData.append("operation", "add");
      
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        currentUser.balance = result.newBalance;
        localStorage.setItem("nova_user", JSON.stringify(currentUser));
        
        const logData = new URLSearchParams();
        logData.append("action", "addRedemption");
        logData.append("timestamp", new Date().toISOString());
        logData.append("accountId", currentUser.id);
        logData.append("fullName", currentUser.name);
        logData.append("phone", currentUser.phone);
        logData.append("codeInput", code);
        logData.append("reward", `${reward.value} peso credit - ${reward.message}`);
        
        fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          body: logData
        }).catch(err => console.error("Logging error:", err));
        
        messageDiv.innerHTML = `<div class="code-message success">✓ ${reward.message} Your credit balance: ₱${currentUser.balance}</div>`;
        codeInput.value = "";
        setTimeout(() => { messageDiv.innerHTML = ""; }, 3000);
      } else {
        showToast(result.message || "Redemption failed", 1500);
      }
    } catch (error) {
      console.error("Redemption error:", error);
      showToast("Redemption failed. Please try again.", 1500);
    } finally {
      redeemBtn.disabled = false;
      redeemBtn.innerHTML = originalBtnText;
    }
  } else {
    messageDiv.innerHTML = `<div class="code-message error">✗ Invalid code. Please try again.</div>`;
    setTimeout(() => { messageDiv.innerHTML = ""; }, 2000);
  }
}

function renderFeaturedProducts() {
  const featuredGrid = document.getElementById("featuredGrid");
  if (!featuredGrid) return;
  const featured = products.filter(p => p.name === "Fruity milk" || p.name === "Milk shake" || p.name === "Halo-halo");
  featuredGrid.innerHTML = featured.map(prod => `<div class="product-card-apple">
      <div class="product-img-apple" style="font-size: 4rem; background: #f5f5f7;">${prod.image}</div>
      <div class="product-info-apple">
        <div class="product-title-apple">${prod.name}</div>
        <div class="product-price-apple">₱${prod.price}</div>
        <button class="add-to-cart-apple" onclick="addToCart(${prod.id})">Add to Cart</button>
      </div>
    </div>`).join('');
}

// ========================================
// HELP PAGE FUNCTIONS
// ========================================
function startChat() { showToast("Connecting to live chat... (demo)", 1500); }
function sendEmail() { window.location.href = "mailto:support@nova.com"; }
function callSupport() { showToast("Calling 1-800-NOVA-HELP... (demo)", 1500); }
function toggleFAQ(element) {
  const faqItem = element.closest('.faq-item-apple');
  faqItem.classList.toggle('active');
}
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Message sent! We'll respond within 24 hours.", 2000);
      form.reset();
    });
  }
}

// ========================================
// FILTER & SEARCH
// ========================================
function initFilters() {
  document.querySelectorAll('.cat-btn-apple').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn-apple').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      renderProducts();
    });
  });
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }
}

// ========================================
// CART DRAWER
// ========================================
function initCartDrawer() {
  const cartIcon = document.getElementById('cartIconBtn');
  const overlay = document.getElementById('cartOverlay');
  const drawer = document.getElementById('cartDrawer');
  const closeBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  function openDrawer() { overlay.classList.add('open'); drawer.classList.add('open'); renderCartUI(); }
  function closeDrawer() { overlay.classList.remove('open'); drawer.classList.remove('open'); }
  
  if (cartIcon) cartIcon.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      const success = await placeOrder();
      if (success) {
        closeDrawer();
      }
    });
  }
}

// ========================================
// ACCOUNT ICON
// ========================================
function initAccountIcon() {
  const accountIcon = document.getElementById('accountIcon');
  if (accountIcon) {
    accountIcon.addEventListener('click', () => {
      if (currentUser) {
        openProfileModal();
      } else {
        openAccountModal();
      }
    });
  }
}

// ========================================
// HAMBURGER MENU FUNCTIONS - LIKE MODAL
// ========================================
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (!hamburger || !navLinks) return;
  
  // Create overlay element if it doesn't exist
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }
  
  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function openMenu() {
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Toggle menu on hamburger click
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  
  // Close menu when clicking on overlay
  overlay.addEventListener('click', closeMenu);
  
  // Close menu when clicking on a nav link (navigation)
  const navItems = navLinks.querySelectorAll('a');
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
  
  // Close menu on window resize (if switching to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });
}

// ========================================
// NEWSLETTER
// ========================================
function subscribeNewsletter() {
  const email = document.getElementById("newsletterEmail");
  if (email && email.value && email.value.includes('@')) {
    showToast("Subscribed successfully! Check your email for updates.", 2000);
    email.value = "";
  } else if (email) {
    showToast("Please enter a valid email address.", 1500);
  }
}

// ========================================
// TEST LOGIN FUNCTION
// ========================================
function testLoginWithPhone(phone, password) {
  console.log("Testing login with:", phone, password);
  fetch(`${GOOGLE_SHEETS_URL}?action=getUsers`)
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => {
        const sheetPhone = u.phone.toString();
        const inputPhone = phone.toString();
        if (sheetPhone === inputPhone) return true;
        if (inputPhone.startsWith('09') && sheetPhone === inputPhone.substring(1)) return true;
        if (sheetPhone.startsWith('09') && inputPhone === sheetPhone.substring(1)) return true;
        return false;
      });
      if (user) {
        console.log("✅ Login would work!", user);
        alert(`Login would work! User: ${user.name}`);
      } else {
        console.log("❌ Login would fail");
        alert("Login would fail. Check console for available users.");
      }
    });
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
  console.log("Initializing NOVA e-commerce app...");
  
  const savedUser = localStorage.getItem("nova_user");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      document.getElementById("userNameDisplay").innerText = currentUser.name.split(' ')[0];
    } catch(e) { currentUser = null; }
  }
  
  loadCartFromLocal();
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      switchPage(page);
    });
  });
  
  switchPage('home');
  initFilters();
  initCartDrawer();
  initContactForm();
  initAccountIcon();
  initHamburgerMenu();
  
  window.switchPage = switchPage;
  window.addToCart = addToCart;
  window.redeemCode = redeemCode;
  window.startChat = startChat;
  window.sendEmail = sendEmail;
  window.callSupport = callSupport;
  window.toggleFAQ = toggleFAQ;
  window.subscribeNewsletter = subscribeNewsletter;
  window.openAccountModal = openAccountModal;
  window.closeAccountModal = closeAccountModal;
  window.openProfileModal = openProfileModal;
  window.closeProfileModal = closeProfileModal;
  window.switchTab = switchTab;
  window.handleLogin = handleLogin;
  window.handleRegister = handleRegister;
  window.logout = logout;
  window.testLoginWithPhone = testLoginWithPhone;
}

document.addEventListener('DOMContentLoaded', init);