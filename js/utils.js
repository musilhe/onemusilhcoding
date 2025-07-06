// js/utils.js

/**
 * ينشئ عنصر HTML (div) يمثل بطاقة منتج.
 * @param {object} product - كائن المنتج مع بياناته (id, img, name, price, old_price, category, rating, ratingCount).
 * @returns {HTMLElement} - عنصر div لبطاقة المنتج.
 */
export function createProductCard(product) {
    if (!product) return null; // التأكد من وجود بيانات المنتج

    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);

    let discountBadgeHTML = '';
    if (product.old_price && parseFloat(product.price) < parseFloat(product.old_price)) {
        const discountPercentage = calculateDiscountPercentage(parseFloat(product.price), parseFloat(product.old_price));
        discountBadgeHTML = `<span class="discount-badge">-${discountPercentage}%</span>`;
    }

    const oldPriceHTML = product.old_price ?
        `<span class="original-price">$${parseFloat(product.old_price).toFixed(2)}</span>` : '';

    const ratingStarsHTML = product.rating ? generateStars(parseFloat(product.rating)) : '';
    const ratingCountHTML = product.ratingCount ?
        `<span class="rating-count p5-style">(${product.ratingCount})</span>` : '';

    card.innerHTML = `
        <div class="product-image-wrapper">
            <a href="product-detail.html?id=${product.id}">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </a>
            ${discountBadgeHTML}
            <div class="product-actions-overlay">
                <button class="btn-icon add-to-wishlist-btn" aria-label="إضافة لقائمة الرغبات" data-product-id="${product.id}">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <button class="btn-icon quick-view-btn" aria-label="عرض سريع" data-product-id="${product.id}">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="product-content">
            <span class="product-category p5-style">${product.category || 'منتجات متنوعة'}</span>
            <h3 class="product-title h5-style">
                <a href="product-detail.html?id=${product.id}">${product.name}</a>
            </h3>
            ${ratingStarsHTML ? `<div class="product-rating">${ratingStarsHTML} ${ratingCountHTML}</div>` : ''}
            <div class="product-price">
                <span class="current-price">$${parseFloat(product.price).toFixed(2)}</span>
                ${oldPriceHTML}
            </div>
            <button class="btn btn-primary btn-md add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
        </div>
    `;

    // هنا نضيف مستمعي الأحداث لأزرار السلة والمفضلة مباشرة على البطاقة
    // هذا يسهل ربطها بمنطق cart.js و wishlist.js لاحقاً
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
         addToCartBtn.addEventListener('click', (e) => {
             e.preventDefault(); // منع الانتقال لصفحة cart.html
             const productId = parseInt(addToCartBtn.dataset.productId);
             // هنا يجب استدعاء دالة addProductToCart من cart.js
             // لكننا سنقوم بذلك بعد إنشاء ملف cart.js وربطه
             // console.log(`Add product ${productId} to cart clicked`);
             // استدعاء وظيفة إضافة للسلة (ستتم إضافتها لاحقاً)
             // addProductToCart(productId); // مثال
         });
    }

     const addToWishlistBtn = card.querySelector('.add-to-wishlist-btn');
     if (addToWishlistBtn) {
          addToWishlistBtn.addEventListener('click', (e) => {
             e.preventDefault();
             const productId = parseInt(addToWishlistBtn.dataset.productId);
              // هنا يجب استدعاء دالة toggleWishlist من wishlist.js
             // console.log(`Toggle wishlist for product ${productId} clicked`);
             // استدعاء وظيفة تبديل المفضلة (ستتم إضافتها لاحقاً)
             // toggleProductInWishlist(productId); // مثال
         });
     }


    return card;
}

/**
 * ينشئ HTML لنجوم التقييم (Font Awesome icons).
 * @param {number} rating - قيمة التقييم (من 0 إلى 5).
 * @returns {string} - سلسلة HTML لأيقونات النجوم.
 */
export function generateStars(rating) {
    if (typeof rating !== 'number' || isNaN(rating)) return '';
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    // إضافة النجوم الكاملة
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa-solid fa-star"></i>';
    }
    // إضافة نصف نجمة إذا كانت موجودة
    if (hasHalfStar) {
        stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    // إضافة النجوم الفارغة المتبقية لإكمال الـ 5 نجوم
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

/**
 * يحسب نسبة الخصم بين السعر الحالي والسعر الأصلي.
 * @param {number} currentPrice - السعر الحالي للمنتج.
 * @param {number} oldPrice - السعر الأصلي للمنتج.
 * @returns {number} - نسبة الخصم كعدد صحيح.
 */
export function calculateDiscountPercentage(currentPrice, oldPrice) {
    if (typeof currentPrice !== 'number' || typeof oldPrice !== 'number' || oldPrice <= 0 || currentPrice >= oldPrice) {
        return 0;
    }
    return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
}

/**
 * يحصل على جميع المنتجات من ملف JSON.
 * يستخدم Promise لإرجاع البيانات بشكل غير متزامن.
 * @returns {Promise<Array<object>>} - وعد (Promise) يحمل مصفوفة المنتجات.
 */
export async function fetchAllProducts() {
    try {
        // تأكد أن المسار هنا صحيح بالنسبة لملفات HTML التي تستدعي هذا السكربت
        const response = await fetch('js/corrected_products.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const products = await response.json();
        console.log("Utils: Products fetched successfully.", products);
        return products;
    } catch (error) {
        console.error("Utils: Error fetching products:", error);
        return []; // إرجاع مصفوفة فارغة في حالة الخطأ
    }
}


// يمكنك إضافة دوال مساعدة أخرى هنا لاحقاً