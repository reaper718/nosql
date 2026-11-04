const API = {
    products: "http://localhost:3000/product",
    users: "http://localhost:3000/user",
    cart: "http://localhost:3000/cart",
};
const $ = (s) => document.querySelector(s);
const productModal = new bootstrap.Modal($("#productModal"));
const userModal = new bootstrap.Modal($("#userModal"));
let activeUserId = localStorage.getItem("miniShopUserId") || "";
let productsCache = [];

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {}),
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) throw new Error(data.message || `Request failed (${response.status})`);
    return data;
}

function notice(message, type = "success") {
    const el = $("#notice");
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => el.classList.add("d-none"), 4500);
}
function requireUser() {
    if (!activeUserId) {
        notice("Please register or select a user first.", "warning");
        userModal.show();
        return false;
    }
    return true;
}

function money(value) {
    return `₹${Number(value || 0).toFixed(2)}`;
}

function imageMarkup(url, title) {
    return url
        ? `<img class="card-img-top product-image" src="${escapeHtml(url)}" alt="${escapeHtml(title)}" onerror="this.outerHTML='<div class=\'product-placeholder\'>No image</div>'">`
        : '<div class="product-placeholder">No image</div>';
}

function escapeHtml(value = "") {
    return String(value).replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
}

function updateUserLabel() {
    $("#activeUser").textContent = activeUserId ? `User: ${activeUserId.slice(0, 8)}…` : "No user selected";
}

async function loadProducts() {
    try {
        const data = await request(`${API.products}/getProduct`);
        productsCache = data.products || [];
        $("#products").innerHTML = productsCache.length
            ? productsCache
                  .map(
                      (p) =>
                          `<div class="col-sm-6 col-lg-4 col-xl-3"><div class="card product-card shadow-sm">${imageMarkup(p.imageURL, p.title)}<div class="card-body d-flex flex-column"><h5 class="card-title">${escapeHtml(p.title)}</h5><p class="card-text text-secondary small flex-grow-1">${escapeHtml(p.description || "")}</p><div class="fw-bold mb-3">${money(p.price)}</div><button class="btn btn-primary add-cart mb-2" data-id="${p._id}">Add to cart</button><div class="d-flex gap-2"><button class="btn btn-outline-secondary btn-sm flex-fill edit-product" data-id="${p._id}">Edit</button><button class="btn btn-outline-danger btn-sm flex-fill delete-product" data-id="${p._id}">Delete</button></div></div></div></div>`
                  )
                  .join("")
            : '<div class="col-12"><div class="alert alert-light">No products yet. Add your first product.</div></div>';
    } catch (err) {
        $("#products").innerHTML =
            `<div class="col-12 text-danger">${escapeHtml(err.message)}. Check API URLs and server.</div>`;
    }
}

$("#products").addEventListener("click", async (e) => {
    const add = e.target.closest(".add-cart");
    const edit = e.target.closest(".edit-product");
    const del = e.target.closest(".delete-product");
    if (add) {
        if (!requireUser()) return;
        try {
            await request(`${API.cart}/addToCart`, {
                method: "POST",
                body: JSON.stringify({ prodId: add.dataset.id, userId: activeUserId }),
            });
            notice("Product added to cart.");
            await updateCartCount();
        } catch (err) {
            notice(err.message, "danger");
        }
    }
    if (edit) {
        const p = productsCache.find((x) => x._id === edit.dataset.id);
        if (!p) return;
        const f = $("#productForm");
        f.elements.prodId.value = p._id;
        f.elements.title.value = p.title;
        f.elements.price.value = p.price;
        f.elements.imageURL.value = p.imageURL || "";
        f.elements.description.value = p.description || "";
        $("#productModalTitle").textContent = "Edit product";
        productModal.show();
    }
    if (del && confirm("Delete this product?")) {
        try {
            await request(`${API.products}/deleteProduct/${del.dataset.id}`, {
                method: "DELETE",
            });
            notice("Product deleted.");
            await loadProducts();
        } catch (err) {
            notice(err.message, "danger");
        }
    }
});

$("#newProductBtn").addEventListener("click", () => {
    $("#productForm").reset();
    $("#productForm").elements.prodId.value = "";
    $("#productModalTitle").textContent = "Add product";
    productModal.show();
});

$("#productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const payload = Object.fromEntries(new FormData(f).entries());
    const id = payload.prodId;
    delete payload.prodId;
    payload.price = Number(payload.price);
    try {
        if (id) {
            payload.prodId = id;
            await request(`${API.products}/editProduct`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            notice("Product updated.");
        } else {
            await request(`${API.products}/addProduct`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            notice("Product added.");
        }
        productModal.hide();
        await loadProducts();
    } catch (err) {
        notice(err.message, "danger");
    }
});

const userForm = document.querySelector("#userForm");

userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const signUp = {
    name: e.target.name.value,
    email: e.target.email.value,
    password: e.target.password.value
  }

  axios.post(`${API.users}/addUser`, signUp) 
        .then((res) => {
          console.log("User created successfully");
          
          const registerModal = bootstrap.Modal.getInstance(document.querySelector("#userModal"));

          registerModal.hide();
          const loginModal = new bootstrap.Modal(document.querySelector("#loginModal"));
          loginModal.show();

          document.querySelector("#loginForm [name='email]").value = signUp.email;

        })
        .catch(err => console.log(err));
})

const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const loginDetails = {
    email: e.target.email.value,
    password: e.target.password.value
  }

  axios.post(`${API.users}/getUser`, loginDetails)
        .then((res) => {
          sessionStorage.setItem("token", res.data.token);
          
          alert("User logged in successfully!!!");
          const loginModal = new bootstrap.Modal(document.querySelector("#loginModal"));
          loginModal.hide();
        })
        .catch(err => {
          e.target.reset();
          console.log(err);
        })
})

// $("#userForm").addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
//     try {
//         const data = await request(`${API.users}/addUser`, {
//             method: "POST",
//             body: JSON.stringify(payload),
//         });
//         setActiveUser(data.user._id);
//         userModal.hide();
//         e.currentTarget.reset();
//         notice(`Welcome, ${data.user.name}! Your user ID is saved in this browser.`);
//         await updateCartCount();
//     } catch (err) {
//         notice(err.message, "danger");
//     }
// });


function setActiveUser(id) {
    activeUserId = id.trim();
    localStorage.setItem("miniShopUserId", activeUserId);
    updateUserLabel();
}

$("#selectUserBtn").addEventListener("click", async () => {
    const id = $("#existingUserId").value.trim();
    if (!id) return notice("Enter a user ID.", "warning");
    try {
        const data = await request(`${API.users}/getUser/${encodeURIComponent(id)}`);
        setActiveUser(data.user._id);
        userModal.hide();
        notice(`Selected ${data.user.name}.`);
        await updateCartCount();
    } catch (err) {
        notice(err.message, "danger");
    }
});

async function updateCartCount() {
    if (!activeUserId) {
        $("#cartCount").textContent = "0";
        return;
    }
    try {
        const data = await request(`${API.cart}/getCart?userId=${encodeURIComponent(activeUserId)}`);
        $("#cartCount").textContent = (data.products || []).reduce((n, p) => n + p.quantity, 0);
    } catch {
        $("#cartCount").textContent = "0";
    }
}

async function showCart() {
    if (!requireUser()) return;
    $("#ordersSection").classList.add("d-none");
    $("#cartSection").classList.remove("d-none");
    try {
        const data = await request(`${API.cart}/getCart?userId=${encodeURIComponent(activeUserId)}`);
        const items = data.products || [];
        $("#cartItems").innerHTML = items.length
            ? items
                  .map(
                      (p) =>
                          `<div class="card mb-2"><div class="card-body d-flex align-items-center gap-3"><img class="cart-thumb" src="${escapeHtml(p.imageURL || "")}" onerror="this.style.visibility='hidden'" alt=""><div class="flex-grow-1"><strong>${escapeHtml(p.title)}</strong><div class="text-secondary small">${money(p.price)} × ${p.quantity}</div></div><strong>${money(Number(p.price) * p.quantity)}</strong><button class="btn btn-outline-danger btn-sm remove-cart" data-id="${p._id}">Remove</button></div></div>`
                  )
                  .join("")
            : '<p class="text-secondary">Your cart is empty.</p>';
        $("#cartTotal").textContent = `Total: ${money(data.total)}`;
        $("#checkoutBtn").disabled = !items.length;
        await updateCartCount();
    } catch (err) {
        notice(err.message, "danger");
    }
}

$("#showCartBtn").addEventListener("click", showCart);
$("#continueShopping").addEventListener("click", () => $("#cartSection").classList.add("d-none"));
$("#cartItems").addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-cart");
    if (!btn) return;
    try {
        await request(`${API.cart}/deleteItem`, {
            method: "DELETE",
            body: JSON.stringify({ prodId: btn.dataset.id, userId: activeUserId }),
        });
        await showCart();
        notice("Item removed.");
    } catch (err) {
        notice(err.message, "danger");
    }
});

$("#checkoutBtn").addEventListener("click", async () => {
    if (!requireUser()) return;
    try {
        await request(`${API.cart}/create-order`, {
            method: "POST",
            body: JSON.stringify({ userId: activeUserId }),
        });
        notice("Order placed successfully!");
        await showCart();
        await updateCartCount();
    } catch (err) {
        notice(err.message, "danger");
    }
});

async function showOrders() {
    if (!requireUser()) return;
    $("#cartSection").classList.add("d-none");
    $("#ordersSection").classList.remove("d-none");
    try {
        const data = await request(`${API.cart}/orders?userId=${encodeURIComponent(activeUserId)}`);
        const orders = data.orders || [];
        $("#ordersList").innerHTML = orders.length
            ? orders
                  .map(
                      (o) =>
                          `<div class="card mb-3"><div class="card-body"><div class="d-flex justify-content-between"><strong>Order #${String(o._id).slice(-6)}</strong><span>${new Date(o.createdAt).toLocaleString()}</span></div><ul class="mb-2 mt-2">${o.items.map((i) => `<li>${escapeHtml(i.title)} × ${i.quantity} — ${money(i.price * i.quantity)}</li>`).join("")}</ul><strong>Total: ${money(o.total)}</strong></div></div>`
                  )
                  .join("")
            : '<p class="text-secondary">No orders yet.</p>';
    } catch (err) {
        notice(err.message, "danger");
    }
}

$("#showOrdersBtn").addEventListener("click", showOrders);
updateUserLabel();
loadProducts();
updateCartCount();
