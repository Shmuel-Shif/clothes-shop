// קבלת ה-ID של המוצר מה-URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

let selectedSize = null;
let currentQuantity = 1;
let productPrice = 0;

// טעינת המוצר
function loadProduct() {
    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }

    productPrice = product.price;
    updateTotalPrice();
    // עדכון כותרת הדף
    document.title = `${product.name} - הקולב שבבית`;

    // עדכון פרטי המוצר
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.product-price').textContent = `${product.price} ₪`;
    document.querySelector('.product-description').innerHTML = `
        <p>${product.description}</p>
    `;

    // יצירת הגלריה
    initGallery(product);

    // יצירת כפתורי מידות
    const sizeButtons = document.querySelector('.size-buttons');
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.className = 'size-btn';
        btn.textContent = size;
        btn.onclick = () => selectSize(size);
        if (product.selectedSize === size) {
            btn.classList.add('selected');
        }
        sizeButtons.appendChild(btn);
    });

    // הוספת כפתור טבלת מידות
    const sizeSelection = document.querySelector('.size-selection');
    const sizeGuideBtn = document.createElement('button');
    sizeGuideBtn.className = 'size-guide-btn';
    sizeGuideBtn.textContent = 'טבלת מידות';
    sizeGuideBtn.onclick = openSizeModal;
    sizeSelection.appendChild(sizeGuideBtn);

    // הוספת אירוע לכפתור הוספה לעגלה
    document.querySelector('.add-to-cart-btn').onclick = () => addToCart();
}

function selectSize(size) {
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === size) {
            btn.classList.add('selected');
        }
    });
    selectedSize = size;
}

function showErrorModal() {
    const modal = document.getElementById('error-modal');
    modal.style.display = 'block';

    // סגירה אוטומטית אחרי 2 שניות
    setTimeout(() => {
        modal.style.display = 'none';
    }, 2000);
}

function updateQuantity(change) {
    const input = document.querySelector('.quantity-input');
    let newValue = parseInt(input.value) + change;
    if (newValue >= 1 && newValue <= 10) {  // הגבלה ל-10
        input.value = newValue;
        currentQuantity = newValue;
        updateTotalPrice();
    }
}

function updateQuantityInput(value) {
    value = parseInt(value);
    if (value >= 1 && value <= 10) {  // הגבלה ל-10
        currentQuantity = value;
        updateTotalPrice();
    } else if (value > 10) {  // אם הוזן מספר גדול מ-10
        document.querySelector('.quantity-input').value = 10;
        currentQuantity = 10;
        updateTotalPrice();
    } else {  // אם הוזן מספר קטן מ-1
        document.querySelector('.quantity-input').value = 1;
        currentQuantity = 1;
        updateTotalPrice();
    }
}

function updateTotalPrice() {
    // עיגול ל-2 ספרות אחרי הנקודה
    const total = (productPrice * currentQuantity).toFixed(2);
    document.querySelector('.total-amount').textContent = `₪${total}`;
}

function addToCart() {
    const selectedSize = document.querySelector('.size-btn.selected');
    if (!selectedSize) {
        showErrorModal();
        return;
    }

    const product = products.find(p => p.id === productId);
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize.textContent,
        image: product.images[0],
        quantity: currentQuantity,
        totalPrice: (product.price * currentQuantity).toFixed(2)
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.unshift(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
}

// עדכון מספר הפריטים בעגלה
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.length;
    document.getElementById('cart-count').textContent = count;
}

function openSizeModal() {
    const modal = document.getElementById('size-modal');
    modal.style.display = 'block';
}

function closeSizeModal() {
    const modal = document.getElementById('size-modal');
    modal.style.display = 'none';
}

// סגירת ההגדלה בלחיצה על Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const galleryImage = document.querySelector('.gallery-image');
        galleryImage.classList.remove('zoomed');
    }
});

function initGallery(product) {
    const images = product.images;
    let currentImageIndex = 0;
    const mainImage = document.getElementById('main-image');
    const dotsContainer = document.querySelector('.gallery-dots');

    // טעינה מקדימה של התמונות
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // יצירת נקודות ניווט
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => showImage(index);
        dotsContainer.appendChild(dot);
    });

    function showImage(index) {
        // יצירת תמונה חדשה ברקע
        const nextImage = new Image();
        nextImage.src = images[index];
        nextImage.onload = () => {
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.src = images[index];
                mainImage.style.opacity = '1';
            }, 150); // הקטנת זמן המעבר
        };

        // עדכון נקודות
        document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentImageIndex = index;
    }

    // הצגת תמונה ראשונה
    mainImage.src = images[0];
    mainImage.style.opacity = '1';

    // כפתורי ניווט
    document.querySelector('.prev-arrow').onclick = () => {
        const newIndex = (currentImageIndex - 1 + images.length) % images.length;
        showImage(newIndex);
    };

    document.querySelector('.next-arrow').onclick = () => {
        const newIndex = (currentImageIndex + 1) % images.length;
        showImage(newIndex);
    };
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

// הצגת הלודר בטעינת העמוד
window.addEventListener('load', () => {
    hideLoader();
});

// קריאה לפונקציה כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
    
    // הוספת מאזיני אירועים למודל
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSizeModal);
    }
    
    // סגירת המודל בלחיצה מחוץ לתוכן
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('size-modal');
        if (e.target === modal) {
            closeSizeModal();
        }
    });

    // עדכון מספר הפריטים בטעינת העמוד
    updateCartCount();

    // סגירת מודל השגיאה
    const errorModal = document.getElementById('error-modal');
    const closeErrorBtn = errorModal.querySelector('.close-modal');
    
    closeErrorBtn.onclick = () => {
        errorModal.style.display = 'none';
    };

    window.onclick = (e) => {
        if (e.target === errorModal) {
            errorModal.style.display = 'none';
        }
    };
}); 