"use strict";
$(document).ready(function () {
    $(".breadcrumb_background").backstretch([
        "img/cardsimg1.jpg" ,"img/widget_weather2.jpg","img/widget_weather3.jpg"
    ], {duration: 2000, fade: 750});

    var options = {
        useEasing: true,
        useGrouping: true,
        decimal: '.',
        prefix: '',
        suffix: ''
    };
    new CountUp("views_1", 0, 97, 0, 2.5, options).start();
    new CountUp("views_2", 0, 350, 0, 2.5, options).start();
    new CountUp("views_3", 0, 150, 0, 2.5, options).start();
    new CountUp("views_4", 0, 120, 0, 2.5, options).start();
});