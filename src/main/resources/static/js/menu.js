(function () {
  "use strict";

  // ---------- CONFIG ----------
  const API_BASE = "http://localhost:8080";
  const MENU_URL = `${API_BASE}/menu`;
  const ORDERS_URL = `${API_BASE}/orders`;

  const GST_RATE = 0.05;
  const PACKAGING_FEE = 6;
  const FREE_OFFER_THRESHOLD = 150;

  const CATEGORIES = [
    { id: "all", label: "All", db: null, icon: '<i class="fa-solid fa-utensils"></i>' },
    { id: "meals", label: "Meals", db: "Lunch", icon: '<i class="fa-solid fa-bowl-food"></i>' },
    { id: "south", label: "South Indian", db: "Breakfast", icon: '<i class="fa-solid fa-plate-wheat"></i>' },
    { id: "snacks", label: "Snacks", db: "Snacks", icon: '<i class="fa-solid fa-burger"></i>' },
    { id: "bev", label: "Beverages", db: "Beverages", icon: '<i class="fa-solid fa-mug-hot"></i>' },
    { id: "dessert", label: "Desserts", db: "Desserts", icon: '<i class="fa-solid fa-ice-cream"></i>' }
  ];

  // ---------- STATE ----------
  let MENU = [];
  let cart = {};
  let activeCat = "all";
  let searchTerm = "";

  // ---------- DOM ----------
  const catScroll = document.getElementById("catScroll");
  const menuSections = document.getElementById("menuSections");
  const searchInput = document.getElementById("searchInput");
  const cartBar = document.getElementById("cartBar");
  const cartBarCount = document.getElementById("cartBarCount");
  const cartBarItems = document.getElementById("cartBarItems");
  const cartBarPrice = document.getElementById("cartBarPrice");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const cartDrawer = document.getElementById("cartDrawer");
  const drawerClose = document.getElementById("drawerClose");
  const drawerBody = document.getElementById("drawerBody");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const placeOrderAmount = document.getElementById("placeOrderAmount");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const confirmOrderId = document.getElementById("confirmOrderId");
  const confirmAmount = document.getElementById("confirmAmount");
  const confirmCloseBtn = document.getElementById("confirmCloseBtn");
  const checkoutBackdrop = document.getElementById("checkoutBackdrop");
  const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");
  const upiSection = document.getElementById("upiSection");
  const backCartBtn = document.getElementById("backCartBtn");
  const closeConfirmationBtn = document.getElementById("closeConfirmationBtn");

  function fmt(n) {
    return "₹" + n.toLocaleString("en-IN");
  }

  // ---------- DATA LOADING ----------
  async function loadMenu() {
    try {
      const response = await fetch(MENU_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }
      MENU = await response.json();
      renderMenu();
    } catch (error) {
      console.error(error);
    }
  }

  // ---------- CATEGORY CHIPS ----------
  function renderCatChips() {
    catScroll.innerHTML = "";
    CATEGORIES.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "cat-chip" + (c.id === activeCat ? " active" : "");
      btn.innerHTML = `<div class="circle">${c.icon}</div><div class="label">${c.label}</div>`;
      btn.addEventListener("click", () => {
        activeCat = c.id;
        renderCatChips();
        renderMenu();
      });
      catScroll.appendChild(btn);
    });
  }

  // ---------- MENU ----------
  function getFilteredItems() {
    const category = CATEGORIES.find(c => c.id === activeCat);

    return MENU.filter(item => {
      const matchesCat = activeCat === "all" || item.category === category.db;
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);

      return matchesCat && matchesSearch;
    });
  }

  function renderMenu() {
    const items = getFilteredItems();
    menuSections.innerHTML = "";

    if (items.length === 0) {
      menuSections.innerHTML = '<div class="no-results">No dishes match your search. Try something else <i class="fa-solid fa-utensils"></i></div>';
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === activeCat);
    const label = document.createElement("div");
    label.className = "section-label";
    label.innerHTML = `${catObj.label === "All" ? "Recommended" : catObj.label} <span class="section-count">(${items.length})</span>`;
    menuSections.appendChild(label);

    const list = document.createElement("div");
    list.className = "item-list";
    items.forEach(item => list.appendChild(buildItemCard(item)));
    menuSections.appendChild(list);
  }

  function buildItemCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    const qty = cart[item.id] || 0;

    card.innerHTML = `
      <div class="item-left">
        <div class="veg-row">
          <div class="veg-dot ${item.veg ? "" : "nonveg"}"></div>
          ${item.bestseller ? '<span class="bestseller-tag"><i class="fa-solid fa-fire"></i></span>' : ""}
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-rating">
          <span class="rating-badge"><i class="fa-solid fa-star"></i>${item.rating}</span>
          <span>(${item.ratingCount})</span>
        </div>
        <div class="item-price">${fmt(Number(item.price))}</div>
        ${!item.available
          ? `<div class="stock-badge"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</div>`
          : ""}
        <div class="item-desc">${item.description}</div>
      </div>
      <div class="item-right">
        <div class="item-img">
          <img src="/images/${item.imageUrl}" alt="${item.name}">
        </div>
        <div class="add-zone"></div>
      </div>
    `;

    const addZone = card.querySelector(".add-zone");
    renderQtyControl(addZone, item, qty);
    return card;
  }

  function renderQtyControl(container, item, qty) {
    container.innerHTML = "";

    if (!item.available) {
      const btn = document.createElement("button");
      btn.className = "unavailable-btn";
      btn.textContent = "Out of Stock";
      btn.disabled = true;
      container.appendChild(btn);
      return;
    }

    if (qty === 0) {
      const btn = document.createElement("button");
      btn.className = "add-btn";
      btn.textContent = "Add";
      btn.addEventListener("click", () => changeQty(item.id, 1));
      container.appendChild(btn);
      return;
    }

    const stepper = document.createElement("div");
    stepper.className = "qty-stepper";
    stepper.innerHTML = `
      <button data-a="dec">−</button>
      <span class="qty-val">${qty}</span>
      <button data-a="inc">+</button>
    `;
    stepper.querySelector('[data-a="dec"]').addEventListener("click", () => changeQty(item.id, -1));
    stepper.querySelector('[data-a="inc"]').addEventListener("click", () => changeQty(item.id, 1));
    container.appendChild(stepper);
  }

  function changeQty(itemId, delta) {
    const current = cart[itemId] || 0;
    const next = Math.max(0, current + delta);

    if (next === 0) {
      delete cart[itemId];
    } else {
      cart[itemId] = next;
    }

    renderMenu();
    renderCartBar();
    renderDrawer();
  }

  // ---------- CART CALC ----------
  function getCartEntries() {
    return Object.keys(cart)
      .map(id => ({ item: MENU.find(m => m.id === Number(id)), qty: cart[id] }))
      .filter(e => e.item);
  }

  function getBill() {
    const entries = getCartEntries();
    const itemCount = entries.reduce((s, e) => s + e.qty, 0);
    const itemTotal = entries.reduce((s, e) => s + e.item.price * e.qty, 0);
    const packaging = itemCount > 0 ? PACKAGING_FEE : 0;
    const gst = Math.round((itemTotal + packaging) * GST_RATE);
    const total = itemTotal + packaging + gst;
    return { entries, itemCount, itemTotal, packaging, gst, total };
  }

  // ---------- CART BAR ----------
  function renderCartBar() {
    const { itemCount, total } = getBill();

    if (itemCount > 0) {
      cartBar.classList.add("show");
      cartBarCount.textContent = itemCount;
      cartBarItems.textContent = itemCount + (itemCount === 1 ? " item added" : " items added");
      cartBarPrice.textContent = fmt(total);
    } else {
      cartBar.classList.remove("show");
      closeDrawer();
    }
  }

  // ---------- DRAWER ----------
  function openDrawer() {
    cartDrawer.classList.add("open");
    drawerBackdrop.classList.add("show");
    renderDrawer();
  }

  function closeDrawer() {
    cartDrawer.classList.remove("open");
    drawerBackdrop.classList.remove("show");
  }

  function renderDrawer() {
    const { entries, itemTotal, packaging, gst, total } = getBill();

    if (entries.length === 0) {
      drawerBody.innerHTML = `
        <div class="drawer-empty">
          <div class="big">🛒</div>
          <div>Your cart is empty. Add some tasty items!</div>
        </div>`;
      placeOrderBtn.disabled = true;
      placeOrderAmount.textContent = "₹0";
      return;
    }

    let html = "";
    entries.forEach(({ item, qty }) => {
      html += `
        <div class="drawer-line" data-id="${item.id}">
          <div class="dl-name">
            <div class="n">${item.name}</div>
            <div class="p">${fmt(item.price)} × ${qty}</div>
          </div>
          <div class="dl-qty">
            <button data-a="dec">−</button>
            <span class="v">${qty}</span>
            <button data-a="inc">+</button>
          </div>
          <div class="dl-total">${fmt(item.price * qty)}</div>
        </div>
      `;
    });

    html += `
      <div class="savings-strip">🎉 ${
        itemTotal >= FREE_OFFER_THRESHOLD
          ? "You're eligible for ₹20 off!"
          : `You're ${fmt(FREE_OFFER_THRESHOLD - itemTotal)} away from ₹20 off`
      }</div>
      <div class="bill-block">
        <div class="bill-row"><span>Item Total</span><span>${fmt(itemTotal)}</span></div>
        <div class="bill-row"><span>Packaging Charge</span><span>${fmt(packaging)}</span></div>
        <div class="bill-row"><span>GST (5%)</span><span>${fmt(gst)}</span></div>
        <div class="bill-row total"><span>To Pay</span><span>${fmt(total)}</span></div>
      </div>
    `;

    drawerBody.innerHTML = html;

    drawerBody.querySelectorAll(".drawer-line").forEach(line => {
      const id = Number(line.dataset.id);
      line.querySelector('[data-a="dec"]').addEventListener("click", () => changeQty(id, -1));
      line.querySelector('[data-a="inc"]').addEventListener("click", () => changeQty(id, 1));
    });

    placeOrderBtn.disabled = false;
    placeOrderAmount.textContent = fmt(total);
  }

  // ---------- CHECKOUT FORM HELPERS ----------
  function readOrderForm(entries) {
    return {
      customerName: document.getElementById("customerName").value.trim(),
      mobileNumber: document.getElementById("mobileNumber").value.trim(),
      email: document.getElementById("email").value.trim(),
      pickupLocation: document.getElementById("pickupLocation").value,
      paymentMode: document.querySelector('input[name="paymentMode"]:checked').value,
      items: entries.map(e => ({ menuItemId: e.item.id, quantity: e.qty }))
    };
  }

  function validateOrderForm(orderData) {
    if (orderData.customerName === "") {
      alert("Please enter your name");
      return false;
    }
    if (!/^\d{10}$/.test(orderData.mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  }

  function clearOrderForm() {
    document.getElementById("customerName").value = "";
    document.getElementById("mobileNumber").value = "";
    document.getElementById("email").value = "";
    document.getElementById("pickupLocation").selectedIndex = 0;
  }

  function resetAfterOrder({ redirectHome = false } = {}) {
    modalBackdrop.classList.remove("show");
    cart = {};
    closeDrawer();
    renderMenu();
    renderCartBar();

    if (redirectHome) {
      window.location.href = "/index.html";
    }
  }

  // ---------- EVENTS ----------
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderMenu();
  });

  cartBar.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  document.querySelectorAll('input[name="paymentMode"]').forEach(radio => {
    radio.addEventListener("change", function () {
      if (this.value === "UPI") {
        upiSection.style.display = "block";
        confirmCheckoutBtn.textContent = "I've Paid";
      } else {
        upiSection.style.display = "none";
        confirmCheckoutBtn.textContent = "Confirm Order";
      }
    });
  });

  placeOrderBtn.addEventListener("click", () => {
    const { entries } = getBill();
    if (entries.length === 0) return;
    checkoutBackdrop.classList.add("show");
  });

  confirmCheckoutBtn.addEventListener("click", async () => {
    const { entries } = getBill();
    const orderData = readOrderForm(entries);

    if (!validateOrderForm(orderData)) return;

    confirmCheckoutBtn.disabled = true;
    confirmCheckoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...';

    try {
      const response = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const savedOrder = await response.json();

      checkoutBackdrop.classList.remove("show");
      upiSection.style.display = "none";
      confirmCheckoutBtn.disabled = false;
      confirmCheckoutBtn.innerHTML = "Confirm Order";

      confirmOrderId.textContent = "Order #" + savedOrder.id;
      confirmAmount.textContent = fmt(savedOrder.totalAmount);
      modalBackdrop.classList.add("show");

      cart = {};
      renderDrawer();
      renderMenu();
      renderCartBar();
      clearOrderForm();
    } catch (error) {
      console.error(error);
      confirmCheckoutBtn.disabled = false;
      confirmCheckoutBtn.innerHTML = "Confirm Order";
      alert("Unable to place order.");
    }
  });

  backCartBtn.addEventListener("click", () => {
    checkoutBackdrop.classList.remove("show");
    openDrawer();
  });

  confirmCloseBtn.addEventListener("click", () => resetAfterOrder());
  closeConfirmationBtn.addEventListener("click", () => resetAfterOrder({ redirectHome: true }));

  // ---------- INIT ----------
  renderCatChips();
  loadMenu();
  renderCartBar();
})();