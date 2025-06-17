// ملف js/products.js (النسخة المدمجة والمحسنة)

document.addEventListener('DOMContentLoaded', function() {
    // تعريف المتغيرات داخل النطاق المحلي
    let allProductsData = []; // لتخزين جميع المنتجات الأصلية من JSON
    let currentFilteredProducts = []; // لتخزين المنتجات بعد تطبيق الفلاتر والفرز

    const productsContainer = document.getElementById('shop-products-container');
    const resultsCountElement = document.querySelector('.results-count');
    // (لاحقًا) عناصر التحكم في الفلاتر والفرز والترقيم
    const categoryLinks = document.querySelectorAll('.filter-list a'); // افترض أن الفئات هي روابط
    const brandLinks = document.querySelectorAll('.brand-filter-links a'); // افترض أن العلامات هي روابط
    const sortSelect = document.getElementById('sort-by');
    const applyFiltersBtn = document.querySelector('.apply-filters-btn');
    const priceMinInput = document.getElementById('price-min'); // لفلتر السعر بالـ range
    const priceMaxInput = document.getElementById('price-max');
    const priceMinValueOutput = document.getElementById('price-min-value');
    const priceMaxValueOutput = document.getElementById('price-max-value');

    // 1. تحميل المنتجات
    async function loadProducts() {
        try {
            // تأكد من أن المسار صحيح بالنسبة لموقع products.html
            const response = await fetch('items.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProductsData = await response.json();
            currentFilteredProducts = [...allProductsData]; // في البداية، اعرض كل المنتجات
            renderProducts(currentFilteredProducts);
            updateResultsDisplay(currentFilteredProducts.length, allProductsData.length);
        } catch (error) {
            console.error("Could not load products:", error);
            if (productsContainer) {
                productsContainer.innerHTML = "<p>عذرًا، حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.</p>";
            }
        }
    }

    // 2. دالة لإنشاء بطاقة منتج HTML
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        let discountBadgeHTML = '';
        if (product.old_price && product.price < product.old_price) {
            const discountPercentage = Math.round(((product.old_price - product.price) / product.old_price) * 100);
            discountBadgeHTML = `<span class="discount-badge">-${discountPercentage}%</span>`;
        } else if (product.discount) {
            discountBadgeHTML = `<span class="discount-badge">${product.discount}</span>`;
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
                    ${product.img_hover ? `<img src="${product.img_hover}" class="product-img-hover" alt="${product.name}" loading="lazy">` : ''}
                </a>
                ${discountBadgeHTML}
                <div class="product-actions-overlay">
                    <button class="btn-icon" aria-label="إضافة لقائمة الرغبات" data-product-id="${product.id}"><i class="fa-regular fa-heart"></i></button>
                    <button class="btn-icon" aria-label="عرض سريع" data-product-id="${product.id}"><i class="fa-solid fa-eye"></i></button>
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
                <a href="#" class="btn btn-primary btn-md add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</a>
            </div>
        `;
        return card;
    }

    // 3. دالة لإنشاء نجوم التقييم
    function generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0; 
        for (let i = 0; i < fullStars; i++) { stars += '<i class="fa-solid fa-star"></i>'; }
        if (hasHalfStar) { stars += '<i class="fa-solid fa-star-half-stroke"></i>'; }
        for (let i = 0; i < (5 - Math.ceil(rating)); i++) { stars += '<i class="fa-regular fa-star"></i>'; }
        return stars;
    }

    // 4. دالة لعرض المنتجات
    function renderProducts(productsToRender) {
        if (!productsContainer) return;
        productsContainer.innerHTML = ''; 

        if (productsToRender.length === 0) {
            productsContainer.innerHTML = '<p class="no-products-found" style="text-align:center; padding: 20px; grid-column: 1 / -1;">لم يتم العثور على منتجات تطابق بحثك.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productElement = createProductCard(product);
            productsContainer.appendChild(productElement);
        });
    }

    // 5. دالة لتحديث عدد النتائج
    function updateResultsDisplay(displayedCount, totalCountInput) {
        if (resultsCountElement) {
            const totalToShow = totalCountInput !== undefined ? totalCountInput : allProductsData.length;
            // هذا بسيط، يمكنك جعله أكثر تفصيلاً ليعكس الترقيم لاحقًا
            resultsCountElement.textContent = `عرض ${displayedCount} من ${totalToShow} منتج`;
        }
    }
    
    // 6. إعداد الفلاتر والفرز (باستخدام منطق مشابه للكود "ب")
    function setupEventListeners() {
        // فلتر الفئات
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const selectedCategory = this.getAttribute('href').split('=')[1];
                applyFilters({ category: selectedCategory });
                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // فلتر العلامات التجارية
        brandLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // إذا كان الرابط لصفحة أخرى (مثل brand-toyota.html)، دعه ينتقل
                if (this.getAttribute('href').includes('.html') && !this.getAttribute('href').startsWith('?')) return; 
                
                e.preventDefault();
                // استخراج اسم العلامة من النص أو من data-attribute إذا أضفته
                const brandName = this.textContent.trim().split(' ')[0]; // بسيط، قد يحتاج لتحسين
                applyFilters({ brand: brandName });
                brandLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // فلتر السعر (عند تغيير قيم range inputs)
        if (priceMinInput && priceMaxInput) {
            [priceMinInput, priceMaxInput].forEach(input => {
                input.addEventListener('input', function() {
                    if (priceMinValueOutput) priceMinValueOutput.textContent = priceMinInput.value;
                    if (priceMaxValueOutput) priceMaxValueOutput.textContent = priceMaxInput.value;
                    // يمكنك تأجيل تطبيق الفلتر حتى يضغط المستخدم على زر "تطبيق"
                });
            });
        }

        // زر تطبيق الفلاتر (يشمل السعر)
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function() {
                let priceFilter = {};
                if (priceMinInput && priceMaxInput) {
                    priceFilter.minPrice = parseInt(priceMinInput.value);
                    priceFilter.maxPrice = parseInt(priceMaxInput.value);
                }
                applyFilters(priceFilter);
            });
        }

        // خيارات الفرز
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                applyFilters({ sortBy: this.value });
            });
        }
    }

    // 7. دالة تطبيق الفلاتر المجمعة والفرز
    function applyFilters(newFilters = {}) {
        // دمج الفلاتر الجديدة مع الفلاتر الحالية (ستحتاج لتخزين الفلاتر الحالية)
        // هذا جزء مبسط، منطق الفلاتر المتعددة قد يكون أكثر تعقيدًا

        let tempProducts = [...allProductsData];

        // مثال لفلتر الفئة (يجب توسيعه ليشمل كل الفلاتر النشطة)
        if (newFilters.category && newFilters.category !== 'all') {
            tempProducts = tempProducts.filter(p => p.category && p.category.toLowerCase().includes(newFilters.category.toLowerCase()));
        }
        // مثال لفلتر العلامة التجارية
        if (newFilters.brand && newFilters.brand !== 'جميع') { // افترض أن "جميع" هي قيمة لعدم الفلترة
            tempProducts = tempProducts.filter(p => p.brand && p.brand.toLowerCase().includes(newFilters.brand.toLowerCase()));
        }
        // مثال لفلتر السعر
        if (newFilters.minPrice !== undefined && newFilters.maxPrice !== undefined) {
            tempProducts = tempProducts.filter(p => p.price >= newFilters.minPrice && p.price <= newFilters.maxPrice);
        }

        // الفرز
        const sortBy = newFilters.sortBy || (sortSelect ? sortSelect.value : 'default');
        switch (sortBy) {
            case 'price-asc': tempProducts.sort((a, b) => a.price - b.price); break;
            case 'price-desc': tempProducts.sort((a, b) => b.price - a.price); break;
            case 'rating': tempProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            case 'latest': tempProducts.sort((a, b) => b.id - a.id); break; // افترض أن id الأكبر هو الأحدث
            // case 'default': // لا حاجة للفرز إذا كان الافتراضي هو الترتيب الأصلي
        }
        
        currentFilteredProducts = tempProducts;
        renderProducts(currentFilteredProducts);
        updateResultsDisplay(currentFilteredProducts.length, allProductsData.length);
    }


    // استدعاء الدوال الأولية
    loadProducts().then(() => {
        setupEventListeners(); // إعداد مستمعي الأحداث بعد تحميل المنتجات
    });

});