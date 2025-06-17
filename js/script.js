// Global variables
let allProducts = [];
let filteredProducts = [];
let currentSort = 'default';

// DOM elements
const productsGrid = document.getElementById('products-grid');
const loadingElement = document.getElementById('loading');
const noResultsElement = document.getElementById('no-results');
const resultsCount = document.getElementById('results-count');

// Filter elements
const brandFilter = document.getElementById('brand-filter');
const modelFilter = document.getElementById('model-filter');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const sortSelect = document.getElementById('sort-select');

// Modal elements
const modal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

// Other elements
const backToTopBtn = document.getElementById('back-to-top');
const header = document.querySelector('.header');
const contactForm = document.getElementById('contact-form');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    initializeEventListeners();
    initializeScrollEffects();
});

// Load products from JSON file
async function loadProducts() {
    try {
        showLoading(true);
        const response = await fetch('items.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        displayProducts();
        updateResultsCount();
        showLoading(false);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.');
        showLoading(false);
    }
}

// Display products in the grid
function displayProducts() {
    if (filteredProducts.length === 0) {
        showNoResults(true);
        return;
    }
    
    showNoResults(false);
    productsGrid.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    const discountBadge = product.discount ? 
        `<div class="product-discount">${product.discount}</div>` : '';
    
    const oldPrice = product.old_price ? 
        `<span class="old-price">${product.old_price}$</span>` : '';
    
    const rating = product.rating ? createRatingStars(product.rating) : '';
    const ratingCount = product.ratingCount ? 
        `<span class="rating-count">(${product.ratingCount})</span>` : '';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.img}" alt="${product.name}" loading="lazy">
            ${discountBadge}
            <div class="product-actions">
                <button class="action-btn wishlist-btn" data-product-id="${product.id}" aria-label="إضافة للمفضلة">
                    <i class="far fa-heart"></i>
                </button>
                <button class="action-btn quick-view-btn" data-product-id="${product.id}" aria-label="عرض سريع">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="product-content">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">
                <a href="#" data-product-id="${product.id}">${product.name}</a>
            </h3>
            ${rating ? `
            <div class="product-rating">
                <div class="stars">${rating}</div>
                ${ratingCount}
            </div>` : ''}
            <div class="product-price">
                <span class="current-price">${product.price}$</span>
                ${oldPrice}
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> إضافة للسلة
            </button>
        </div>
    `;
    
    return card;
}

// Create rating stars
function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt star"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star star empty"></i>';
    }
    
    return starsHTML;
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter event listeners
    brandFilter.addEventListener('change', applyFilters);
    modelFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    sortSelect.addEventListener('change', applySorting);
    
    // Product interaction event listeners
    productsGrid.addEventListener('click', handleProductInteraction);
    
    // Modal event listeners
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Back to top button
    backToTopBtn.addEventListener('click', scrollToTop);
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Reset search button
    const resetSearchBtn = document.getElementById('reset-search');
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', clearAllFilters);
    }
}

// Handle product interactions (clicks on product elements)
function handleProductInteraction(e) {
    const productId = e.target.closest('[data-product-id]')?.getAttribute('data-product-id');
    if (!productId) return;
    
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    if (e.target.closest('.quick-view-btn') || e.target.closest('.product-title a')) {
        e.preventDefault();
        showProductModal(product);
    } else if (e.target.closest('.add-to-cart')) {
        addToCart(product);
    } else if (e.target.closest('.wishlist-btn')) {
        toggleWishlist(product);
    }
}

// Apply filters
function applyFilters() {
    const brand = brandFilter.value;
    const model = modelFilter.value;
    const category = categoryFilter.value;
    const priceRange = priceFilter.value;
    
    filteredProducts = allProducts.filter(product => {
        // Brand filter
        if (brand && product.brand !== brand) return false;
        
        // Model filter
        if (model && product.model !== model) return false;
        
        // Category filter
        if (category && product.category !== category) return false;
        
        // Price filter
        if (priceRange) {
            const price = product.price;
            switch (priceRange) {
                case '0-200':
                    if (price >= 200) return false;
                    break;
                case '200-500':
                    if (price < 200 || price >= 500) return false;
                    break;
                case '500-1000':
                    if (price < 500 || price >= 1000) return false;
                    break;
                case '1000+':
                    if (price < 1000) return false;
                    break;
            }
        }
        
        return true;
    });
    
    applySorting();
    displayProducts();
    updateResultsCount();
}

// Apply sorting
function applySorting() {
    const sortValue = sortSelect.value;
    currentSort = sortValue;
    
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            break;
        default:
            // Default sorting (by ID)
            filteredProducts.sort((a, b) => a.id - b.id);
    }
    
    if (currentSort !== 'default') {
        displayProducts();
    }
}

// Clear all filters
function clearAllFilters() {
    brandFilter.value = '';
    modelFilter.value = '';
    categoryFilter.value = '';
    priceFilter.value = '';
    sortSelect.value = 'default';
    
    filteredProducts = [...allProducts];
    currentSort = 'default';
    displayProducts();
    updateResultsCount();
}

// Update results count
function updateResultsCount() {
    const count = filteredProducts.length;
    const total = allProducts.length;
    
    if (count === total) {
        resultsCount.textContent = `عرض جميع المنتجات (${total})`;
    } else {
        resultsCount.textContent = `عرض ${count} من ${total} منتج`;
    }
}

// Show/hide loading
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
    productsGrid.style.display = show ? 'none' : 'grid';
}

// Show/hide no results
function showNoResults(show) {
    noResultsElement.style.display = show ? 'block' : 'none';
    productsGrid.style.display = show ? 'none' : 'grid';
}

// Show error message
function showError(message) {
    productsGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${message}</p>
        </div>
    `;
}

// Show product modal
function showProductModal(product) {
    const rating = product.rating ? createRatingStars(product.rating) : '';
    const ratingCount = product.ratingCount ? `(${product.ratingCount} تقييم)` : '';
    const oldPrice = product.old_price ? 
        `<span class="old-price">${product.old_price}$</span>` : '';
    const discount = product.discount ? 
        `<span class="discount-badge">${product.discount}</span>` : '';
    
    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-product-image">
                <img src="${product.img}" alt="${product.name}">
                ${discount}
            </div>
            <div class="modal-product-info">
                <div class="product-category">${product.category}</div>
                <h2>${product.name}</h2>
                <div class="product-brand-model">
                    <span><strong>العلامة التجارية:</strong> ${product.brand}</span>
                    <span><strong>الموديل:</strong> ${product.model}</span>
                </div>
                ${rating ? `
                <div class="product-rating">
                    <div class="stars">${rating}</div>
                    <span class="rating-count">${ratingCount}</span>
                </div>` : ''}
                <div class="product-price">
                    <span class="current-price">${product.price}$</span>
                    ${oldPrice}
                </div>
                <div class="product-description">
                    <p>${product.description}</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> إضافة للسلة
                    </button>
                    <button class="btn btn-outline wishlist-btn" data-product-id="${product.id}">
                        <i class="far fa-heart"></i> إضافة للمفضلة
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal-specific styles
    const modalStyles = `
        <style>
            .modal-product {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                align-items: start;
            }
            .modal-product-image {
                position: relative;
            }
            .modal-product-image img {
                width: 100%;
                border-radius: 8px;
            }
            .modal-product-info .product-category {
                color: #7f8c8d;
                font-size: 0.9rem;
                text-transform: uppercase;
                margin-bottom: 0.5rem;
            }
            .modal-product-info h2 {
                color: #2c3e50;
                margin-bottom: 1rem;
            }
            .product-brand-model {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 1rem;
                font-size: 0.9rem;
            }
            .modal-product-info .product-rating {
                margin-bottom: 1rem;
            }
            .modal-product-info .product-price {
                margin-bottom: 1.5rem;
            }
            .product-description {
                margin-bottom: 2rem;
                line-height: 1.6;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .modal-actions .btn {
                flex: 1;
                min-width: 150px;
            }
            @media (max-width: 768px) {
                .modal-product {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                .modal-actions {
                    flex-direction: column;
                }
                .modal-actions .btn {
                    width: 100%;
                }
            }
        </style>
    `;
    
    modalBody.insertAdjacentHTML('beforeend', modalStyles);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Add to cart functionality
function addToCart(product) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification('تم إضافة المنتج للسلة بنجاح', 'success');
}

// Toggle wishlist
function toggleWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const existingIndex = wishlist.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('تم إزالة المنتج من المفضلة', 'info');
    } else {
        wishlist.push(product);
        showNotification('تم إضافة المنتج للمفضلة', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Update wishlist UI
function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    
    wishlistButtons.forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        const isInWishlist = wishlist.some(item => item.id == productId);
        const icon = btn.querySelector('i');
        
        if (isInWishlist) {
            icon.className = 'fas fa-heart';
            btn.style.color = '#e74c3c';
        } else {
            icon.className = 'far fa-heart';
            btn.style.color = '';
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        
        // Header background effect
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Back to top button
        if (scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Handle contact form
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };
    
    // Simulate form submission
    showNotification('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً', 'success');
    e.target.reset();
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistUI();
});

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);
document.addEventListener('DOMContentLoaded', function () {

    // 1. وظيفة Preloader (إذا كنت تستخدمها)
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        // يمكنك استخدام window.onload إذا كنت تريد الانتظار لتحميل كل شيء بما في ذلك الصور الكبيرة
        // أو يمكنك إخفاؤه بعد تأخير بسيط أو عندما يكون DOM جاهزًا كبداية
        setTimeout(function() {
            preloader.classList.add('hidden');
            // بعد انتهاء الانتقال، يمكنك إضافة: preloader.style.display = 'none';
            // إذا كان الانتقال في CSS الخاص بـ .preloader.hidden
        }, 500); // مثال لتأخير 0.5 ثانية
    }

    // 2. وظيفة لتثبيت الرأسية وتعديل حشو المحتوى
    function stickyHeader() {
        const headerWrapper = document.querySelector('.sticky-header-wrapper');
        if (!headerWrapper) return;

        const nextElement = headerWrapper.nextElementSibling;
        if (!nextElement) return;
        
        const headerHeight = headerWrapper.offsetHeight;
        nextElement.style.marginTop = headerHeight + 'px';
    }
    stickyHeader(); // استدعاء أولي
    window.addEventListener('load', stickyHeader); // إعادة الحساب بعد تحميل كل الصور
    window.addEventListener('resize', stickyHeader);

    // 3. وظيفة قائمة التنقل المتجاوبة (الهمبرغر)
    const browseCategoriesBtn = document.querySelector('.browse-categories-btn');
    const navLinksMenu = document.getElementById('main-nav-links'); 
    if (browseCategoriesBtn && navLinksMenu) {
        browseCategoriesBtn.addEventListener('click', function() {
            navLinksMenu.classList.toggle('is-active');
            const isExpanded = navLinksMenu.classList.contains('is-active');
            browseCategoriesBtn.setAttribute('aria-expanded', isExpanded);
            const icon = browseCategoriesBtn.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        document.addEventListener('click', function(event) {
            const isClickInsideNav = browseCategoriesBtn.contains(event.target) || navLinksMenu.contains(event.target);
            if (!isClickInsideNav && navLinksMenu.classList.contains('is-active')) {
                navLinksMenu.classList.remove('is-active');
                browseCategoriesBtn.setAttribute('aria-expanded', 'false');
                const icon = browseCategoriesBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 4. تفعيلات Swiper Carousels (مشروطة بوجود العنصر)
    if (typeof Swiper !== 'undefined') { // تأكد أن مكتبة Swiper قد تم تحميلها
        if (document.querySelector(".best-sellers-carousel")) {
            var bestSellersSwiper = new Swiper(".best-sellers-carousel", {
                slidesPerView: 1, spaceBetween: 15, loop: true, grabCursor: true,
                navigation: { nextEl: ".best-sellers-carousel .swiper-button-next", prevEl: ".best-sellers-carousel .swiper-button-prev", },
                pagination: { el: ".best-sellers-carousel .swiper-pagination", clickable: true, },
                breakpoints: { 576: { slidesPerView: 2, spaceBetween: 20 }, 768: { slidesPerView: 3, spaceBetween: 25 }, 992: { slidesPerView: 4, spaceBetween: 30 } }
            });
        }

        if (document.querySelector(".brand-logos-carousel")) {
            var brandLogosSwiper = new Swiper(".brand-logos-carousel", {
                slidesPerView: 2, spaceBetween: 20, loop: true,
                autoplay: { delay: 2500, disableOnInteraction: false, },
                grabCursor: true,
                navigation: { nextEl: ".brand-logos-carousel .swiper-button-next", prevEl: ".brand-logos-carousel .swiper-button-prev", },
                breakpoints: { 576: { slidesPerView: 3, spaceBetween: 25 }, 768: { slidesPerView: 4, spaceBetween: 30 }, 992: { slidesPerView: 5, spaceBetween: 40 }, 1200: { slidesPerView: 6, spaceBetween: 50 } }
            });
        }
           
        if (document.querySelector(".testimonials-carousel")) {
            var testimonialsSwiper = new Swiper(".testimonials-carousel", {
                slidesPerView: 1, spaceBetween: 30, loop: true, grabCursor: true,
                autoplay: { delay: 5000, disableOnInteraction: false, },
                pagination: { el: ".testimonials-carousel .swiper-pagination", clickable: true, },
                navigation: { nextEl: ".testimonials-carousel .testimonials-button-next", prevEl: ".testimonials-carousel .testimonials-button-prev", },
                breakpoints: { 768: { slidesPerView: 2, spaceBetween: 25 }, 992: { slidesPerView: 3, spaceBetween: 30 } }
            });
        }

        if (document.querySelector(".blog-carousel")) {
            var blogSwiper = new Swiper(".blog-carousel", {
                slidesPerView: 1, spaceBetween: 30, loop: true, grabCursor: true,
                pagination: { el: ".blog-carousel .blog-pagination", clickable: true, },
                navigation: { nextEl: ".blog-carousel .blog-button-next", prevEl: ".blog-carousel .blog-button-prev", },
                breakpoints: { 768: { slidesPerView: 2, spaceBetween: 25 }, 992: { slidesPerView: 3, spaceBetween: 30 } }
            });
        }
    } else {
        console.warn("Swiper library is not loaded.");
    }

    // 5. تحديث سنة حقوق النشر في التذييل
    const footerCurrentYearSpan = document.getElementById('footer-current-year');
    if (footerCurrentYearSpan) {
        footerCurrentYearSpan.textContent = new Date().getFullYear();
    }

    // 6. وظيفة زر "العودة إلى الأعلى"
    const backToTopBtn = document.getElementById("backToTopButton");
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        });
        backToTopBtn.addEventListener("click", function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 7. وظيفة الرسالة الترحيبية
    const welcomeNotification = document.getElementById('welcomeNotification');
    const closeWelcomeBtn = document.getElementById('closeWelcomeNotification');
    if (welcomeNotification && closeWelcomeBtn) {
        // يمكنك إضافة منطق للتحقق مما إذا كان المستخدم قد أغلقها سابقًا باستخدام localStorage
        // if (!localStorage.getItem('welcomeDismissed')) {
            setTimeout(() => {
                welcomeNotification.classList.add('show');
            }, 2000); // تأخير ظهورها قليلاً
        // }
        closeWelcomeBtn.addEventListener('click', function() {
            welcomeNotification.classList.remove('show');
            // localStorage.setItem('welcomeDismissed', 'true'); // لحفظ حالة الإغلاق
        });
    }

    // 8. وظيفة مؤقت العد التنازلي لقسم العروض الساخنة
    const countdownElements = document.querySelectorAll('.deal-countdown');
    countdownElements.forEach(element => {
        const endTimeAttr = element.dataset.countdownEnd;
        if (!endTimeAttr) return;

        const endTime = new Date(endTimeAttr).getTime();
        const daysSpan = element.querySelector('.days');
        const hoursSpan = element.querySelector('.hours');
        const minutesSpan = element.querySelector('.minutes');
        const secondsSpan = element.querySelector('.seconds');

        if (!daysSpan || !hoursSpan || !minutesSpan || !secondsSpan) return;

        const interval = setInterval(function() {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(interval);
                // يمكنك تغيير محتوى element بالكامل أو فقط أجزاء المؤقت
                element.innerHTML = "<p style='color: var(--primary-color); font-weight: bold;'>انتهى العرض!</p>";
                return;
            }

            daysSpan.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            hoursSpan.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            minutesSpan.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            secondsSpan.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    });

}); // نهاية DOMContentLoaded
