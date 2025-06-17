document.addEventListener('DOMContentLoaded', function() { // للتأكد أن DOM جاهز

    // وظيفة إخفاء مؤشر التحميل (Preloader)
    // (تأكد من أن لديك عنصر HTML بالـ class "preloader" إذا كنت ستستخدم هذا)
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', function() { // انتظر تحميل كل الموارد
            setTimeout(function() {
                preloader.classList.add('hidden');
                // يمكنك إضافة preloader.style.display = 'none'; بعد انتهاء الانتقال
            }, 500); 
        });
    }

    // تحديث سنة حقوق النشر في التذييل
    const footerCurrentYearSpan = document.getElementById('footer-current-year');
    if (footerCurrentYearSpan) {
        footerCurrentYearSpan.textContent = new Date().getFullYear();
    }

    // وظيفة لتثبيت الرأسية وتعديل حشو المحتوى
    function stickyHeader() {
        const headerWrapper = document.querySelector('.sticky-header-wrapper');
        if (!headerWrapper) return; // اخرج إذا لم يتم العثور على الحاوية

        const nextElement = headerWrapper.nextElementSibling; 
        if (!nextElement) {
            // console.warn("Next element for sticky header not found.");
            return;
        }
        const headerHeight = headerWrapper.offsetHeight;
        nextElement.style.marginTop = headerHeight + 'px';
    }
    // استدعاء الوظيفة عند تحميل الصفحة وعند تغيير حجم النافذة
    stickyHeader(); // استدعاء أولي للتأكد من تطبيق الهامش
    window.addEventListener('load', stickyHeader); // استدعاء آخر بعد تحميل كل شيء (خاصة الصور)
    window.addEventListener('resize', stickyHeader);

    // وظيفة الرسالة الترحيبية (إذا كنت تستخدمها)
    // (تأكد من أن لديك عناصر HTML بـ IDs 'welcomeNotification' و 'closeWelcomeNotification')
    const welcomeNotification = document.getElementById('welcomeNotification');
    const closeWelcomeBtn = document.getElementById('closeWelcomeNotification');
    if (welcomeNotification && closeWelcomeBtn) {
        setTimeout(() => {
            welcomeNotification.classList.add('show');
        }, 1500); 
        closeWelcomeBtn.addEventListener('click', function() {
            welcomeNotification.classList.remove('show');
        });
    }

    // وظيفة زر "العودة إلى الأعلى"
    const backToTopBtn = document.getElementById("backToTopButton");
    if (backToTopBtn) {
        window.addEventListener('scroll', function() { // استخدم addEventListener بدلاً من onscroll المباشر
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

    // وظيفة قائمة التنقل المتجاوبة (الهمبرغر)
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

}); // نهاية DOMContentLoaded