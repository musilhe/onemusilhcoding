// js/wishlist.js

// مفتاح التخزين في localStorage
const WISHLIST_STORAGE_KEY = 'mowaffarcar_wishlist';

/**
 * يجلب محتويات قائمة المفضلة من localStorage.
 * @returns {Array<object>} - مصفوفة من كائنات المنتجات في المفضلة.
 */
export function getWishlistItems() {
     try {
        const wishlistJson = localStorage.getItem(WISHLIST_STORAGE_KEY);
        return wishlistJson ? JSON.parse(wishlistJson) : [];
    } catch (error) {
        console.error("WishlistJS: Error retrieving wishlist from localStorage:", error);
        return [];
    }
}

/**
 * يحفظ مصفوفة قائمة المفضلة في localStorage.
 * @param {Array<object>} wishlistItems - مصفوفة المنتجات في المفضلة.
 */
export function saveWishlistItems(wishlistItems) {
    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
         console.log("WishlistJS: Wishlist saved to localStorage.");
        // بعد الحفظ، قم بتحديث واجهة المستخدم (مثل أيقونات القلب)
        updateWishlistUI(); // هذه الدالة ستبحث عن أيقونات القلب في الصفحة الحالية وتحدثها
    } catch (error) {
        console.error("WishlistJS: Error saving wishlist to localStorage:", error);
    }
}

/**
 * يضيف منتجاً إلى قائمة المفضلة.
 * @param {object} product - كائن المنتج المراد إضافته.
 * @returns {boolean} - true إذا تم الإضافة بنجاح، false إذا كان المنتج موجوداً بالفعل.
 */
export function addProductToWishlist(product) {
     if (!product) {
        console.error("WishlistJS: Invalid product provided for addProductToWishlist.");
        return false;
    }
    const wishlist = getWishlistItems();
    // تحقق مما إذا كان المنتج موجوداً بالفعل باستخدام ID
    if (wishlist.some(item => item.id === product.id)) {
        console.log(`WishlistJS: Product ID ${product.id} is already in wishlist.`);
        return false; // موجود بالفعل
    }
    wishlist.push(product);
    saveWishlistItems(wishlist);
    console.log(`WishlistJS: Added product ID ${product.id} to wishlist.`);
     // يمكنك إضافة رسالة تأكيد بسيطة للإضافة
     // if (typeof showNotification !== 'undefined') {
     //     showNotification(`تم إضافة "${product.name}" إلى المفضلة`, 'success');
     // }
    return true; // تم الإضافة
}

/**
 * يحذف منتجاً من قائمة المفضلة.
 * @param {number} productId - معرّف المنتج المراد حذفه.
 * @returns {boolean} - true إذا تم الحذف بنجاح، false إذا لم يتم العثور على المنتج.
 */
export function removeProductFromWishlist(productId) {
     if (typeof productId !== 'number') {
        console.error("WishlistJS: Invalid productId provided for removeProductFromWishlist.");
        return false;
    }
    let wishlist = getWishlistItems();
    const initialLength = wishlist.length;
    wishlist = wishlist.filter(item => item.id !== productId);
     if (wishlist.length < initialLength) {
        saveWishlistItems(wishlist);
        console.log(`WishlistJS: Removed product ID ${productId} from wishlist.`);
         // يمكنك إضافة رسالة تأكيد للحذف
         // if (typeof showNotification !== 'undefined') {
         //     showNotification("تم حذف المنتج من المفضلة", 'info');
         // }
        return true; // تم الحذف
    } else {
        console.warn(`WishlistJS: Product ID ${productId} not found in wishlist for removal.`);
        return false; // لم يتم العثور عليه
    }
}

/**
 * يضيف أو يحذف منتجاً من قائمة المفضلة (تبديل الحالة).
 * هذا مفيد للأزرار التي تقوم بالإضافة والحذف بنفس النقر.
 * @param {object} product - كائن المنتج.
 * @returns {boolean} - true إذا تم إضافة المنتج، false إذا تم حذفه.
 */
export function toggleWishlist(product) {
     if (!product) {
        console.error("WishlistJS: Invalid product provided for toggleWishlist.");
        return false;
    }
    const wishlist = getWishlistItems();
    const existingItemIndex = wishlist.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // المنتج موجود، احذفه
        removeProductFromWishlist(product.id);
        console.log(`WishlistJS: Toggled OFF product ID ${product.id}.`);
        return false; // تم الحذف
    } else {
        // المنتج غير موجود، أضفه
        addProductToWishlist(product);
         console.log(`WishlistJS: Toggled ON product ID ${product.id}.`);
        return true; // تم الإضافة
    }
}


/**
 * يتحقق مما إذا كان منتج معين موجوداً في قائمة المفضلة.
 * @param {number} productId - معرّف المنتج المراد التحقق منه.
 * @returns {boolean} - true إذا كان المنتج موجوداً، false إذا لم يكن موجوداً.
 */
export function isProductInWishlist(productId) {
    const wishlist = getWishlistItems();
    return wishlist.some(item => item.id === productId);
}

/**
 * يحدّث واجهة المستخدم الخاصة بأيقونات المفضلة في الصفحة الحالية.
 * هذه الدالة يجب استدعاؤها عند تحميل الصفحة وبعد أي تغيير في قائمة المفضلة.
 * ستقوم بالبحث عن جميع الأزرار/الأيقونات التي تحمل فئة معينة و dataset.product-id
 * وتعديل مظهرها بناءً على ما إذا كان المنتج في المفضلة أم لا.
 */
export function updateWishlistUI() {
    // ابحث عن جميع الأزرار/الأيقونات الخاصة بالمفضلة في الصفحة
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist-btn'); // استخدم الفئة التي وضعتها في createProductCard

    wishlistButtons.forEach(button => {
        const productId = parseInt(button.dataset.productId);
        const icon = button.querySelector('i');
        if (icon && typeof productId === 'number') {
            if (isProductInWishlist(productId)) {
                // إذا كان المنتج في المفضلة، استخدم أيقونة القلب الممتلئة واللون الأساسي
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                 // يمكنك أيضاً تغيير لون الزر عبر CSS أو هنا مباشرة
                 // button.style.color = 'var(--primary-color)'; // مثال
                 button.classList.add('in-wishlist'); // إضافة فئة لتنسيقها في CSS
            } else {
                // إذا لم يكن المنتج في المفضلة، استخدم أيقونة القلب الفارغة واللون الافتراضي
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                 // button.style.color = ''; // مثال
                 button.classList.remove('in-wishlist');
            }
        }
    });
    console.log("WishlistJS: Wishlist UI updated.");
     // يمكنك تحديث عدد عناصر المفضلة في الرأسية هنا أيضاً إذا كان لديك عنصر لذلك
     // const wishlistCountElement = document.querySelector('.wishlist-count');
     // if (wishlistCountElement) {
     //      wishlistCountElement.textContent = getWishlistItems().length;
     // }
}

// يمكنك إضافة مستمع حدث هنا لتحديث الـ UI عند تحميل الصفحة لأول مرة
// أو استدعاء updateWishlistUI() من main.js عند DOMContentLoaded
// document.addEventListener('DOMContentLoaded', updateWishlistUI);