// ========================================
// ACCOUNT STORAGE - Local Storage Management
// ========================================

const ACCOUNTS_STORAGE_KEY = "nova_accounts";

// Initialize default accounts if none exist
function initializeAccounts() {
  const existing = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!existing) {
    const defaultAccounts = [
      { 
        id: "018903423", 
        password: "101007", 
        balance: 99999, 
        joined: "03/28/2026", 
        phone: "09633863860", 
        name: "Jessrell M. Custodio" 
      }
    ];
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }
  return JSON.parse(existing);
}

// Get all accounts
function getAllAccounts() {
  const accounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  return accounts ? JSON.parse(accounts) : initializeAccounts();
}

// Save all accounts
function saveAllAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

// Generate a random 9-digit account ID
function generateAccountId() {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Get current date in MM/DD/YYYY format
function getCurrentDate() {
  const date = new Date();
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Find user by phone number
function findUserByPhone(phone) {
  const accounts = getAllAccounts();
  return accounts.find(acc => acc.phone === phone);
}

// Find user by ID
function findUserById(id) {
  const accounts = getAllAccounts();
  return accounts.find(acc => acc.id === id);
}

// Authenticate user
function authenticateUser(phone, password) {
  const accounts = getAllAccounts();
  return accounts.find(acc => acc.phone === phone && acc.password === password);
}

// Create new user
function createUser(name, phone, password) {
  const accounts = getAllAccounts();
  
  // Check if phone already exists
  if (accounts.some(acc => acc.phone === phone)) {
    return { success: false, message: "Phone number already registered" };
  }
  
  const newUser = {
    id: generateAccountId(),
    name: name,
    phone: phone,
    password: password,
    balance: 0,
    joined: getCurrentDate()
  };
  
  accounts.push(newUser);
  saveAllAccounts(accounts);
  
  return { success: true, user: newUser, message: "Account created successfully!" };
}

// Update user balance
function updateUserBalance(userId, newBalance) {
  const accounts = getAllAccounts();
  const userIndex = accounts.findIndex(acc => acc.id === userId);
  if (userIndex !== -1) {
    accounts[userIndex].balance = newBalance;
    saveAllAccounts(accounts);
    return true;
  }
  return false;
}

// Get user credit balance
function getUserBalance(userId) {
  const user = findUserById(userId);
  return user ? user.balance : 0;
}

// Add credit to user
function addUserCredit(userId, amount) {
  const user = findUserById(userId);
  if (user) {
    user.balance += amount;
    updateUserBalance(userId, user.balance);
    return user.balance;
  }
  return 0;
}

// Deduct credit from user
function deductUserCredit(userId, amount) {
  const user = findUserById(userId);
  if (user && user.balance >= amount) {
    user.balance -= amount;
    updateUserBalance(userId, user.balance);
    return true;
  }
  return false;
}

// Export functions for use in app.js
window.AccountManager = {
  getAllAccounts,
  findUserByPhone,
  findUserById,
  authenticateUser,
  createUser,
  updateUserBalance,
  getUserBalance,
  addUserCredit,
  deductUserCredit
};