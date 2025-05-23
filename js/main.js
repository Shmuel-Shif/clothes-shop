// יצירת כרטיסי המוצרים
function createProductCards() {
    const container = document.getElementById('products-container');
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.category = product.category;
        
        const cardLink = document.createElement('a');
        cardLink.href = `product.html?id=${product.id}`;
        cardLink.className = 'product-link';
        
        cardLink.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">${product.price} ₪</p>
            </div>
        `;
        
        card.appendChild(cardLink);
        container.appendChild(card);
    });
}

// הוספת פונקציות חדשות למידות
function openSizeModal(productId) {
    const modal = document.getElementById('size-modal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    modal.style.display = 'block';
    modal.dataset.productId = productId;
    
    // יצירת כפתורי המידות
    const sizeButtons = modal.querySelector('.size-buttons');
    if (!sizeButtons) {
        console.error('Size buttons container not found');
        return;
    }

    sizeButtons.innerHTML = '';
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.className = 'size-btn';
        btn.dataset.size = size;
        btn.textContent = size;
        btn.onclick = () => selectSize(size, productId);
        sizeButtons.appendChild(btn);
        
        // סימון המידה הנבחרת אם קיימת
        const product = products.find(p => p.id === productId);
        if (product && product.selectedSize === size) {
            btn.classList.add('selected');
        }
    });
}

function selectSize(size, productId) {
    // מציאת הכרטיסיה הנכונה
    const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!productCard) {
        console.error('Product card not found:', productId);
        return;
    }

    const sizeDisplay = productCard.querySelector('.selected-size span');
    if (!sizeDisplay) {
        console.error('Size display element not found');
        return;
    }

    const selectSizeBtn = productCard.querySelector('.select-size-btn');
    if (!selectSizeBtn) {
        console.error('Size button not found');
        return;
    }

    // עדכון תצוגת המידה הנבחרת
    sizeDisplay.textContent = size;
    selectSizeBtn.textContent = 'שינוי מידה';
    
    // עדכון הכפתור הנבחר במודל
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === size) {
            btn.classList.add('selected');
        }
    });
    
    // שמירת המידה במוצר
    const product = products.find(p => p.id === productId);
    if (product) {
        product.selectedSize = size;
    }
    
    closeSizeModal();
}

function closeSizeModal() {
    const modal = document.getElementById('size-modal');
    modal.style.display = 'none';
}

// עדכון פונקציית addToCart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (!product.selectedSize) {
        alert('נא לבחור מידה לפני הוספה לעגלה');
        openSizeModal(productId);
        return;
    }
    
    // הוספת המוצר לעגלה עם המידה הנבחרת
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItem = {
        id: productId,
        size: product.selectedSize,
        quantity: 1
    };
    
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // אנימציית העגלה
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.getElementById('cart-count');
    cartIcon.classList.add('cart-bounce');
    cartCount.classList.add('count-update');
    
    setTimeout(() => {
        cartIcon.classList.remove('cart-bounce');
        cartCount.classList.remove('count-update');
    }, 500);
}

// עדכון מספר הפריטים בעגלה
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.length;
    document.getElementById('cart-count').textContent = count;
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', () => {
    createProductCards();
    updateCartCount();
    
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

    const searchInput = document.getElementById('search-input');
    const searchIcon = document.querySelector('.search-icon');
    const clearIcon = document.querySelector('.clear-search');
    let isFiltered = false;
    
    // חיפוש בלחיצה על Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filterProducts(searchTerm);
            isFiltered = true;
            clearIcon.style.display = 'block';
        }
    });
    
    // חיפוש בלחיצה על האייקון
    searchIcon.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filterProducts(searchTerm);
        isFiltered = true;
        clearIcon.style.display = 'block';
    });
    
    // איפוס החיפוש
    clearIcon.addEventListener('click', () => {
        searchInput.value = '';
        isFiltered = false;
        clearIcon.style.display = 'none';
        // הצגת כל המוצרים
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.style.display = 'block';
        });
    });

    const categoriesBtn = document.querySelector('.categories-btn');
    const categoriesModal = document.querySelector('.categories-modal');
    const closeCategories = document.querySelector('.close-categories');
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);

    // פתיחת המודל
    categoriesBtn.addEventListener('click', () => {
        categoriesModal.classList.add('show');
        modalOverlay.classList.add('show');
    });

    // סגירת המודל
    function closeModal() {
        categoriesModal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }

    closeCategories.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // טיפול בלחיצה על קטגוריה
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterProducts(category);
            closeModal();
            
            // עדכון כפתור הניקוי
            const clearIcon = document.querySelector('.clear-search');
            clearIcon.style.display = 'block';
            isFiltered = true;
        });
    });
});

function filterProducts(searchTerm) {
    const searchIcon = document.querySelector('.search-icon');
    const searchLoader = document.querySelector('.search-loader');

    searchIcon.style.display = 'none';
    searchLoader.style.display = 'block';

    setTimeout(() => {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const productCategory = card.dataset.category; // נוסיף את זה למוצרים
            
            if (productName.includes(searchTerm.toLowerCase()) || 
                (productCategory && productCategory === searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        searchIcon.style.display = 'block';
        searchLoader.style.display = 'none';
    }, 1000);
} 