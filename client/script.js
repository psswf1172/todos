var $ = require('jquery');
$(function() {
  $('input').on('click', function() {
    $(this.nextElementSibling).toggleClass('checked');
  });
});
