"use strict";
$(document).ready(function () {
    //        folded menu
    if($(window).width()>=576){
        $(function () {
            $('.menu-dropdown>a').off("click");
            $('.menu-dropdown>a').on("click", function (e) {
                e.preventDefault();
            });
        });
        $("#menu>ul>.menu-dropdown").hover(function () {
            var sideoffset = $("#menu").offset();
            var submenuoffset = $(this).children("ul").offset();
            if (sideoffset.top + $("#menu").height() < submenuoffset.top + $(this).children("ul").height()) {
                $(this).children("ul").addClass("sidebarbottom");
            }
        });
    }
    if ($(window).width() <= 992) {
        leftmenuscroll();
        $(window).resize(function() {
            leftmenuscroll();
        });
    }
    function leftmenuscroll() {
        var header = $('.header').height();
        var footer=$("footer").height();
        $('.sidebar1').css('height', $(window).height()-header+footer + 'px' );
        $('.sidebar1').jScrollPane({
            autoReinitialise: true,
            autoReinitialiseDelay: 100
        });
    }
});