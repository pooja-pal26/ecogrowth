"use strict";
$(document).ready(function () {
    var header = $(".header").height();
    var footer = $(".footer_content").height();
    if ($(window).width() >= 992) {
        setTimeout(function () {
            leftmenuscroll();
        }, 500);
    }
    function leftmenuscroll() {
        var left_height1 = $('.menu_scroll').css('height', ($(window).height() - header + 0) + 'px');
        var window_footer = $(window).height() + footer;
        var scroll_bottom = $(document).height() - window_footer;
        $(window).on("scroll", function () {
            if ($(this).scrollTop() > scroll_bottom) {
                $('.menu_scroll').slimScroll({
                    height: $('.menu_scroll').css('height', ($(window).height()) - (header + footer + 15) + 'px'),
                    size: '5px',
                    color: '#ccc'
                });
            } else {
                $('.menu_scroll').slimScroll({
                    height: $('.menu_scroll').css('height', ($(window).height() - header + 0) + 'px'),
                    size: '5px',
                    color: '#ccc'
                });
            }
        });
    }

    $(window).resize(function () {
        setTimeout(function () {
            leftmenuscroll();
        }, 200);

    });
});