document.addEventListener('DOMContentLoaded', function() {
    // ScrollReveal Initialization
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'bottom',    // 'bottom', 'left', 'right', 'top'
            distance: '20px',    // Distance element moves
            duration: 500,       // Animation duration in ms
            delay: 100,          // Delay before animation starts
            easing: 'cubic-bezier(0.5, 0, 0, 1)', // Easing function
            reset: false,        // Animations repeat on scroll up
            mobile: true,        // Enable on mobile
            viewFactor: 0.2      // Percentage of element in viewport to trigger
        });

        // General reveal for sections
        sr.reveal('.section-padding', { interval: 150 });

        // Reveal for product cards
        sr.reveal('.product-card', { interval: 100, origin: 'bottom', distance: '30px' });
        
        // Reveal for category cards
        sr.reveal('.category-card', { interval: 100, origin: 'left', distance: '30px' });

        // Reveal for feature items
        sr.reveal('.feature-item', { interval: 100, origin: 'top', distance: '20px' });
        
        // Reveal for blog cards
        sr.reveal('.blog-card', { interval: 100, origin: 'bottom', distance: '30px' });
        
        // Reveal for testimonial cards
        sr.reveal('.testimonial-card', { interval: 100, origin: 'right', distance: '30px'});

        // Specific reveals for elements on the homepage
        sr.reveal('.hero-content > *', { interval: 150, origin: 'top', distance: '40px', delay: 200 });
        sr.reveal('.promo-banner-image', { origin: 'left', distance: '50px' });
        sr.reveal('.promo-banner-text > *', { origin: 'right', distance: '50px', interval: 100 });

    } else {
        console.warn('ScrollReveal is not defined. Make sure the library is loaded.');
    }
});
