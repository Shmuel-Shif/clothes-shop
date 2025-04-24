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
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    
    let total = selectedItems.reduce((sum, index) => {
        const item = cart[index];
        return sum + (item ? parseFloat(item.totalPrice) : 0);
    }, 0);

    document.getElementById('checkout-total').textContent = `₪${total.toFixed(2)}`;

    // הסרת הטופס הישן והשארת רק את הכפתורים לתשלום
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // קבלת הפרטים מהטופס
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const total = document.getElementById('checkout-total').textContent.replace('₪', '');

        // קבלת פרטי הסל
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
        
        // יצירת רשימת הפריטים
        const itemsList = selectedItems.map(index => {
            const item = cart[index];
            return `
• ${item.name}
   מידה: ${item.size}
   כמות: ${item.quantity}
   מחיר: ₪${item.totalPrice}
   לצפייה במוצר: https://shmuel-shif.github.io/clothes-shop/${item.image}`;
        }).join('\n\n');

        // יצירת ההודעה
        const message = `היי.
שמי: ${fullName}
טלפון: ${phone}
ביצעתי הזמנה באתר הקולב שבבית

פרטי ההזמנה:
${itemsList}

סה"כ לתשלום: ₪${total}

אני מצרפת צילום מסך של התשלום.
אשמח לקבל אישור שההזמנה התקבלה.`;

        // פתיחת ווצאפ בחלון חדש
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/972552830174?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank', 'width=600,height=600');
    });

    const form = document.getElementById('checkout-form');
    const submitBtn = form.querySelector('.checkout-submit-btn');
    
    // בדיקת תקינות הטופס בכל שינוי
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
        });
        
        // עדכון מצב הכפתור
        submitBtn.disabled = !isValid;
    }
    
    // האזנה לשינויים בשדות החובה
    form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('input', validateForm);
    });
    
    // בדיקה ראשונית
    validateForm();
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

function openBitPayment() {
    const total = document.getElementById('checkout-total').textContent.replace('₪', '');
    // פתיחת אפליקציית ביט
    window.location.href = `https://www.bitpay.co.il/app/pay?phone=0552830174&amount=${total}`;
}

function openPayboxPayment() {
    const total = document.getElementById('checkout-total').textContent.replace('₪', '');
    // פתיחת אפליקציית פייבוקס
    window.location.href = `https://payboxapp.page.link/payment?phone=0552830174&amount=${total}`;
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        // הצגת הודעת הצלחה
        const btn = event.target.closest('.copy-btn');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 2000);
    });
} 