// js/product-detail.js

// === استيراد الدوال المساعدة من utils.js ===
import { generateStars, fetchAllProducts, createProductCard, calculateDiscountPercentage } from './utils.js';
// === استيراد دوال السلة والمفضلة ===
import { addProductToCart, updateCartUI } from './cart.js'; // سنستدعي addProductToCart هنا
import { toggleWishlist, updateWishlistUI, isProductInWishlist } from './wishlist.js'; // سنستدعي toggleWishlist و isProductInWishlist هنا


document.addEventListener('DOMContentLoaded', function() {
    // التحقق من أننا في صفحة تحتاج لهذا الكود
    const productDetailPageElement = document.querySelector('.product-detail-page'); // استهداف أفضل
    if (!productDetailPageElement) { return; } // اخرج إذا لم تكن في هذه الصفحة

    // --- تعريف باقي العناصر ---
    const productDetailContainer = document.getElementById('product-detail-content'); // الحاوية الرئيسية لتفاصيل المنتج
    const breadcrumbsContainer = document.querySelector('.breadcrumbs ol'); // استهداف قائمة مسار التنقل في HTML
    const pageTitle = document.querySelector('title');
    const relatedProductsContainer = document.querySelector('#related-products-section .swiper-wrapper'); // استهداف حاوية شرائح Swiper

    // العناصر داخل قسم تفاصيل المنتج (سيتم ملؤها بـ JS لاحقاً)
    let mainProductImage;
    let thumbnails;
    let decreaseQtyBtn;
    let increaseQtyBtn;
    let quantityInput;
    let addToCartBtn;
    let addToWishlistBtn;
    let buyNowBtn;
    let tabsHeader;
    let tabPanels;


    // --- 1. احصل على ID المنتج من الـ URL بشكل صحيح ---
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    console.log("ProductDetailJS: Attempting to find product with ID from URL ->", productId);

    if (isNaN(productId)) {
        console.error("ProductDetailJS: Product ID from URL is not a valid number (NaN). URL might be missing '?id=X'.");
         if (productDetailContainer) productDetailContainer.innerHTML = "<p style='text-align: center; margin-top: 50px;'>عذرًا، معرف المنتج غير صالح أو مفقود.</p>";
         const relatedSection = document.getElementById('related-products-section');
         if (relatedSection) relatedSection.style.display = 'none';
        return;
    }

    // --- 2. تحميل جميع المنتجات وجلب بيانات المنتج المحدد ---
    async function loadProductData() {
        try {
            const allProducts = await fetchAllProducts();

             if (allProducts.length === 0) {
                  console.error("ProductDetailJS: No products loaded from JSON file.");
                   if (productDetailContainer) productDetailContainer.innerHTML = "<p style='text-align: center; margin-top: 50px;'>عذرًا، حدث خطأ أثناء تحميل بيانات المنتجات.</p>";
                   const relatedSection = document.getElementById('related-products-section');
                   if (relatedSection) relatedSection.style.display = 'none';
                  return;
             }

            console.log("ProductDetailJS: Successfully loaded and parsed all " + allProducts.length + " products from JSON file.");

            // ابحث عن المنتج باستخدام الـ ID الصحيح
            const product = allProducts.find(p => p.id === productId);

            console.log("ProductDetailJS: Searching for product with ID " + productId + ". Found:", product);

            if (product) {
                console.log("ProductDetailJS: Product found! Displaying details...");
                displayProductDetails(product);

                // بعد عرض المنتج، قم بتحميل وعرض المنتجات ذات الصلة
                const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);
                displayRelatedProducts(relatedProducts);

                 // تحديث واجهة المستخدم الخاصة بالسلة والمفضلة عند تحميل الصفحة (تم نقلها لـ main.js)
                 // updateCartUI(); // استدعاء في main.js
                 // updateWishlistUI(); // استدعاء في main.js - ستقوم بتحديث أيقونة القلب على زر المنتج الحالي

            } else {
                console.error("ProductDetailJS: Product with ID " + productId + " was NOT FOUND in the loaded data.");
                if (productDetailContainer) productDetailContainer.innerHTML = "<p style='text-align: center; margin-top: 50px;'>عذرًا، المنتج المطلوب غير موجود.</p>";
                 const relatedSection = document.getElementById('related-products-section');
                 if (relatedSection) relatedSection.style.display = 'none';
            }

        } catch (error) {
            console.error("ProductDetailJS: An error occurred in loadProductData function:", error);
            if (productDetailContainer) productDetailContainer.innerHTML = "<p style='text-align: center; margin-top: 50px;'>عذرًا، حدث خطأ أثناء تحميل بيانات المنتج.</p>";
             const relatedSection = document.getElementById('related-products-section');
             if (relatedSection) relatedSection.style.display = 'none';
        }
    }

    // --- 3. دالة لعرض تفاصيل المنتج في الصفحة ---
    function displayProductDetails(product) {
        pageTitle.textContent = `${product.name} - MOWAFFARCAR`;

        if (breadcrumbsContainer) {
            breadcrumbsContainer.innerHTML = `
                <li><a href="index.html">الرئيسية</a></li>
                 ${product.category ? `<li><a href="products.html?category=${encodeURIComponent(product.category)}">${product.category}</a></li>` : ''}
                <li aria-current="page">${product.name}</li>
            `;
        }

        const productHtml = `
            <div class="product-gallery">
                <div class="main-image-container">
                    <img src="${product.img}" alt="${product.name}" id="main-product-image">
                    <div class="image-zoom-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
                </div>
                <div class="thumbnail-gallery">
                    <div class="thumbnail active"><img src="${product.img}" alt="صورة مصغرة 1"></div>
                    ${product.img_hover ? `<div class="thumbnail"><img src="${product.img_hover}" alt="صورة مصغرة 2"></div>` : ''}
                    <!-- يمكنك إضافة المزيد من الصور المصغرة هنا إذا كان لديك صور إضافية في بيانات المنتج -->
                </div>
            </div>
            <div class="product-info">
                <span class="product-category-tag">${product.category || 'منتج'}</span>
                <h1 class="product-title h2-style">${product.name}</h1>
                <div class="product-rating-section">
                    <span class="rating-stars">${generateStars(product.rating)}</span>
                    <a href="#reviews" class="review-count">(${product.ratingCount || 0} تقييمات)</a>
                    <span class="separator">|</span>
                    <a href="#reviews" class="write-review-link">اكتب تقييمًا</a>
                </div>
                <div class="product-pricing">
                    <div class="price-container">
                         <span class="current-price h3-style">$${parseFloat(product.price).toFixed(2)}</span>
                         ${product.old_price ? `<span class="original-price">${parseFloat(product.old_price).toFixed(2)}$</span>` : ''}
                         ${product.old_price && parseFloat(product.price) < parseFloat(product.old_price) ? `<span class="discount-badge">-${calculateDiscountPercentage(parseFloat(product.price), parseFloat(product.old_price))}%</span>` : ''}
                    </div>
                     ${product.old_price && parseFloat(product.price) < parseFloat(product.old_price) ? `<p class="savings-info p5-style">وفر <span class="savings-text">$${(parseFloat(product.old_price) - parseFloat(product.price)).toFixed(2)}</span></p>` : ''}
                </div>
                 <p class="product-description-short p3-style">
                     ${product.description_short || 'هذا وصف قصير ومميز للمنتج. يمكن وضع المزيد من التفاصيل في تبويب الوصف أدناه.'}
                 </p>
                 <div class="product-features">
                     <div class="feature-item"><i class="fa-solid fa-check"></i> <span>مخزون متوفر</span></div>
                     <div class="feature-item"><i class="fa-solid fa-truck-fast"></i> <span>شحن سريع</span></div>
                     <div class="feature-item"><i class="fa-solid fa-shield-alt"></i> <span>ضمان جودة</span></div>
                 </div>


                <div class="quantity-selector">
                    <label for="quantity" class="p3-style">الكمية:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" id="decrease-qty" aria-label="إنقاص الكمية">-</button>
                        <input type="number" id="quantity" value="1" min="1" class="input-base">
                        <button class="quantity-btn" id="increase-qty" aria-label="زيادة الكمية">+</button>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-lg add-to-cart-btn" data-product-id="${product.id}"><i class="fas fa-shopping-cart"></i> أضف إلى السلة</button>
                    <button class="btn btn-outline-primary btn-lg add-to-wishlist-btn" data-product-id="${product.id}"><i class="far fa-heart"></i> إضافة للمفضلة</button>
                </div>

                 <div class="buy-now-section" style="margin-top: 20px;">
                     <button class="btn btn-secondary btn-lg buy-now-btn" data-product-id="${product.id}">شراء الآن</button>
                 </div>

            </div>
        `;

        productDetailContainer.innerHTML = productHtml;

        // تحديث عناصر DOM التي تم إنشاؤها ديناميكياً
        mainProductImage = document.getElementById('main-product-image');
        thumbnails = document.querySelectorAll('.thumbnail-gallery .thumbnail');
        decreaseQtyBtn = document.getElementById('decrease-qty');
        increaseQtyBtn = document.getElementById('increase-qty');
        quantityInput = document.getElementById('quantity');
        addToCartBtn = document.querySelector('.product-info .add-to-cart-btn');
        addToWishlistBtn = document.querySelector('.product-info .add-to-wishlist-btn');
        buyNowBtn = document.querySelector('.product-info .buy-now-btn');
        tabsHeader = document.querySelector('.product-tabs-section .tabs-header');
        tabPanels = document.querySelectorAll('.product-tabs-section .tab-panel');


        // إعداد معرض الصور، تحكم الكمية، تبويبات المعلومات، وأزرار الإجراءات
        setupGallery();
        setupQuantityControls();
        setupInfoTabs(product);
        setupActionButtons(product);

         // تحديث حالة زر المفضلة بعد عرضه
          if (typeof isProductInWishlist !== 'undefined') {
               if (addToWishlistBtn) {
                    const icon = addToWishlistBtn.querySelector('i');
                    if (isProductInWishlist(product.id)) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                         addToWishlistBtn.classList.add('in-wishlist');
                    } else {
                         icon.classList.remove('fa-solid');
                         icon.classList.add('fa-regular');
                         addToWishlistBtn.classList.remove('in-wishlist');
                    }
               }
          } else {
              console.warn("ProductDetailJS: isProductInWishlist function is not available to update initial UI for wishlist button.");
          }

    }

    // --- 4. عرض المنتجات ذات الصلة (داخل Swiper) ---
    function displayRelatedProducts(products) { /* ... كود الدالة كما هو ... */ }

     // --- 5. إعداد معرض الصور (Main image and thumbnails) ---
     function setupGallery() { /* ... كود الدالة كما هو ... */ }

     // --- 6. إعداد تحكم الكمية (+ / -) ---
     function setupQuantityControls() { /* ... كود الدالة كما هو ... */ }

     // --- 7. إعداد تبويبات معلومات المنتج (الوصف، المواصفات، المراجعات) ---
     function setupInfoTabs(product) {
         if (!tabsHeader || tabPanels.length === 0) return;

         const tabButtons = tabsHeader.querySelectorAll('.tab-btn');

         tabButtons.forEach(button => {
             button.addEventListener('click', function() {
                 const targetPanelId = this.dataset.target;

                 tabButtons.forEach(btn => btn.classList.remove('active'));
                 tabPanels.forEach(panel => panel.classList.remove('active'));

                 this.classList.add('active');
                 const targetPanel = document.getElementById(targetPanelId);
                 if (targetPanel) {
                     targetPanel.classList.add('active');
                      // قم بملء محتوى اللوحة بناءً على الـ ID وبيانات المنتج
                     fillTabContent(targetPanelId, product, targetPanel);
                 }
             });
         });

         // دالة لملء محتوى التبويبات
          function fillTabContent(panelId, productData, panelElement) {
              // مسح المحتوى القديم
              panelElement.innerHTML = '';

              if (panelId === 'description') {
                  panelElement.innerHTML = `
                       <h3>وصف المنتج</h3>
                       <p>${productData.full_description || productData.description_short || 'لا يوجد وصف إضافي لهذا المنتج.'}</p>
                       <!-- يمكنك إضافة المزيد من المحتوى هنا إذا لزم الأمر -->
                  `;
              } else if (panelId === 'specifications') {
                  let specsHtml = '<h3>المواصفات الفنية</h3>';
                  if (productData.specifications && Object.keys(productData.specifications).length > 0) {
                       specsHtml += '<table class="specs-table">';
                       for (const key in productData.specifications) {
                            specsHtml += `
                                <tr>
                                    <td>${key}</td>
                                    <td>${productData.specifications[key]}</td>
                                </tr>
                            `;
                       }
                       specsHtml += '</table>';
                  } else {
                       specsHtml += '<p>لا توجد مواصفات فنية لهذا المنتج.</p>';
                  }
                  panelElement.innerHTML = specsHtml;

              } else if (panelId === 'reviews') {
                   // هذا القسم يتطلب منطقاً أكثر تعقيداً (عرض التقييمات الموجودة، نموذج إضافة تقييم)
                   // يمكنك وضع placeholder أو رسالة مؤقتة هنا
                   panelElement.innerHTML = `
                        <h3>تقييمات العملاء (${productData.ratingCount || 0})</h3>
                       <p>قسم التقييمات قيد الإنشاء. يرجى العودة لاحقاً لمشاهدة التقييمات وإضافة تقييمك الخاص.</p>
                       <!-- هنا يمكن إضافة نموذج "اكتب تقييمًا" أيضاً -->
                   `;
                  // يمكنك تحديث عدد التقييمات في زر التبويب أيضاً هنا
                   const reviewTabButton = tabsHeader.querySelector('.tab-btn[data-target="reviews"]');
                    if(reviewTabButton) {
                         reviewTabButton.textContent = `التقييمات (${productData.ratingCount || 0})`;
                    }

              }
              // يمكنك إضافة منطق لتبويبات أخرى هنا
         }


         // تفعيل التبويب الأول افتراضياً عند تحميل الصفحة
         if (tabButtons.length > 0) {
             tabButtons[0].click();
         }
     }


     // --- 8. ربط أحداث أزرار السلة والمفضلة في صفحة التفاصيل ---
     function setupActionButtons(product) {
         // العناصر تم الحصول عليها في displayProductDetails
         if (!addToCartBtn || !addToWishlistBtn || !buyNowBtn) return; // تحقق من وجود الأزرار

         // ربط زر إضافة للسلة
          addToCartBtn.addEventListener('click', (e) => {
              e.preventDefault();
              const quantity = parseInt(quantityInput ? quantityInput.value : 1); // استخدام quantityInput المحصل عليه

              addProductToCart(product, quantity); // استدعاء مباشر للدالة المستوردة

               if (typeof showNotification !== 'undefined') { // تحقق من أن showNotification متاحة
                   showNotification(`تم إضافة "${product.name}" إلى السلة (${quantity} قطعة)`, 'success');
               }
          });

         // ربط زر إضافة للمفضلة وتبديل حالته الأولية
         if (typeof isProductInWishlist !== 'undefined') {
              const icon = addToWishlistBtn.querySelector('i');
             if (isProductInWishlist(product.id)) {
                 icon.classList.remove('fa-regular');
                 icon.classList.add('fa-solid');
                  addToWishlistBtn.classList.add('in-wishlist');
             } else {
                  icon.classList.remove('fa-solid');
                  icon.classList.add('fa-regular');
                  addToWishlistBtn.classList.remove('in-wishlist');
             }
         } else {
             console.warn("ProductDetailJS: isProductInWishlist function is not available to update initial UI for wishlist button.");
         }

          addToWishlistBtn.addEventListener('click', (e) => {
              e.preventDefault();
              toggleWishlist(product); // استدعاء مباشر للدالة المستوردة
              // toggleWishlist تحدث الـ UI تلقائياً (شكل الأيقونة)
               if (typeof showNotification !== 'undefined') {
                   if (isProductInWishlist(product.id)) { // تحقق بعد التبديل
                       showNotification(`تم إضافة "${product.name}" إلى المفضلة`, 'success');
                   } else {
                       showNotification(`تم إزالة "${product.name}" من المفضلة`, 'info');
                   }
               }
          });


         // ربط زر الشراء الآن
          buyNowBtn.addEventListener('click', (e) => {
              e.preventDefault();
               const quantity = parseInt(quantityInput ? quantityInput.value : 1);

               addProductToCart(product, quantity); // أضف المنتج للسلّة بكمية
               // ثم انتقل لصفحة السلة (أو الدفع)
               window.location.href = 'cart.html';
          });

     }


    // --- 9. بدء تشغيل كل شيء ---
    loadProductData();
});