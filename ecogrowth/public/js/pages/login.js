"use strict";
$(document).ready(function () {
    $(window).on("load",function() {
        $('.preloader img').fadeOut();
        $('.preloader').fadeOut(1000);
    });
    $(".reg_submit").on("click",function () {

        var password = document.getElementById("txtPassword").value;
        var confirmPassword = document.getElementById("cnfpassword").value;
        if (password != confirmPassword) {
            alert("Passwords do not match.");
            return false;
        }
        else{
            return true;

        }
    });
    $('#tryitForm').bootstrapValidator({
        fields: {

            password: {
                validators: {

                    notEmpty: {
                        message: 'Enter the password'
                    }
                }
            },
            confirmpassword: {
                validators: {
                    notEmpty: {
                        message: 'Confirm the password'
                    },
                    identical: {
                        field: 'password',
                        message: 'Please enter the same password as above'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'Enter the email address '
                    },
                    regexp: {
                        regexp: /^\S+@\S{1,}\.\S{1,}$/,
                        message: 'The input is not a valid email address '
                    }
                }
            },
            cell: {
                validators: {
                    notEmpty: {
                        message: 'Enter the phone number'
                    },
                    regexp: {
                        regexp: /^[0-9]{10}$/,
                        message: 'The phone number can only consist of numbers with 10 digits'
                    }
                }
            },
            city: {
                validators: {
                    notEmpty: {
                        message: 'City is required'
                    }
                }
            },
            country: {
                validators: {
                    notEmpty: {
                        message: 'country is required'
                    }
                }
            },
            gender: {
                validators: {
                    notEmpty: {
                        message: 'Gender is required'
                    }
                }
            },
            pincode: {
                validators: {
                    notEmpty: {
                        message: 'Pincode number is required'
                    },
                    regexp: {
                        regexp: /^(\+?1-?)?(\([0-9]\d{2}\)|[0-9]\d{2})-?[0-9]\d{2}$/,
                        message: 'Enter valid Pincode number'
                    }
                }
            },
            activate: {
                validators: {
                    notEmpty: {
                        message: 'You have to activate your account'
                    }
                }
            },
            check_active: {
                validators: {
                    notEmpty: {
                        message: 'You have to activate your account'
                    }
                }
            },
            terms: {
                validators: {
                    notEmpty: {
                        message: 'You have to accept the terms and policies'
                    }
                }
            }
        },
        submitHandler: function(form) {
            if ($('#tryitForm').valid()) {
                console.log("now we enable the submit button!");
            }
        }
    });
});