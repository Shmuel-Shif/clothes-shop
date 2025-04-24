// טעינת פרטי ההזמנה
function loadOrderSummary() {
    const cartItems = getCartItems();
    const container = document.getElementById('order-items');
    const total = calculateTotal(cartItems);
    
    container.innerHTML = cartItems.map(item => `
        <div class="order-item">
            <span>${item.name}</span>
            <span>${item.quantity} × ₪${item.price}</span>
        </div>
    `).join('');
    
    document.getElementById('order-total').textContent = `₪${total.toFixed(2)}`;
}

// טיפול בשינוי אמצעי תשלום
function handlePaymentMethodChange() {
    const creditCardFields = document.getElementById('credit-card-fields');
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    creditCardFields.style.display = paymentMethod === 'credit-card' ? 'block' : 'none';
}

// טיפול בשליחת הטופס
function handleSubmit(event) {
    event.preventDefault();
    
    // בדיקת תקינות הטופס
    const form = event.target;
    if (!form.checkValidity()) {
        return;
    }
    
    // הצגת הודעת הצלחה
    alert('תודה על הרכישה!');
    
    // ניקוי העגלה
    localStorage.removeItem('cart');
    
    // חזרה לדף הבית
    window.location.href = 'index.html';
}

// אתחול העמוד
document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
    
    // האזנה לשינוי באמצעי התשלום
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // האזנה לשליחת הטופס
    document.getElementById('checkout-form').addEventListener('submit', handleSubmit);
});

// פונקציות עזר מ-cart.js
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

function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
} 