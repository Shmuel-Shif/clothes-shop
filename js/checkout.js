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

function showLoader() {
    document.querySelector('.loader-container').classList.add('show');
}

function hideLoader() {
    document.querySelector('.loader-container').classList.remove('show');
}

// עדכון הקוד הקיים בטיפול בשליחת הטופס
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showLoader(); // הצגת הלודר בלחיצה על ביצוע הזמנה

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
        hideLoader(); // הסתרת הלודר במקרה של שגיאה
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
    
    // עדכון פונקציית validateForm
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
        });
        
        // עדכון מצב כפתור ביצוע הזמנה
        submitBtn.disabled = !isValid;
        
        // עדכון מצב כפתור הביט
        const bitBtn = document.querySelector('.payment-app-logo');
        if (bitBtn) {
            if (!isValid) {
                bitBtn.style.opacity = '0.5';
                bitBtn.style.cursor = 'not-allowed';
                bitBtn.onclick = (e) => e.preventDefault();
            } else {
                bitBtn.style.opacity = '1';
                bitBtn.style.cursor = 'pointer';
                bitBtn.onclick = openBitPayment;
            }
        }
    }
    
    // האזנה לשינויים בשדות החובה
    form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('input', validateForm);
    });
    
    // עדכון ה-HTML של כפתור הביט
    document.querySelector('.payment-app-logo').style.opacity = '0.5';
    document.querySelector('.payment-app-logo').style.cursor = 'not-allowed';
    
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
    // פותח את ביט
    window.open("bit://");
    
    // אחרי שנייה פותח את הווצאפ עם ההודעה
    setTimeout(() => {
        const orderDetails = generateOrderMessage();
        const whatsappLink = `https://wa.me/972552830174?text=${encodeURIComponent(orderDetails)}`;
        window.open(whatsappLink);
    }, 1000);
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

