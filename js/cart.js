// js/cart.js

// مفتاح التخزين في localStorage
const CART_STORAGE_KEY = 'mowaffarcar_cart';

/**
 * يجلب محتويات سلة التسوق من localStorage.
 * @returns {Array<object>} - مصفوفة من كائنات المنتجات في السلة (مع خاصية quantity).
 */
export function getCartItems() {
    try {
        const cartJson = localStorage.getItem(CART_STORAGE_KEY);
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
        console.error("CartJS: Error retrieving cart from localStorage:", error);
        return []; // إرجاع سلة فارغة في حالة وجود مشكلة في التخزين
    }
}

/**
 * يحفظ مصفوفة سلة التسوق في localStorage.
 * @param {Array<object>} cartItems - مصفوفة المنتجات في السلة.
 */
export function saveCartItems(cartItems) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        console.log("CartJS: Cart saved to localStorage.");
        // بعد الحفظ، قم بتحديث واجهة المستخدم (مثل عداد السلة)
        updateCartUI();
    } catch (error) {
        console.error("CartJS: Error saving cart to localStorage:", error);
        // يمكنك إظهار رسالة خطأ للمستخدم هنا إذا أردت
    }
}

/**
 * يضيف منتجاً إلى سلة التسوق أو يزيد كميته إذا كان موجوداً.
 * @param {object} product - كائن المنتج المراد إضافته.
 * @param {number} [quantity=1] - الكمية المراد إضافتها.
 * @returns {void}
 */
export function addProductToCart(product, quantity = 1) {
    if (!product || typeof quantity !== 'number' || quantity <= 0) {
        console.error("CartJS: Invalid product or quantity provided for addProductToCart.");
        return;
    }

    const cart = getCartItems();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // المنتج موجود بالفعل، قم بزيادة الكمية
        cart[existingItemIndex].quantity += quantity;
        console.log(`CartJS: Increased quantity for product ID ${product.id}. New quantity: ${cart[existingItemIndex].quantity}`);
    } else {
        // المنتج غير موجود، قم بإضافته
        cart.push({ ...product, quantity: quantity });
        console.log(`CartJS: Added product ID ${product.id} to cart.`);
    }

    saveCartItems(cart);
    // يمكنك إضافة رسالة تأكيد بسيطة للمستخدم هنا (مثلاً باستخدام دالة showNotification من main.js إذا كانت متاحة عالمياً أو تم استيرادها)
    // مثال بسيط (يحتاج showNotification لتكون متاحة):
    // if (typeof showNotification !== 'undefined') {
    //     showNotification(`تم إضافة "${product.name}" إلى السلة`, 'success');
    // }
}

/**
 * يحذف منتجاً من سلة التسوق.
 * @param {number} productId - معرّف المنتج المراد حذفه.
 * @returns {void}
 */
export function removeProductFromCart(productId) {
     if (typeof productId !== 'number') {
        console.error("CartJS: Invalid productId provided for removeProductFromCart.");
        return;
    }

    let cart = getCartItems();
    const initialLength = cart.length;
    cart = cart.filter(item => item.id !== productId);

    if (cart.length < initialLength) {
        saveCartItems(cart);
        console.log(`CartJS: Removed product ID ${productId} from cart.`);
         // يمكنك إضافة رسالة تأكيد للحذف
         // if (typeof showNotification !== 'undefined') {
         //     showNotification("تم حذف المنتج من السلة", 'info');
         // }
    } else {
        console.warn(`CartJS: Product ID ${productId} not found in cart for removal.`);
    }
}

/**
 * يحدّث كمية منتج معين في سلة التسوق.
 * @param {number} productId - معرّف المنتج.
 * @param {number} quantity - الكمية الجديدة للمنتج.
 * @returns {void}
 */
export function updateProductQuantity(productId, quantity) {
     if (typeof productId !== 'number' || typeof quantity !== 'number' || quantity < 0) {
        console.error("CartJS: Invalid productId or quantity provided for updateProductQuantity.");
        return;
    }

    const cart = getCartItems();
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        if (quantity === 0) {
            // إذا كانت الكمية صفر، احذف المنتج
            removeProductFromCart(productId);
        } else {
            // وإلا، حدث الكمية
            cart[existingItemIndex].quantity = quantity;
            saveCartItems(cart);
            console.log(`CartJS: Updated quantity for product ID ${productId} to ${quantity}.`);
        }
    } else {
         console.warn(`CartJS: Product ID ${productId} not found in cart for quantity update.`);
    }
}


/**
 * يحسب العدد الإجمالي للعناصر (عدد المنتجات * الكمية لكل منتج) في السلة.
 * هذا هو العدد الذي يظهر عادة بجوار أيقونة السلة.
 * @returns {number} - العدد الإجمالي للعناصر في السلة.
 */
export function getCartTotalItems() {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * يحسب القيمة الإجمالية للسلة (سعر المنتج * كميته).
 * @returns {number} - القيمة الإجمالية للسلة.
 */
export function getCartTotalAmount() {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2); //toFixed(2) لتنسيق السعر برقمين عشريين
}

/**
 * يحدّث واجهة المستخدم التي تعرض عدد عناصر السلة (مثلاً، الشارة بجوار الأيقونة).
 * يجب استدعاء هذه الدالة بعد أي تغيير في السلة (إضافة، حذف، تحديث كمية).
 */
export function updateCartUI() {
    const cartCountElement = document.querySelector('.cart-count'); // استهدف العنصر الذي يعرض العدد
    if (cartCountElement) {
        const totalItems = getCartTotalItems();
        cartCountElement.textContent = totalItems.toString();
        // يمكنك إضافة/إزالة فئة لإخفاء الشارة إذا كان العدد صفر
        if (totalItems > 0) {
             cartCountElement.classList.add('visible'); // افترض أن لديك فئة CSS تجعلها مرئية
        } else {
             cartCountElement.classList.remove('visible');
        }
        console.log("CartJS: Cart UI updated. Total items:", totalItems);
    }
}

// يمكنك إضافة مستمع حدث هنا لتحديث الـ UI عند تحميل الصفحة لأول مرة
// أو استدعاء updateCartUI() من main.js عند DOMContentLoaded
// document.addEventListener('DOMContentLoaded', updateCartUI);