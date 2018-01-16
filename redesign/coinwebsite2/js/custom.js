$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll > 1) {
        $("body").addClass("body-header");
    }
    else {
        $("body").removeClass("body-header");
    }
});