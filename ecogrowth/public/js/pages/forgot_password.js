"use strict";
$(document).ready(function () {
    $(window).on("load",function() {
        $('.preloader img').fadeOut();
        $('.preloader').fadeOut(1000);
    });
    $('#tryitForm').bootstrapValidator({
        fields: {
            email: {
                validators: {
                    notEmpty: {
                        message: 'Enter the email address'
                    },
                    regexp: {
                        regexp: /^\S+@\S{1,}\.\S{1,}$/,
                        message: 'The input is not a valid email address'
                    }
                }
            },
            submitHandler: function (form) {
                if ($('#tryitForm').valid()) {
                    console.log("now we enable the submit button!");
                }
            }
        }
    });
});