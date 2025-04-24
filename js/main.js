// נתוני המוצרים - בהמשך אפשר להעביר למסד נתונים
const products = [
    {
        id: 1,
        name: "חליפת ערב אלגנטית",
        price: 99.99,
        images: [
            "images/products/shirt-1.jpg",
            "images/products/shirt-2.jpg",
            "images/products/shirt-3.jpg"
        ]
    },
    {
        id: 2,
        name: "מכנסי ג'ינס אופנתיים",
        price: 199.99,
        images: [
            "images/products/jeans-1.jpg",
            "images/products/jeans-2.jpg",
            "images/products/jeans-3.jpg"
        ]
    },
    {
        id: 3,
        name: "נעלי ספורט מעוצבות",
        price: 299.99,
        images: [
            "images/products/shoes-1.jpg",
            "images/products/shoes-2.jpg",
            "images/products/shoes-3.jpg"
        ]
    },
    {
        id: 4,
        name: "חולצת כותנה קלאסית",
        price: 899.99,
        images: [
            "images/products/suit-1.jpg",
            "images/products/suit-2.jpg",
            "images/products/suit-3.jpg"
        ]
    },
    {
        id: 5,
        name: "עניבות באיכות גבוהה",
        price: 329.99,
        images: [
            "images/products/tie-1.jpg",
            "images/products/tie-2.jpg",
            "images/products/tie-3.jpg"
        ]
    }
];

// יצירת כרטיסי המוצרים
function createProductCards() {
    const container = document.getElementById('products-container');
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        
        // יצירת קרוסלת תמונות
        const splideContainer = document.createElement('div');
        splideContainer.className = 'splide';
        splideContainer.innerHTML = `
            <div class="splide__track">
                <ul class="splide__list">
                    ${product.images.map(img => `
                        <li class="splide__slide">
                            <img src="${img}" alt="${product.name}">
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        const info = document.createElement('div');
        info.className = 'product-info';
        info.innerHTML = `
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <div class="selected-size">מידה: <span>${product.selectedSize || 'לא נבחרה מידה'}</span></div>
            <button class="select-size-btn" onclick="openSizeModal(${product.id})">${product.selectedSize ? 'שינוי מידה' : 'בחרי מידה'}</button>
            <button class="add-to-cart" onclick="addToCart(${product.id})">הוסיפי לעגלה</button>
        `;

        card.appendChild(splideContainer);
        card.appendChild(info);
        container.appendChild(card);

        // אתחול Splide לכל מוצר
        new Splide(splideContainer, {
            type: 'loop',
            perPage: 1,
            arrows: true,
            pagination: true,
            height: '200px',
            direction: 'rtl',
            classes: {
                arrows: 'splide__arrows custom-arrows',
                arrow: 'splide__arrow custom-arrow',
                prev: 'splide__arrow--prev custom-prev',
                next: 'splide__arrow--next custom-next',
            }
        }).mount();
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
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
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
}); 