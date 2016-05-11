window.onload = function() {
  var checkboxes = document.getElementsByTagName('input');
  for (i = 0; i < checkboxes.length; ++i) {
    checkboxes[i].addEventListener('click', clickHandler);
  }
};

function clickHandler() {
  if(this.checked) {
    this.nextElementSibling.className = 'checked';
  } else {
    this.nextElementSibling.className = '';
  }
}