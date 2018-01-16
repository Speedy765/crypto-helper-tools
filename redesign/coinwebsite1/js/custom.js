$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll >  540) {
        $("body").addClass("body-header");
    }
    else {
        $("body").removeClass("body-header");
    }
});