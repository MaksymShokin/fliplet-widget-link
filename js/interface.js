$('form').submit(function (event) {
  event.preventDefault();

  var label = $('input[name="label"]').val();
  var style = $('select[name="style"]').val();

  Fliplet.Widget.save({
    label: label,
    style: style
  }).then(function () {
    Fliplet.Widget.complete();
  });
});