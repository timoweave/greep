$(document).ready(function () {
    const trigger = $('.hamburger');
    const overlay = $('.overlay');
    const wrapper = $('#wrapper');
    const offcanvas = $('[data-toggle="offcanvas"]');
    const hamburger_cross = define_hamburger_cross();
   
    trigger.click(function () {
        hamburger_cross();      
    });

    offcanvas.click(function () {
        wrapper.toggleClass('toggled');
    });
    
    function define_hamburger_cross() {
        let isClosed = false;
        return function() {
            if (isClosed == true) {          
                overlay.hide();
                trigger.removeClass('is-open');
                trigger.addClass('is-closed');
                isClosed = false;
            } else {   
                overlay.show();
                trigger.removeClass('is-closed');
                trigger.addClass('is-open');
                isClosed = true;
            }
        };
    }
    
});
