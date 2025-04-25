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

// פונקציות להצגת והסתרת ה-Loader
function showLoader() {
    document.querySelector('.loader-container').classList.add('show');
}

function hideLoader() {
    document.querySelector('.loader-container').classList.remove('show');
}

// עדכון הקוד הקיים בטיפול בשליחת הטופס
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showLoader(); // הצגת ה-Loader

    try {
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

        // פתיחת ווצאפ והמתנה קצרה
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/972552830174?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank', 'width=600,height=600');

        // המתנה של שנייה אחת לפני המעבר
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ניקוי העגלה
        localStorage.removeItem('cart');
        localStorage.removeItem('selectedItems');

        // מעבר לעמוד התודה
        window.location.href = 'thank-you.html';
    } catch (error) {
        console.error('Error:', error);
        alert('אירעה שגיאה, אנא נסי שוב');
    } finally {
        hideLoader(); // הסתרת ה-Loader בכל מקרה
    }
});

// אתחול העמוד
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    
    let total = selectedItems.reduce((sum, index) => {
        const item = cart[index];
        return sum + (item ? parseFloat(item.totalPrice) : 0);
    }, 0);

    document.getElementById('checkout-total').textContent = `₪${total.toFixed(2)}`;

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
    window.open(`https://www.bitpay.co.il/app/pay?phone=0552830174&amount=${total}`, '_blank');
}

function openPayboxPayment() {
    const total = document.getElementById('checkout-total').textContent.replace('₪', '');
    window.open(`https://payboxapp.page.link/payment?phone=0552830174&amount=${total}`, '_blank');
}

function copyToClipboard(elementId, event) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        // מציאת הכפתור שנלחץ
        const btn = event.target.closest('.copy-btn');
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        
        // שינוי האייקון ל-V
        icon.className = 'fas fa-check';
        
        // החזרת האייקון המקורי אחרי 2 שניות
        setTimeout(() => {
            icon.className = originalClass;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
    
    // מניעת המשך התנהגות ברירת המחדל של הטופס
    event.preventDefault();
    event.stopPropagation();
    return false;
}

// הוספת לודר במעבר בין עמודים
// window.addEventListener('beforeunload', () => {
//     showLoader();
// });

// הצגת הלודר רק בלחיצה על לינקים
document.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (target && !target.hasAttribute('target') && !target.hasAttribute('download')) {
        showLoader();
    }
});

window.addEventListener('load', () => {
    hideLoader();
});

window.addEventListener('popstate', () => {
    hideLoader();
}); 