"use strict";
$(document).ready(function () {
    $("#hamburger").on('click',function () {
        setTimeout(function () {
            if($('html').hasClass('mm-opening')){
                $(".hamburger").addClass('is-active');
            }
            else{
                $(".hamburger").removeClass('is-active');
            }
        },100);
    });
    $("#mm-blocker").on('click',function () {
        setTimeout(function () {
            if($('html').hasClass('mm-opening')){
                $(".hamburger").addClass('is-active');
            }
            else{
                $(".hamburger").removeClass('is-active');
            }
        },100);
    });
});