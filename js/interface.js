var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};

$('#action').on('change', function onLinkTypeChange() {
  var selectedValue = $(this).val();
  var selectedText = $(this).find("option:selected").text();
  $('.section.show').removeClass('show');
  $('#' + selectedValue + 'Section').addClass('show');
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});

$('#page').on('change', function onScreenListChange() {
  var selectedText = $(this).find("option:selected").text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});

$('#transition').on('change', function onTransitionListChange() {
  var selectedText = $(this).find("option:selected").text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  $('form').submit();
});

// Save data when submitting the form
$('form').submit(function (event) {
  event.preventDefault();

  var data = {};

  [
    'action',
    'page',
    'document',
    'transition',
    'url'
  ].forEach(function (fieldId) {
    data[fieldId] = $('#' + fieldId).val();
  });

  Fliplet.Widget.save(data).then(function () {
    Fliplet.Widget.complete();
  });
});

Fliplet.Pages.get().then(function (pages) {
  $select = $('#page');
  (pages || []).forEach(function (page) {
    $select.append(
      '<option value="' + page.id + '"' +
      (widgetInstanceData.page === page.id.toString() ? ' selected' : '') +
      '>' + page.title + '</option>'
    );
  });
});
