$('[data-button]').click(function (event) {
  event.preventDefault();
  var $button = $(this),
      $data = $button.closest('[data-action]');

  switch ($data.data('action')) {
    case 'back':
      alert('I will go back'); break;
    case 'page':
      alert('I should navigate to page ' + $data.data('page')); break;
    case 'url':
      window.open($data.data('url')); break;
  }
});