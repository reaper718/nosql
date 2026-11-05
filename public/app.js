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
    // $("#activeUser").textContent = activeUserId ? `User: ${activeUserId.slice(0, 8)}…` : "No user selected";
}

async function loadProducts() {
    const token = sessionStorage.getItem('token');
    axios.get(`${API.products}/getProduct`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        productsCache = res.data.products || [] ;
        $("#products").innerHTML = productsCache.length
            ? productsCache
                  .map(
                      (p) =>
                          `<div class="col-sm-6 col-lg-4 col-xl-3"><div class="card product-card shadow-sm">${imageMarkup(p.imageURL, p.title)}<div class="card-body d-flex flex-column"><h5 class="card-title">${escapeHtml(p.title)}</h5><p class="card-text text-secondary small flex-grow-1">${escapeHtml(p.description || "")}</p><div class="fw-bold mb-3">${money(p.price)}</div><button class="btn btn-primary add-cart mb-2" data-id="${p._id}">Add to cart</button><div class="d-flex gap-2"><button class="btn btn-outline-secondary btn-sm flex-fill edit-product" data-id="${p._id}">Edit</button><button class="btn btn-outline-danger btn-sm flex-fill delete-product" data-id="${p._id}">Delete</button></div></div></div></div>`
                  )
                  .join("")
            : '<div class="col-12"><div class="alert alert-light">No products yet. Add your first product.</div></div>';
    })
    .catch(err => {
        $("#products").innerHTML =
            `<div class="col-12 text-danger">${escapeHtml(err.message)}. Check API URLs and server.</div>`;
    })
}

$("#products").addEventListener("click", async (e) => {
    const add = e.target.closest(".add-cart");
    const edit = e.target.closest(".edit-product");
    const del = e.target.closest(".delete-product");
    const token = sessionStorage.getItem('token');
    if (add) {
        axios.post(`${API.cart}/addToCart/${add.dataset.id}`,{}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            notice("Product added to Cart");
            updateCartCount();
        })
        .catch(err => {
            notice(err.message, "danger");
        })
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
        axios.delete(`${API.products}/deleteProduct/${del.dataset.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            notice("Product Deleted");
            loadProducts();
        })
        .catch(err => {
            notice(err.message, "danger");
        })
    }
});

$("#newProductBtn").addEventListener("click", () => {
    $("#productForm").reset();
    $("#productForm").elements.prodId.value = "";
    $("#productModalTitle").textContent = "Add product";
    productModal.show();
});

const productForm = document.querySelector("#productForm");

productForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const productDetails = {
        title: e.target.title.value,
        price: e.target.price.value,
        imageURL: e.target.imageURL.value,
        description: e.target.description.value
    };

    const token = sessionStorage.getItem('token');

    if(id) {
        axios.post(`${API.products}/editProduct/:id`, productDetails, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => {
            notice("Product added");
            bootstrap.Modal.getOrCreateInstance(document.querySelector('#productModal')).hide();
            loadProducts();
        })
        .catch(err => {
            console.log(err);
        })
    } else {
        axios.post(`${API.products}/addProduct`, productDetails, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => {
            notice("Product added");
            bootstrap.Modal.getOrCreateInstance(document.querySelector('#productModal')).hide();
            loadProducts();
        })
        .catch(err => {
            console.log(err);
        });
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
          bootstrap.Modal.getOrCreateInstance(
                document.querySelector("#loginModal")
            ).hide();

          document.querySelector("#registerBtn").classList.add("d-none");
          document.querySelector("#loginBtn").classList.add("d-none");
        })
        .catch(err => {
          e.target.reset();
          console.log(err);
        })
})


function setActiveUser(id) {
    activeUserId = id.trim();
    localStorage.setItem("miniShopUserId", activeUserId);
    updateUserLabel();
}

function updateCartCount() {
    const token = sessionStorage.getItem('token');
    axios.get(`${API.cart}/getCart`, {
        headers: {
                'Authorization': `Bearer ${token}`
            }
    })
    .then(res => {
        $("#cartCount").textContent = (res.data.products || []).reduce((n, p) => n + p.quantity, 0);
    })
    .catch(err => {
        $("#cartCount").textContent = "0";
    })
}

function showCart() {
    const cartModal = bootstrap.Modal.getOrCreateInstance(
        document.querySelector("#cartModal")
    );

    cartModal.show();
    
    const token = sessionStorage.getItem("token");

    axios.get(`${API.cart}/getCart`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {

        const items = res.data.products || [];

        let total = 0;

        $("#cartItems").innerHTML = items.length
            ? items.map(item => {

                const product = item.productId;
                const quantity = item.quantity;

                const subtotal = Number(product.price) * quantity;

                total += subtotal;

                return `
                    <div class="card mb-2">
                        <div class="card-body d-flex align-items-center gap-3">

                            <img
                                class="cart-thumb"
                                src="${escapeHtml(product.imageURL || "")}"
                                onerror="this.style.visibility='hidden'"
                                alt=""
                            >

                            <div class="flex-grow-1">
                                <strong>${escapeHtml(product.title)}</strong>

                                <div class="text-secondary small">
                                    ${money(product.price)} × ${quantity}
                                </div>
                            </div>

                            <strong>${money(subtotal)}</strong>

                            <button
                                class="btn btn-outline-danger btn-sm remove-cart"
                                data-id="${product._id}">
                                Remove
                            </button>

                        </div>
                    </div>
                `;
            }).join("")
            : '<p class="text-secondary">Your cart is empty.</p>';

        $("#cartTotal").textContent = `Total: ${money(total)}`;

        $("#checkoutBtn").disabled = !items.length;

        updateCartCount();
    })
    .catch(err => {
        console.log(err);
        notice(err.message, "danger");
    });
}

$("#showCartBtn").addEventListener("click", showCart);
// $("#continueShopping").addEventListener("click", () => $("#cartSection").classList.add("d-none"));
$("#cartItems").addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-cart");
    const token = sessionStorage.getItem('token');
    if (!btn) return;

    axios.delete(`${API.cart}/deleteItem/${btn.dataset.id}`, {
        headers: {
                'Authorization': `Bearer ${token}`
            }
    })
    .then(res => {
        showCart();
        notice("Item removed");
    })
    .catch(err => {
        notice(err.message, "danger");
    })
});

$("#checkoutBtn").addEventListener("click", async () => {
    const token = sessionStorage.getItem('token')
    axios.post(`${API.cart}/create-order`, {}, {
        headers: {
                'Authorization': `Bearer ${token}`
            }
    })
    .then(res => {
        notice("Order placed successfully!");
        showCart();
        updateCartCount();
    })
    .catch(err => {
        notice(err.message, "danger");
    })
});

async function showOrders() {

    const ordersModal = bootstrap.Modal.getOrCreateInstance(
        document.querySelector("#ordersModal")
    );

    ordersModal.show();

    const token = sessionStorage.getItem("token");

    try {
        const res = await axios.get(`${API.cart}/orders`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const orders = res.data.orders || [];

        $("#ordersList").innerHTML = orders.length
            ? orders.map(o => {

                let total = 0;

                const productsHTML = o.products.map(item => {

                    const product = item.product;
                    const quantity = item.quantity;

                    const subtotal = Number(product.price) * quantity;

                    total += subtotal;

                    return `
                        <li class="mb-2">
                            <div class="d-flex justify-content-between">
                                <span>
                                    ${escapeHtml(product.title)} × ${quantity}
                                </span>

                                <strong>${money(subtotal)}</strong>
                            </div>
                        </li>
                    `;
                }).join("");

                return `
                    <div class="card mb-3 shadow-sm">
                        <div class="card-body">

                            <div class="d-flex justify-content-between mb-3">
                                <strong>
                                    Order #${String(o._id).slice(-6)}
                                </strong>

                                <span class="text-secondary small">
                                    ${o.createdAt
                                        ? new Date(o.createdAt).toLocaleString()
                                        : ""}
                                </span>
                            </div>

                            <ul class="list-unstyled">
                                ${productsHTML}
                            </ul>

                            <hr>

                            <div class="text-end">
                                <strong>Total: ${money(total)}</strong>
                            </div>

                        </div>
                    </div>
                `;
            }).join("")
            : '<p class="text-secondary text-center py-4">No orders yet.</p>';

    } catch (err) {
        console.log(err);
        notice(err.response?.data?.message || err.message, "danger");
    }
}

$("#showOrdersBtn").addEventListener("click", showOrders);
updateUserLabel();
loadProducts();
updateCartCount();


document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});