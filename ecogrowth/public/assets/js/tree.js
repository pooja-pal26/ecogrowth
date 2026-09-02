/* 
=========
TREEVIEW 
=========
*/

$.fn.extend({
  treed: function() {
    return this.each(function() {
      //initialize each of the top levels
      var tree = $(this);
      tree.addClass("tree");
      tree.find('li').has("ul").each(function() {
        var branch = $(this); //li with children ul
        branch.prepend("<i class='indicator fa fa-plus-square-o'></i>");
        branch.addClass('branch');
        branch.on('click', function(e) {
          if (this == e.target) {
            var icon = $(this).children('i:first');
            icon.toggleClass("fa-minus-square-o fa-plus-square-o");
            $(this).children().children().toggle();
          }
        })
        branch.children().children().toggle();
      });
      //fire event from the dynamically added icon
      $('.branch .indicator').on('click', function() {
        $(this).closest('li').click();
      });
      //fire event to open branch if the li contains an anchor instead of text
      $('.branch a').on('click', function(e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
      //fire event to open branch if the li contains a button instead of text
      $('.branch button').on('click', function(e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });
  }
});

$('.tree').treed();

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
/*
$('input[name="options"]').on('click', function () {
   $(this).toggleClass('active').siblings().removeClass('active');
});
*/

/* ========================================================================
 * Bootstrap: button.js v3.3.6
 * https://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+

function($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function(element, options) {
    this.$element = $(element)
    this.options = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION = '3.3.6'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function(state) {
    var d = 'disabled'
    var $el = this.$element
    var val = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function() {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function() {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }

  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button = Plugin
  $.fn.button.Constructor = Button

  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function() {
    $.fn.button = old
    return this
  }

  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function(e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]')))

        e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]',

      function(e) {
        $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
      })

}(jQuery);