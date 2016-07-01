$('[data-button]').click(function (event) {
  event.preventDefault();
  var $button = $(this),
      data = window.widgetData;

  switch (data.action) {
    case 'back':
      alert('I will go back'); break;
    case 'page':
      alert('I should navigate to page ' + data.page); break;
    case 'url':
      window.open(data.url); break;
    case 'popup':
      alert(data.popupTitle + "\r\n\r\n" + data.popupMessage); break;
  }
});