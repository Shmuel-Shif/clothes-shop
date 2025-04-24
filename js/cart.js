let currentEditingItem = null;
let currentEditingQuantityItem = null;

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
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    
    // הסרת הפריט מהעגלה
    cart.splice(index, 1);
    
    // עדכון אינדקסים של פריטים נבחרים
    selectedItems = selectedItems
        .filter(i => i !== index)  // הסרת האינדקס שנמחק
        .map(i => i > index ? i - 1 : i);  // עדכון אינדקסים שאחרי המחיקה
    
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    
    renderCart();
    updateCartCount();
}

// הצגת פריטי העגלה
function renderCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    const container = document.getElementById('cart-items');
    
    if (cartItems.length === 0) {
        container.innerHTML = '<div class="empty-cart">העגלה שלך ריקה</div>';
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('select-all').disabled = true;
    } else {
        container.innerHTML = cartItems.map((item, index) => {
            return `
                <div class="cart-item">
                    <label class="checkbox-container item-checkbox">
                        <input type="checkbox" class="item-select" data-price="${item.totalPrice}" onchange="updateTotal(); saveSelectionState(${index}, this.checked)" ${selectedItems.includes(index) ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-size" onclick="showSizeModal(${index})">
                            מידה: ${item.size} <i class="fas fa-pen"></i>
                        </div>
                        <div class="cart-item-quantity" onclick="showQuantityModal(${index})">
                            כמות: ${item.quantity} <i class="fas fa-pen"></i>
                        </div>
                        <div class="cart-item-price">₪${item.totalPrice}</div>
                    </div>
                    <button class="remove-item" onclick="removeItem(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    updateTotal();
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {  // בדיקה אם האלמנט קיים
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCountElement.textContent = cart.length;
    }
}

// פונקציות לטיפול במודל המידות
function showSizeModal(index) {
    currentEditingItem = index;
    const modal = document.getElementById('size-change-modal');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentSize = cart[index].size;

    const sizeButtons = modal.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === currentSize) {
            btn.classList.add('selected');
        }
        
        // שינוי המידה מיד בלחיצה
        btn.onclick = () => {
            // הסרת הסימון מכל הכפתורים
            sizeButtons.forEach(b => b.classList.remove('selected'));
            // הוספת סימון לכפתור הנוכחי
            btn.classList.add('selected');
            
            // שמירת השינוי
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart[currentEditingItem].size = btn.dataset.size;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            
            // סגירת המודל אחרי רבע שנייה
            setTimeout(() => {
                closeModal();
            }, 250);
        };
    });

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('size-change-modal');
    modal.style.display = 'none';
    currentEditingItem = null;
}

function showQuantityModal(index) {
    currentEditingQuantityItem = index;
    const modal = document.getElementById('quantity-change-modal');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentQuantity = cart[index].quantity;
    
    const input = modal.querySelector('.quantity-input');
    input.value = currentQuantity;
    
    const minusBtn = modal.querySelector('.minus');
    const plusBtn = modal.querySelector('.plus');
    const closeBtn = modal.querySelector('.close-modal');
    
    minusBtn.onclick = () => updateModalQuantity(-1);
    plusBtn.onclick = () => updateModalQuantity(1);
    closeBtn.onclick = () => closeQuantityModal();
    
    input.onchange = () => updateModalQuantityInput(input.value);
    input.onkeyup = () => updateModalQuantityInput(input.value);
    
    modal.style.display = 'block';
}

function updateModalQuantity(change) {
    const input = document.querySelector('#quantity-change-modal .quantity-input');
    let newValue = parseInt(input.value) + change;
    if (newValue >= 1 && newValue <= 10) {  // הגבלה ל-10
        input.value = newValue;
        saveModalQuantity(newValue);
    }
}

function updateModalQuantityInput(value) {
    value = parseInt(value);
    if (value >= 1 && value <= 10) {  // הגבלה ל-10
        saveModalQuantity(value);
    } else if (value > 10) {  // אם הוזן מספר גדול מ-10
        document.querySelector('#quantity-change-modal .quantity-input').value = 10;
        saveModalQuantity(10);
    } else {  // אם הוזן מספר קטן מ-1
        document.querySelector('#quantity-change-modal .quantity-input').value = 1;
        saveModalQuantity(1);
    }
}

function saveModalQuantity(quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[currentEditingQuantityItem].quantity = quantity;
    // עיגול ל-2 ספרות אחרי הנקודה
    cart[currentEditingQuantityItem].totalPrice = (cart[currentEditingQuantityItem].price * quantity).toFixed(2);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function closeQuantityModal() {
    const modal = document.getElementById('quantity-change-modal');
    modal.style.display = 'none';
    currentEditingQuantityItem = null;
}

function toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.item-select');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (selectAll.checked) {
        // שמירת כל האינדקסים
        const allIndexes = Array.from(Array(cart.length).keys());
        localStorage.setItem('selectedItems', JSON.stringify(allIndexes));
    } else {
        // ניקוי כל הבחירות
        localStorage.setItem('selectedItems', JSON.stringify([]));
    }
    
    renderCart();
}

function updateTotal() {
    const selectedItems = document.querySelectorAll('.item-select:checked');
    const total = Array.from(selectedItems).reduce((sum, checkbox) => {
        return sum + parseFloat(checkbox.dataset.price);
    }, 0);
    
    // עיגול ל-2 ספרות אחרי הנקודה
    document.getElementById('cart-total').textContent = `₪${total.toFixed(2)}`;
    
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = selectedItems.length === 0;
}

// שמירת מצב הבחירה
function saveSelectionState(index, isChecked) {
    let selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    
    if (isChecked) {
        if (!selectedItems.includes(index)) {
            selectedItems.push(index);
        }
    } else {
        selectedItems = selectedItems.filter(i => i !== index);
    }
    
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
}

function showLoader() {
    document.querySelector('.loader-container').classList.add('show');
}

function hideLoader() {
    document.querySelector('.loader-container').classList.remove('show');
}

// הוספת לודר במעבר בין עמודים
window.addEventListener('beforeunload', () => {
    showLoader();
});

window.addEventListener('load', () => {
    hideLoader();
});

// הצגת הלודר בלחיצה על לינקים
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && !e.target.hasAttribute('target')) {
        showLoader();
    }
});

// אתחול העמוד
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount();
    
    // סגירת המודלים בלחיצה מחוץ לתוכן
    window.onclick = (e) => {
        const sizeModal = document.getElementById('size-change-modal');
        const quantityModal = document.getElementById('quantity-change-modal');
        
        if (e.target === sizeModal) {
            closeModal();
        }
        if (e.target === quantityModal) {
            closeQuantityModal();
        }
    };

    // בדיקה אם כל הפריטים נבחרו
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('item-select')) {
            const allCheckboxes = document.querySelectorAll('.item-select');
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            document.getElementById('select-all').checked = allChecked;
        }
    });
}); 