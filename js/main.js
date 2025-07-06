// js/main.js - الكود العام للموقع

import { updateCartUI } from './cart.js';
import { updateWishlistUI } from './wishlist.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 300);
        });
    }

    // 2. Sticky Header
    function stickyHeader() {
        const headerWrapper = document.querySelector('.sticky-header-wrapper');
        if (!headerWrapper) return;
        const nextElement = headerWrapper.nextElementSibling;
        if (!nextElement) return;
        const headerHeight = headerWrapper.offsetHeight;
        nextElement.style.marginTop = headerHeight + 'px';
    }
    if (document.querySelector('.sticky-header-wrapper')) {
        stickyHeader();
        window.addEventListener('load', stickyHeader);
        window.addEventListener('resize', stickyHeader);
    }

    // 3. Responsive Navigation Menu
    const browseCategoriesBtn = document.querySelector('.browse-categories-btn');
    const navLinksMenu = document.getElementById('main-nav-links');
    if (browseCategoriesBtn && navLinksMenu) {
        browseCategoriesBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // منع انتشار النقر للـ document
            navLinksMenu.classList.toggle('is-active');
            const isExpanded = navLinksMenu.classList.contains('is-active');
            browseCategoriesBtn.setAttribute('aria-expanded', isExpanded);
            const icon = browseCategoriesBtn.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
            }
        });
        document.addEventListener('click', function() {
            if (navLinksMenu.classList.contains('is-active')) {
                navLinksMenu.classList.remove('is-active');
                browseCategoriesBtn.setAttribute('aria-expanded', 'false');
                const icon = browseCategoriesBtn.querySelector('i');
                icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
            }
        });
    }

    // 4. Back to Top Button
    const backToTopBtn = document.getElementById("backToTopButton");
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        });
        backToTopBtn.addEventListener("click", e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Update Footer Year
    const footerCurrentYearSpan = document.getElementById('footer-current-year');
    if (footerCurrentYearSpan) {
        footerCurrentYearSpan.textContent = new Date().getFullYear();
    }

    // 6. Welcome Notification
    const welcomeNotification = document.getElementById('welcomeNotification');
    const closeWelcomeBtn = document.getElementById('closeWelcomeNotification');
    if (welcomeNotification && closeWelcomeBtn) {
        setTimeout(() => {
            welcomeNotification.classList.add('show');
        }, 2000);
        closeWelcomeBtn.addEventListener('click', () => {
            welcomeNotification.classList.remove('show');
        });
    }

    // 7. Update Cart and Wishlist UI on every page load
    updateCartUI();
    updateWishlistUI();
});