// טעינת נתוני העגלה מ-localStorage
function getCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return {
            ...product,
            quantity: item.quantity
        };
    });
}

// חישוב סכום כולל
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// עדכון כמות פריט
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// הסרת פריט מהעגלה
function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// הצגת פריטי העגלה
function renderCart() {
    const cartItems = getCartItems();
    const container = document.getElementById('cart-items');
    const total = calculateTotal(cartItems);
    
    if (cartItems.length === 0) {
        container.innerHTML = '<p>העגלה ריקה</p>';
        document.getElementById('checkout-btn').disabled = true;
    } else {
        container.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${item.images[0]}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="price">₪${item.price}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeItem(${item.id})">🗑️</button>
            </div>
        `).join('');
        
        document.getElementById('checkout-btn').disabled = false;
    }
    
    document.getElementById('cart-total').textContent = `₪${total.toFixed(2)}`;
}

// אתחול העמוד
document.addEventListener('DOMContentLoaded', renderCart); 