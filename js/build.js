$('[data-button]').click(function (event) {
  event.preventDefault();
  var $button = $(this),
      id = $button.data('id'),
      data = Fliplet.Widget.getData(id);

  switch (data.action) {
    case 'back':
      return Fliplet.Navigate.back();
    case 'page':
      return Fliplet.Navigate.page(data.page);
    case 'url':
      return Fliplet.Navigate.url(data.url);
  }
});