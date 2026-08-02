// NOTE: intentionally not wrapped in an IIFE — admin.html calls several of
// these functions directly via inline onclick="..." handlers, so they need
// to stay on the global scope.

if (sessionStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "/admin_login.html";
}

// ---------- CONFIG ----------
const API_BASE = "http://localhost:8080";
const ORDERS_URL = `${API_BASE}/orders`;
const MENU_URL = `${API_BASE}/menu`;

// ---------- DOM ----------
const ordersTable = document.getElementById("ordersTable");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const pendingOrders = document.getElementById("pendingOrders");
const completedOrders = document.getElementById("completedOrders");
const orderModal = document.getElementById("orderModal");
const orderDetails = document.getElementById("orderDetails");
const closeModal = document.getElementById("closeModal");
const dashboardSection = document.getElementById("dashboardSection");
const ordersSection = document.getElementById("ordersSection");
const menuSection = document.getElementById("menuSection");
const dashboardTab = document.getElementById("dashboardTab");
const ordersTab = document.getElementById("ordersTab");
const menuTab = document.getElementById("menuTab");
const allOrdersTable = document.getElementById("allOrdersTable");
const menuModal = document.getElementById("menuModal");
const addMenuBtn = document.getElementById("addMenuBtn");
const closeMenuModal = document.getElementById("closeMenuModal");
const saveMenuBtn = document.getElementById("saveMenuBtn");
const searchOrder = document.getElementById("searchOrder");
const menuTable = document.getElementById("menuTable");

// ---------- STATE ----------
let allOrders = [];
let editingMenuId = null;

// ---------- TAB NAVIGATION ----------
function clearActiveTabs() {
  dashboardTab.classList.remove("active");
  ordersTab.classList.remove("active");
  menuTab.classList.remove("active");
}

function showDashboard() {
  dashboardSection.style.display = "block";
  ordersSection.style.display = "none";
  menuSection.style.display = "none";
  clearActiveTabs();
  dashboardTab.classList.add("active");
}

function showOrders() {
  dashboardSection.style.display = "none";
  ordersSection.style.display = "block";
  menuSection.style.display = "none";
  clearActiveTabs();
  ordersTab.classList.add("active");
  loadOrdersManagement();
}

function showMenu() {
  dashboardSection.style.display = "none";
  ordersSection.style.display = "none";
  menuSection.style.display = "block";
  clearActiveTabs();
  menuTab.classList.add("active");
  loadMenu();
}

// ---------- SHARED ROW HELPERS ----------
function buildStatusSelectHtml(order) {
  return `
    <select class="status-select" onchange="updateStatus(${order.id}, this.value)">
      <option value="PLACED" ${order.status === "PLACED" ? "selected" : ""}>PLACED</option>
      <option value="COMPLETED" ${order.status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
    </select>
  `;
}

function buildViewButtonHtml(order) {
  return `<button class="view-btn" onclick="viewOrder(${order.id})">View</button>`;
}

// ---------- DASHBOARD ----------
async function loadOrders() {
  try {
    const response = await fetch(ORDERS_URL);
    if (!response.ok) {
      throw new Error("Unable to load orders");
    }
    const orders = await response.json();
    const latestOrders = orders.slice(-5).reverse();
    renderDashboard(latestOrders);
  } catch (error) {
    console.error(error);
  }
}

function renderDashboard(orders) {
  ordersTable.innerHTML = "";

  let revenue = 0;
  let placed = 0;
  let completed = 0;

  orders.forEach(order => {
    revenue += Number(order.totalAmount);
    if (order.status === "PLACED") placed++;
    if (order.status === "COMPLETED") completed++;

    ordersTable.innerHTML += `
      <tr>
        <td>${order.id}</td>
        <td>${order.customerName}</td>
        <td>₹${order.totalAmount}</td>
        <td>${order.paymentMode}</td>
        <td>${buildStatusSelectHtml(order)}</td>
        <td>${buildViewButtonHtml(order)}</td>
      </tr>
    `;
  });

  totalOrders.textContent = orders.length;
  totalRevenue.textContent = "₹" + revenue;
  pendingOrders.textContent = placed;
  completedOrders.textContent = completed;
}

// ---------- ORDERS MANAGEMENT ----------
async function loadOrdersManagement() {
  try {
    const response = await fetch(ORDERS_URL);
    if (!response.ok) {
      throw new Error("Unable to load orders");
    }
    allOrders = await response.json();
    renderOrdersTable(allOrders);
  } catch (error) {
    console.error(error);
  }
}

function renderOrdersTable(orders) {
  allOrdersTable.innerHTML = "";

  orders.forEach(order => {
    allOrdersTable.innerHTML += `
      <tr>
        <td>${order.id}</td>
        <td>${order.customerName}</td>
        <td>${order.mobileNumber}</td>
        <td>₹${order.totalAmount}</td>
        <td>${order.paymentMode}</td>
        <td>${buildStatusSelectHtml(order)}</td>
        <td>${buildViewButtonHtml(order)}</td>
      </tr>
    `;
  });
}

async function updateStatus(id, status) {
  try {
    const response = await fetch(`${ORDERS_URL}/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error("Unable to update status");
    }

    loadOrders();
  } catch (error) {
    console.error(error);
    alert("Status update failed.");
  }
}

async function viewOrder(id) {
  try {
    const response = await fetch(`${ORDERS_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Unable to load order");
    }
    const order = await response.json();

    let html = `
      <div class="order-info">

    <div><strong>Customer:</strong> ${order.customerName}</div>

    <div><strong>Payment:</strong> ${order.paymentMode}</div>

    <div><strong>Mobile:</strong> ${order.mobileNumber}</div>

    <div><strong>Status:</strong> ${order.status}</div>

</div>

<hr>

<h3>Ordered Items</h3>
`;

    order.orderItems.forEach(item => {
      html += `
        <div class="order-item">
          <div>${item.menuItem.name} × ${item.quantity}</div>
          <div>₹${item.subtotal}</div>
        </div>
      `;
    });

    html += `<div class="order-total">Total : ₹${order.totalAmount}</div>`;

    orderDetails.innerHTML = html;
    orderModal.classList.add("show");
  } catch (error) {
    console.error(error);
    alert("Unable to load order details.");
  }
}

function filterOrders(status, button) {
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");

  if (status === "ALL") {
    renderOrdersTable(allOrders);
    return;
  }

  const filtered = allOrders.filter(order => order.status === status);
  renderOrdersTable(filtered);
}

searchOrder.addEventListener("input", function () {
  const keyword = this.value.trim().toLowerCase();

  const filtered = allOrders.filter(order => (
    order.id.toString().includes(keyword) ||
    (order.customerName && order.customerName.toLowerCase().includes(keyword)) ||
    (order.mobileNumber && order.mobileNumber.includes(keyword)) ||
    (order.paymentMode && order.paymentMode.toLowerCase().includes(keyword)) ||
    (order.status && order.status.toLowerCase().includes(keyword))
  ));

  renderOrdersTable(filtered);
});

// ---------- MENU MANAGEMENT ----------
async function loadMenu() {
  try {
    const response = await fetch(MENU_URL);
    if (!response.ok) {
      throw new Error("Unable to load menu");
    }
    const menu = await response.json();
    renderMenu(menu);
  } catch (error) {
    console.error(error);
  }
}

function renderMenu(menu) {
  menuTable.innerHTML = "";

  menu.forEach(item => {
    menuTable.innerHTML += `
      <tr>
        <td><img src="/images/${item.imageUrl}" class="menu-image" alt="${item.name}"></td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>₹${item.price}</td>
        <td>
          <label class="switch">
            <input type="checkbox" ${item.available ? "checked" : ""} onchange="toggleAvailability(${item.id}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="action-btn edit-btn" onclick="editMenu(${item.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

async function toggleAvailability(id, available) {
  try {
    const response = await fetch(`${MENU_URL}/${id}/availability?available=${available}`, {
      method: "PATCH"
    });

    if (!response.ok) {
      throw new Error("Unable to update availability");
    }

    loadMenu();
  } catch (error) {
    console.error(error);
    alert("Unable to update availability");
  }
}

function readMenuForm() {
  return {
    name: document.getElementById("menuName").value.trim(),
    description: document.getElementById("menuDescription").value.trim(),
    category: document.getElementById("menuCategory").value,
    price: Number(document.getElementById("menuPrice").value),
    imageUrl: document.getElementById("menuImage").value.trim(),
    veg: document.getElementById("menuVeg").checked,
    bestseller: document.getElementById("menuBestSeller").checked,
    available: document.getElementById("menuAvailable").checked
  };
}

function validateMenuForm(form) {
  if (form.name === "") {
    alert("Menu Name is required");
    return false;
  }
  if (form.description === "") {
    alert("Description is required");
    return false;
  }
  if (form.category === "") {
    alert("Please select a category");
    return false;
  }
  if (isNaN(form.price) || form.price <= 0) {
    alert("Price must be greater than 0");
    return false;
  }
  if (form.imageUrl === "") {
    alert("Image URL is required");
    return false;
  }
  return true;
}

async function addMenuItem() {
  const form = readMenuForm();
  if (!validateMenuForm(form)) return;

  const menuItem = {
    ...form,
    rating: 0,
    ratingCount: "0+"
  };

  const isEditing = editingMenuId != null;
  const url = isEditing ? `${MENU_URL}/${editingMenuId}` : MENU_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuItem)
    });

    if (!response.ok) {
      throw new Error("Unable to save menu item");
    }

    alert(isEditing ? "Menu Item Updated Successfully" : "Menu Item Added Successfully");

    editingMenuId = null;
    saveMenuBtn.textContent = "Save Item";
    menuModal.classList.remove("show");
    loadMenu();
  } catch (error) {
    console.error(error);
    alert(isEditing ? "Unable to update menu item" : "Unable to add menu item");
  }
}

async function editMenu(id) {
  try {
    const response = await fetch(`${MENU_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Unable to load menu item");
    }
    const item = await response.json();

    editingMenuId = id;

    document.getElementById("menuName").value = item.name;
    document.getElementById("menuDescription").value = item.description;
    document.getElementById("menuCategory").value = item.category;
    document.getElementById("menuPrice").value = item.price;
    document.getElementById("menuImage").value = item.imageUrl;
    document.getElementById("menuVeg").checked = item.veg;
    document.getElementById("menuBestSeller").checked = item.bestseller;
    document.getElementById("menuAvailable").checked = item.available;

    saveMenuBtn.textContent = "Update Item";
    menuModal.classList.add("show");
  } catch (error) {
    console.error(error);
    alert("Unable to load menu item");
  }
}

addMenuBtn.addEventListener("click", () => {
  editingMenuId = null;
  saveMenuBtn.textContent = "Save Item";

  document.getElementById("menuName").value = "";
  document.getElementById("menuDescription").value = "";
  document.getElementById("menuCategory").selectedIndex = 0;
  document.getElementById("menuPrice").value = "";
  document.getElementById("menuImage").value = "";
  document.getElementById("menuVeg").checked = false;
  document.getElementById("menuBestSeller").checked = false;
  document.getElementById("menuAvailable").checked = true;

  menuModal.classList.add("show");
});

saveMenuBtn.addEventListener("click", addMenuItem);

// ---------- MODALS ----------
closeModal.addEventListener("click", () => {
  orderModal.classList.remove("show");
});

closeMenuModal.addEventListener("click", () => {
  menuModal.classList.remove("show");
});

// ---------- AUTH ----------
function logout() {
  sessionStorage.removeItem("adminLoggedIn");
  window.location.href = "/admin_login.html";
}

// ---------- INIT ----------
loadOrders();
loadOrdersManagement();