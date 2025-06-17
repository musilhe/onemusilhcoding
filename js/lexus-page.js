// ==========================================================================
// js/lexus-page.js - الأكواد الخاصة بصفحة لكزس
// ==========================================================================

let lexusProducts = [];
let filteredLexusProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    // تحميل المنتجات
    loadLexusProducts();
    
    // إعداد الفلاتر
    setupLexusFilters();
    
    // إعداد بطاقات الموديلات
    setupModelCards();
});

// تحميل منتجات لكزس
async function loadLexusProducts() {
    try {
        const response = await fetch('items.json');
        const allProducts = await response.json();
        
        // فلترة منتجات لكزس فقط
        lexusProducts = allProducts.filter(product => 
            product.brand && product.brand.toLowerCase().includes('lexus') ||
            product.name.toLowerCase().includes('لكزس') ||
            product.name.toLowerCase().includes('lexus') ||
            product.name.toLowerCase().includes('لاند') ||
            product.name.toLowerCase().includes('land')
        );
        
        // إذا لم توجد منتجات لكزس، استخدم بعض المنتجات كأمثلة
        if (lexusProducts.length === 0) {
            lexusProducts = createSampleLexusProducts();
        }
        
        filteredLexusProducts = [...lexusProducts];
        displayLexusProducts(filteredLexusProducts);
        
    } catch (error) {
        console.error('خطأ في تحميل منتجات لكزس:', error);
        // إنشاء منتجات تجريبية في حالة الخطأ
        lexusProducts = createSampleLexusProducts();
        filteredLexusProducts = [...lexusProducts];
        displayLexusProducts(filteredLexusProducts);
    }
}

// إنشاء منتجات لكزس تجريبية
function createSampleLexusProducts() {
    return [
        {
            id: 101,
            img: "images/products/lexus-land-1.jpg",
            img_hover: "images/products/lexus-land-1-hover.jpg",
            name: "ترهيم لاند كروزر لكزس 2020-2023",
            price: 450,
            old_price: 520,
            category: "تراهيم خارجية",
            brand: "Lexus",
            model: "Land Cruiser",
            rating: 4.8,
            ratingCount: 85
        },
        {
            id: 102,
            img: "images/products/lexus-lx-1.jpg",
            img_hover: "images/products/lexus-lx-1-hover.jpg",
            name: "مصابيح LED أمامية لكزس LX 570",
            price: 680,
            category: "إضاءة",
            brand: "Lexus",
            model: "LX",
            rating: 4.9,
            ratingCount: 42
        },
        {
            id: 103,
            img: "images/products/lexus-gx-1.jpg",
            img_hover: "images/products/lexus-gx-1-hover.jpg",
            name: "جنوط لكزس GX 460 أصلية",
            price: 1200,
            old_price: 1400,
            category: "جنوط وإطارات",
            brand: "Lexus",
            model: "GX",
            rating: 4.7,
            ratingCount: 28
        },
        {
            id: 104,
            img: "images/products/lexus-es-1.jpg",
            img_hover: "images/products/lexus-es-1-hover.jpg",
            name: "مقاعد جلدية لكزس ES 350",
            price: 890,
            category: "اكسسوارات داخلية",
            brand: "Lexus",
            model: "ES",
            rating: 4.6,
            ratingCount: 67
        },
        {
            id: 105,
            img: "images/products/lexus-land-2.jpg",
            img_hover: "images/products/lexus-land-2-hover.jpg",
            name: "شبك أمامي لاند كروزر لكزس",
            price: 320,
            category: "اكسسوارات خارجية",
            brand: "Lexus",
            model: "Land Cruiser",
            rating: 4.5,
            ratingCount: 93
        },
        {
            id: 106,
            img: "images/products/lexus-lx-2.jpg",
            img_hover: "images/products/lexus-lx-2-hover.jpg",
            name: "نظام ملاحة لكزس LX أصلي",
            price: 1500,
            category: "إلكترونيات",
            brand: "Lexus",
            model: "LX",
            rating: 4.8,
            ratingCount: 35
        }
    ];
}

// عرض منتجات لكزس
function displayLexusProducts(products) {
    const container = document.getElementById('lexus-products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">لا توجد منتجات لكزس متاحة حالياً</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = createLexusProductCard(product);
        container.appendChild(productCard);
    });
}

// إنشاء بطاقة منتج لكزس
function createLexusProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card lexus-product-card';
    
    const discountBadge = product.old_price ? 
        `<span class="discount-badge">${calculateDiscount(product.price, product.old_price)}</span>` : '';
    
    const oldPriceHTML = product.old_price ? 
        `<span class="original-price">$${product.old_price}</span>` : '';
    
    const rating = product.rating || 4.5;
    const ratingCount = product.ratingCount || 0;
    const category = product.category || 'منتجات لكزس';
    
    card.innerHTML = `
        <div class="product-image-wrapper">
            <a href="product-detail.html?id=${product.id}">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </a>
            ${discountBadge}
            <div class="product-actions-overlay">
                <button class="btn-icon" aria-label="إضافة لقائمة الرغبات">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <button class="btn-icon" aria-label="عرض سريع">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="product-content">
            <span class="product-category p5-style">${category}</span>
            <h3 class="product-title h5-style">
                <a href="product-detail.html?id=${product.id}">${product.name}</a>
            </h3>
            <div class="product-rating">
                ${generateStars(rating)}
                <span class="rating-count p5-style">(${ratingCount})</span>
            </div>
            <div class="product-price">
                <span class="current-price">$${product.price}</span>
                ${oldPriceHTML}
            </div>
            <a href="cart.html?add-to-cart=${product.id}" class="btn btn-primary btn-md add-to-cart-btn">
                أضف إلى السلة
            </a>
        </div>
    `;
    
    return card;
}

// إعداد فلاتر لكزس
function setupLexusFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // إزالة الحالة النشطة من جميع التبويبات
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // إضافة الحالة النشطة للتبويب المحدد
            this.classList.add('active');
            
            // تطبيق الفلتر
            const filter = this.getAttribute('data-filter');
            filterLexusProducts(filter);
        });
    });
}

// فلترة منتجات لكزس
function filterLexusProducts(filter) {
    if (filter === 'all') {
        filteredLexusProducts = [...lexusProducts];
    } else {
        filteredLexusProducts = lexusProducts.filter(product => {
            const model = product.model ? product.model.toLowerCase() : '';
            const name = product.name.toLowerCase();
            
            switch (filter) {
                case 'land-cruiser':
                    return model.includes('land') || model.includes('cruiser') || 
                           name.includes('لاند') || name.includes('كروزر');
                case 'lx':
                    return model.includes('lx') || name.includes('lx');
                case 'gx':
                    return model.includes('gx') || name.includes('gx');
                case 'es':
                    return model.includes('es') || name.includes('es');
                default:
                    return true;
            }
        });
    }
    
    displayLexusProducts(filteredLexusProducts);
}

// إعداد بطاقات الموديلات
function setupModelCards() {
    const modelCards = document.querySelectorAll('.model-card');
    
    modelCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            const model = this.getAttribute('data-model');
            
            // التمرير إلى قسم المنتجات
            const productsSection = document.querySelector('.lexus-products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // تطبيق فلتر الموديل
            setTimeout(() => {
                const filterTab = document.querySelector(`[data-filter="${model}"]`);
                if (filterTab) {
                    filterTab.click();
                }
            }, 500);
        });
    });
}

// حساب نسبة الخصم
function calculateDiscount(currentPrice, oldPrice) {
    const discount = ((oldPrice - currentPrice) / oldPrice * 100).toFixed(0);
    return `-${discount}%`;
}

// إنشاء النجوم للتقييم
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa-solid fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa-regular fa-star"></i>';
    }
    
    return stars;
}

