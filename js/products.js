// js/products.js - منطق صفحات عرض المنتجات

// === استيراد الدوال المساعدة من utils.js ===
import { createProductCard, generateStars, calculateDiscountPercentage, fetchAllProducts } from './utils.js';
// === استيراد دوال السلة والمفضلة ===
import { addProductToCart, updateCartUI } from './cart.js'; // سنستدعي addProductToCart هنا
import { toggleWishlist, updateWishlistUI, isProductInWishlist } from './wishlist.js'; // سنستدعي toggleWishlist هنا


// انتظر حتى يتم تحميل كامل الـ DOM قبل تشغيل أي كود
document.addEventListener('DOMContentLoaded', function() {

    // === عناصر DOM التي سيتم التفاعل معها ===
    const productsContainer = document.getElementById('shop-products-container');
    if (!productsContainer) { return; }

    // باقي عناصر DOM (تأكد من وجود IDs الصحيحة في HTML)
    const resultsCountElement = document.querySelector('.results-count');
    const categoryFilterLinks = document.querySelectorAll('.filter-list.category-filter-list a'); // استهداف أفضل
    const brandFilterLinks = document.querySelectorAll('.filter-list.brand-filter-list a'); // استهداف أفضل
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const priceMinValueOutput = document.getElementById('price-min-value');
    const priceMaxValueOutput = document.getElementById('price-max-value');
    const applyFiltersBtn = document.querySelector('.apply-filters-btn');
    const sortSelect = document.getElementById('sort-by');
    const paginationContainer = document.querySelector('.pagination-area .pagination');
    const pageTitleElement = document.getElementById('page-main-title');
    const searchForm = document.getElementById('product-page-search-form'); // نموذج البحث في الرأسية - منطق إرساله يعالج تلقائياً من HTML


    // === متغيرات الحالة ===
    let allProductsData = []; // سيحتوي على جميع المنتجات من JSON
    let currentFilteredProducts = []; // المنتجات بعد تطبيق جميع الفلاتر (URL + Sidebar)
    let currentPage = 1;
    const productsPerPage = 12;
    

    // === الدالة الرئيسية لبدء التشغيل ===
    async function init() {
        // استخدم دالة fetchAllProducts الموحدة لجلب المنتجات
        allProductsData = await fetchAllProducts();

        if (allProductsData.length === 0) {
             if (productsContainer) productsContainer.innerHTML = `<p class="no-products-found" style="grid-column: 1 / -1; text-align: center;">عذرًا، حدث خطأ أثناء تحميل المنتجات أو لا توجد منتجات.</p>`;
             return;
        }

        console.log("ProductsJS: Products loaded successfully.", allProductsData.length, "items.");

        function setupEventListeners() {
        // مستمع حدث للفرز
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortBy = e.target.value;
                sortProducts(sortBy);
                renderProducts(currentFilteredProducts);
            });
        }
        // ... (مستمعات أحداث أخرى للفلاتر الجانبية)
    }

        // تطبيق الفلاتر الأولية من URL (بحث، فئة، علامة تجارية، إلخ)
        applyFiltersFromURL();

        // تحديث واجهة المستخدم الخاصة بالسلة والمفضلة عند تحميل الصفحة (تم نقلها لـ main.js)
        // updateCartUI(); // استدعاء في main.js
        // updateWishlistUI(); // استدعاء في main.js - ستقوم بتحديث أيقونات القلب على البطاقات المعروضة

         // تحديث عدد المنتجات في فلاتر الشريط الجانبي بعد تحميل البيانات
         updateSidebarCounts();
    }

     // === دالة لتحديث أعداد المنتجات بجوار الفلاتر في الشريط الجانبي ===
    function updateSidebarCounts() {
        // هذا يتطلب المرور على المنتجات الكاملة allProductsData وحساب الأعداد لكل فئة/علامة تجارية
        const categoryCounts = {};
        const brandCounts = {};

        allProductsData.forEach(product => {
            // حساب عدد الفئات
            if (product.category) {
                const category = product.category.toLowerCase();
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
            // حساب عدد العلامات التجارية
             if (product.brand) {
                 const brand = product.brand.toLowerCase();
                 brandCounts[brand] = (brandCounts[brand] || 0) + 1;
             }
        });

        // تحديث عناصر الـ count في فلاتر الفئات
        const allProductsCount = allProductsData.length;
        categoryFilterLinks.forEach(link => {
             const category = new URLSearchParams(new URL(link.href).search).get('category');
             const countSpan = link.querySelector('.count');
             if(countSpan) {
                 if (category === 'all') {
                     countSpan.textContent = `(${allProductsCount})`;
                 } else if (categoryCounts[category]) {
                     countSpan.textContent = `(${categoryCounts[category]})`;
                 } else {
                     countSpan.textContent = `(0)`; // لا توجد منتجات لهذه الفئة
                 }
             }
         });

         // تحديث عناصر الـ count في فلاتر العلامات التجارية
         brandFilterLinks.forEach(link => {
             // استخراج اسم العلامة التجارية من الرابط (قد تحتاج تعديل بناءً على هيكل روابطك)
             const brand = new URLSearchParams(new URL(link.href).search).get('brand');
              const countSpan = link.querySelector('.count');
              if(countSpan && brand) {
                  const brandLower = brand.toLowerCase();
                  if (brandCounts[brandLower]) {
                      countSpan.textContent = `(${brandCounts[brandLower]})`;
                  } else {
                       countSpan.textContent = `(0)`; // لا توجد منتجات لهذه العلامة التجارية
                  }
              }
         });
         // يمكنك إضافة منطق لتحديث عدد "جميع المنتجات" في فلاتر العلامات التجارية هنا أيضاً
    }
        products.forEach(product => {
            const card = createProductCard(product); // استخدام الدالة من utils.js
            productsContainer.appendChild(card);
        });
        // تحديث واجهة المفضلة بعد عرض المنتجات
        if (typeof updateWishlistUI !== 'undefined') {
            updateWishlistUI();
        }
    },

      function renderProducts(products) {
        productsContainer.innerHTML = '';
        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products-found">لا توجد منتجات تطابق بحثك.</p>';
            return;
        }


    // === دالة لفلترة المنتجات بناءً على عنوان URL ===
    function applyFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);

        // استخراج الفلاتر من URL
        const urlBrand = params.get('brand');
        const urlModel = params.get('model');
        const urlCategory = params.get('category');
        const urlSearchQuery = params.get('query');
        const urlSpecialFilter = params.get('filter');
        const urlMinPrice = params.get('price-min'); // إضافة
        const urlMaxPrice = params.get('price-max'); // إضافة
        const urlSortBy = params.get('sort-by'); // إضافة (للفرز من URL إذا كان ممكناً)


        let tempProducts = [...allProductsData];
        let pageTitle = "جميع المنتجات"; // عنوان افتراضي

        // تطبيق الفلاتر المستخرجة من URL
        if (urlBrand) {
             tempProducts = tempProducts.filter(p => p.brand && p.brand.toLowerCase().includes(urlBrand.toLowerCase()));
             pageTitle = `منتجات ${urlBrand}`;
        }
        if (urlModel) {
             tempProducts = tempProducts.filter(p => p.model && p.model.toLowerCase().includes(urlModel.toLowerCase()));
             pageTitle += ` - ${urlModel}`;
        }
        if (urlCategory && urlCategory !== 'all') {
             tempProducts = tempProducts.filter(p => p.category && p.category.toLowerCase() === urlCategory.toLowerCase());
             pageTitle = `فئة: ${urlCategory}`;
        }
        if (urlSearchQuery) {
             tempProducts = tempProducts.filter(p =>
                 (p.name && p.name.toLowerCase().includes(urlSearchQuery.toLowerCase())) ||
                 (p.description && p.description.toLowerCase().includes(urlSearchQuery.toLowerCase()))
             );
             pageTitle = `نتائج البحث عن: "${urlSearchQuery}"`;
        }
        if (urlSpecialFilter === 'hotdeals') {
             tempProducts = tempProducts.filter(p => p.old_price && parseFloat(p.old_price) > parseFloat(p.price));
             // يمكنك إضافة منطق أكثر تعقيداً للعروض الساخنة إذا لزم الأمر
             pageTitle = "العروض الحصرية";
        }
         // تطبيق فلاتر السعر من URL
         if (urlMinPrice !== null) {
             const min = parseFloat(urlMinPrice);
             if (!isNaN(min)) {
                 tempProducts = tempProducts.filter(p => parseFloat(p.price) >= min);
             }
         }
         if (urlMaxPrice !== null) {
              const max = parseFloat(urlMaxPrice);
             if (!isNaN(max)) {
                 tempProducts = tempProducts.filter(p => parseFloat(p.price) <= max);
             }
         }


        currentFilteredProducts = tempProducts;

         // تحديث الشريط الجانبي ليعكس فلاتر URL
         updateSidebarFiltersUI(params);

         // تطبيق الفرز من URL إذا كان موجوداً
         if (urlSortBy && sortSelect) {
             sortSelect.value = urlSortBy;
             // لن نستدعي sortAndRenderProducts هنا مباشرة، بل سيتم استدعاؤها في نهاية الدالة
         }


        currentPage = 1;
        sortAndRenderProducts(); // الفرز والعرض بعد تطبيق فلاتر URL
    }

    // === دالة لتحديث واجهة مستخدم الفلاتر الجانبية بناءً على URL ===
    function updateSidebarFiltersUI(params) {
         const urlCategory = params.get('category') || 'all';
         const urlBrand = params.get('brand');
         const urlMinPrice = params.get('price-min');
         const urlMaxPrice = params.get('price-max');


         // تحديث فلاتر الفئات
         categoryFilterLinks.forEach(link => {
             const linkCategory = new URLSearchParams(new URL(link.href).search).get('category') || 'all';
             if (linkCategory === urlCategory) {
                 link.classList.add('active');
             } else {
                 link.classList.remove('active');
             }
         });

         // تحديث فلاتر العلامات التجارية (أضف فئة active)
         brandFilterLinks.forEach(link => {
              const linkBrand = new URLSearchParams(new URL(link.href).search).get('brand');
              if (linkBrand && urlBrand && linkBrand.toLowerCase() === urlBrand.toLowerCase()) {
                   link.classList.add('active');
              } else {
                   link.classList.remove('active');
              }
         });


         // تحديث فلاتر السعر
         if (priceMinInput && priceMaxInput && priceMinValueOutput && priceMaxValueOutput) {
             // استخدم القيم من URL إذا كانت موجودة، وإلا استخدم القيم الافتراضية لمدخلات النطاق في HTML
             priceMinInput.value = urlMinPrice || priceMinInput.min;
             priceMaxInput.value = urlMaxPrice || priceMaxInput.max;
             // تأكد من تحديث قيم العرض أيضاً
             priceMinValueOutput.textContent = priceMinInput.value;
             priceMaxValueOutput.textContent = priceMaxInput.value;
         }

    }


    // === دالة لفلترة المنتجات بناءً على قيم الفلاتر الجانبية ===
     function applySidebarFilters() {
         // ابدأ بمصفوفة المنتجات الكاملة
         let filteredProducts = [...allProductsData];

         // 1. تطبيق فلتر الفئة من الشريط الجانبي (من الرابط النشط)
         const activeCategoryLink = document.querySelector('.filter-list.category-filter-list a.active');
         const sidebarCategory = activeCategoryLink ? new URLSearchParams(new URL(activeCategoryLink.href).search).get('category') : null;

         if (sidebarCategory && sidebarCategory !== 'all') {
              filteredProducts = filteredProducts.filter(p => p.category && p.category.toLowerCase() === sidebarCategory.toLowerCase());
         }

          // 2. تطبيق فلتر العلامة التجارية من الشريط الجانبي (من الرابط النشط)
         const activeBrandLink = document.querySelector('.filter-list.brand-filter-list a.active');
          const sidebarBrand = activeBrandLink ? new URLSearchParams(new URL(activeBrandLink.href).search).get('brand') : null;

          if (sidebarBrand) {
               filteredProducts = filteredProducts.filter(p => p.brand && p.brand.toLowerCase().includes(sidebarBrand.toLowerCase()));
          }


         // 3. تطبيق فلتر السعر من الشريط الجانبي
         const minPrice = priceMinInput ? parseFloat(priceMinInput.value) : null;
         const maxPrice = priceMaxInput ? parseFloat(priceMaxInput.value) : null;

         if (minPrice !== null && maxPrice !== null) {
              filteredProducts = filteredProducts.filter(p => {
                  const price = parseFloat(p.price);
                  return !isNaN(price) && price >= minPrice && price <= maxPrice;
              });
         }

         // بعد تطبيق فلاتر الشريط الجانبي، يتم تحديث currentFilteredProducts
         currentFilteredProducts = filteredProducts;
         currentPage = 1; // ارجع للصفحة الأولى بعد تطبيق فلاتر جديدة

         // لا تغير URL هنا إذا أردت الفلاتر أن تكون تفاعلية فقط بدون تحديث الرابط

         sortAndRenderProducts(); // الفرز والعرض بناءً على المنتجات المفلترة الجديدة

          // يمكنك هنا تحديث عنوان الصفحة الرئيسية ليعكس الفلاتر المطبقة من الشريط الجانبي
          // بناءً على الفئة المختارة والعلامة التجارية
           let newPageTitle = "المنتجات";
           if (sidebarCategory && sidebarCategory !== 'all') {
               newPageTitle += ` - فئة: ${sidebarCategory}`;
           }
           if (sidebarBrand) {
               newPageTitle += ` - ماركة: ${sidebarBrand}`;
           }
           if (pageTitleElement) {
               pageTitleElement.textContent = newPageTitle;
           }

    }


    // === دالة لفرز ثم عرض المنتجات ===
    function sortAndRenderProducts() {
         const sortBy = sortSelect ? sortSelect.value : 'default';
         // فرز currentFilteredProducts بناءً على القيمة المختارة
         switch (sortBy) {
             case 'price-asc': currentFilteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break;
             case 'price-desc': currentFilteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break;
             case 'latest': currentFilteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
             case 'rating': currentFilteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
             default:
                 currentFilteredProducts.sort((a, b) => (a.id || 0) - (b.id || 0)); // فرز افتراضي حسب ID
         }
         renderProductsPage(); // عرض المنتجات المفرزة
    }

    // === دالة لعرض صفحة المنتجات الحالية ===
    function renderProductsPage() {
        // إظهار placeholder التحميل مؤقتاً
         const loadingPlaceholder = productsContainer.closest('.shop-main-content').querySelector('.loading-placeholder');
         if(loadingPlaceholder) loadingPlaceholder.style.display = 'block';
         if(productsContainer) productsContainer.style.display = 'none'; // إخفاء الشبكة أثناء التحميل


        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = currentFilteredProducts.slice(startIndex, endIndex);

        // مسح المحتوى الحالي
        productsContainer.innerHTML = '';

        if (paginatedProducts.length === 0) {
            productsContainer.innerHTML = '<p class="no-products-found" style="grid-column: 1 / -1; text-align: center; margin-top: 30px;">لم يتم العثور على منتجات تطابق بحثك.</p>';
        } else {
            paginatedProducts.forEach(product => {
                // استخدم createProductCard المستوردة من utils.js
                const productCardElement = createProductCard(product); // createProductCard تتضمن الآن ربط الأحداث
                if (productCardElement) {
                    productsContainer.appendChild(productCardElement);
                }
            });
        }

         // إخفاء placeholder وإظهار الشبكة بعد العرض
          if(loadingPlaceholder) loadingPlaceholder.style.display = 'none';
          if(productsContainer) productsContainer.style.display = 'grid'; // إظهار الشبكة بعد العرض


        // تحديث عدد النتائج المعروضة
        if (resultsCountElement) {
            const startItem = currentFilteredProducts.length > 0 ? startIndex + 1 : 0;
            const endItem = Math.min(endIndex, currentFilteredProducts.length);
             resultsCountElement.textContent = `عرض ${startItem}-${endItem} من ${currentFilteredProducts.length} نتيجة`;
             // تحديث إجمالي عدد المنتجات في الشريط الجانبي (اختياري) - تم نقله إلى updateSidebarCounts
        }
        renderPagination(); // إعادة عرض أزرار ترقيم الصفحات
    }

    // === دالة لإنشاء أزرار ترقيم الصفحات ===
    function renderPagination() { /* ... كود الدالة كما هو ... */ }


    // === دالة لربط مستمعات الأحداث ===
    function setupEventListeners() {
         // مستمعي أحداث الفرز
         if (sortSelect) {
             sortSelect.addEventListener('change', sortAndRenderProducts);
         }

         // مستمعي أحداث ترقيم الصفحات
         if (paginationContainer) {
              paginationContainer.addEventListener('click', (e) => {
                  const target = e.target.closest('.page-link');
                  if (target && target.dataset.page) {
                      e.preventDefault();
                      const page = parseInt(target.dataset.page, 10);
                      if(page > 0 && page <= Math.ceil(currentFilteredProducts.length / productsPerPage) && page !== currentPage) {
                          currentPage = page;
                          renderProductsPage();
                           const mainContentTop = document.querySelector('.shop-main-content').offsetTop;
                           window.scrollTo({ top: mainContentTop - 100, behavior: 'smooth' }); // التمرير لأعلى منطقة المنتجات
                      }
                  }
              });
          }

        // مستمعي أحداث فلاتر الشريط الجانبي (الفئات والعلامات التجارية)
        categoryFilterLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                categoryFilterLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                 // إزالة active من فلاتر العلامات التجارية عند اختيار فئة جديدة
                 brandFilterLinks.forEach(l => l.classList.remove('active'));
                applySidebarFilters();
            });
        });

        brandFilterLinks.forEach(link => { // إضافة مستمعين لفلاتر العلامات التجارية
            link.addEventListener('click', function(e) {
                e.preventDefault();
                brandFilterLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                 // إزالة active من فلاتر الفئات عند اختيار علامة تجارية جديدة
                 categoryFilterLinks.forEach(l => l.classList.remove('active'));
                applySidebarFilters();
            });
        });


        // مستمعي أحداث فلاتر السعر (تحديث العرض)
         if (priceMinInput && priceMinValueOutput) {
              priceMinInput.addEventListener('input', () => { priceMinValueOutput.textContent = priceMinInput.value; });
         }
          if (priceMaxInput && priceMaxValueOutput) {
              priceMaxInput.addEventListener('input', () => { priceMaxValueOutput.textContent = priceMaxInput.value; });
         }

        // مستمع حدث زر "تطبيق الفلاتر"
         if (applyFiltersBtn) {
             applyFiltersBtn.addEventListener('click', applySidebarFilters);
         }


         // === ربط أحداث "أضف إلى السلة" و "إضافة للمفضلة" باستخدام Event Delegation ===
         // هذا المستمع موجود بالفعل في createProductCard في utils.js.
         // ولكن Event Delegation على الحاوية (productsContainer) هي الطريقة الأفضل.
         // سنضيف المستمع هنا بدلاً من createProductCard.
         if (productsContainer) {
              productsContainer.addEventListener('click', async (e) => {
                 const target = e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-wishlist-btn');

                 if (!target) return;

                 e.preventDefault();

                 const productId = parseInt(target.dataset.productId);
                 if (isNaN(productId)) {
                     console.error("ProductsJS: Invalid product ID from data attribute.");
                     return;
                 }

                 // نحتاج كائن المنتج الكامل
                 const product = allProductsData.find(p => p.id === productId);
                 if (!product) {
                     console.error(`ProductsJS: Product with ID ${productId} not found.`);
                     return;
                 }

                 if (target.classList.contains('add-to-cart-btn')) {
                     // استدعاء دالة الإضافة للسلة
                      addProductToCart(product, 1); // استدعاء مباشر للدالة المستوردة
                       // يمكنك إضافة رسالة تأكيد بسيطة (تستخدم showNotification إذا كانت في utils أو main)
                       if (typeof showNotification !== 'undefined') {
                            showNotification(`تم إضافة "${product.name}" إلى السلة`, 'success');
                       }


                 } else if (target.classList.contains('add-to-wishlist-btn')) {
                     // استدعاء دالة تبديل المفضلة
                      toggleWishlist(product); // استدعاء مباشر للدالة المستوردة
                       // toggleWishlist تحدث الـ UI تلقائياً
                       // يمكنك إضافة رسالة تأكيد بسيطة
                        if (typeof showNotification !== 'undefined') {
                            if (isProductInWishlist(product.id)) { // تحقق بعد التبديل
                                showNotification(`تم إضافة "${product.name}" إلى المفضلة`, 'success');
                            } else {
                                showNotification(`تم إزالة "${product.name}" من المفضلة`, 'info');
                            }
                        }
                 }
              });
          }

          // ربط حدث البحث الرئيسي في الرأسية
         // بما أن الـ form لديه action="search-results.html" و method="GET"،
         // المتصفح سيتعامل مع الانتقال وتمرير الـ query parameter تلقائياً.
         // صفحة search-results.html (إذا أنشأتها) ستقرأ query parameter
         // وتستخدم منطق products.js لفلترة المنتجات.
         // إذا كنت تريد صفحة المنتجات الحالية products.html أن تقوم بالبحث
         // دون تحديث الصفحة، ستحتاج إلى اعتراض حدث submit هنا
         // واستدعاء applyFiltersFromURL أو applySidebarFilters مع تضمين قيمة البحث.
         // للتبسيط، نعتمد حالياً على سلوك النموذج الافتراضي والانتقال لصفحة النتائج search-results.html.
    }


    // بدء تشغيل السكربت
    init();
});