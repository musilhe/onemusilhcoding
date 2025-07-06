// js/swiper-init.js
document.addEventListener('DOMContentLoaded', function () {
    if (typeof Swiper === 'undefined') {
        console.warn("Swiper library is not loaded.");
        return;
    }
    // تفعيل Swiper لقسم المنتجات الأكثر مبيعًا
    if (document.querySelector(".best-sellers-carousel")) {
        var bestSellersSwiper = new Swiper(".best-sellers-carousel", {
            slidesPerView: 1, 
            spaceBetween: 15, 
            loop: true, 
            grabCursor: true,
            navigation: { 
                nextEl: ".best-sellers-carousel .swiper-button-next", 
                prevEl: ".best-sellers-carousel .swiper-button-prev", 
            },
            pagination: { 
                el: ".best-sellers-carousel .swiper-pagination", 
                clickable: true, 
            },
            breakpoints: { 
                576: { slidesPerView: 2, spaceBetween: 20 }, 
                768: { slidesPerView: 3, spaceBetween: 25 }, 
                992: { slidesPerView: 4, spaceBetween: 30 } 
            }
        });
    }

    // تفعيل Swiper لقسم شعارات العلامات التجارية
    if (document.querySelector(".brand-logos-carousel")) {
        var brandLogosSwiper = new Swiper(".brand-logos-carousel", {
            slidesPerView: 2, 
            spaceBetween: 20, 
            loop: true,
            autoplay: { 
                delay: 2500, 
                disableOnInteraction: false, 
            },
            grabCursor: true,
            navigation: { 
                nextEl: ".brand-logos-carousel .swiper-button-next", 
                prevEl: ".brand-logos-carousel .swiper-button-prev", 
            },
            breakpoints: { 
                576: { slidesPerView: 3, spaceBetween: 25 }, 
                768: { slidesPerView: 4, spaceBetween: 30 }, 
                992: { slidesPerView: 5, spaceBetween: 40 }, 
                1200: { slidesPerView: 6, spaceBetween: 50 } 
            }
        });
    }
    
    // تفعيل Swiper لقسم آراء العملاء
    if (document.querySelector(".testimonials-carousel")) {
        var testimonialsSwiper = new Swiper(".testimonials-carousel", {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            grabCursor: true,
            autoplay: { 
                delay: 5000, 
                disableOnInteraction: false,
            },
            pagination: {
                el: ".testimonials-carousel .swiper-pagination",
                clickable: true,
            },
            navigation: { 
                nextEl: ".testimonials-carousel .testimonials-button-next",
                prevEl: ".testimonials-carousel .testimonials-button-prev",
            },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 25 },
                992: { slidesPerView: 3, spaceBetween: 30 }
            }
        });
    }

    // تفعيل Swiper لقسم المدونات
    if (document.querySelector(".blog-carousel")) {
        var blogSwiper = new Swiper(".blog-carousel", {
            slidesPerView: 1, 
            spaceBetween: 30,
            loop: true, 
            grabCursor: true,
            pagination: {
                el: ".blog-carousel .blog-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".blog-carousel .blog-button-next",
                prevEl: ".blog-carousel .blog-button-prev",
            },
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 25 },
                992: { slidesPerView: 3, spaceBetween: 30 }
            }
        });
    }

}); // نهاية DOMContentLoaded