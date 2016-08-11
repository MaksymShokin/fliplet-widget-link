var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};

var fields = [
  'linkLabel',
  'action',
  'page',
  'document',
  'transition',
  'url'
];

$('#action').on('change', function onLinkTypeChange() {
  var selectedValue = $(this).val();
  var selectedText = $(this).find("option:selected").text();
  $('.section.show').removeClass('show');
  $('#' + selectedValue + 'Section').addClass('show');
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);

  if ( selectedValue !== 'none' ) {
    Fliplet.Widget.emit('linkTypeSet', { set: true });
  } else {
    Fliplet.Widget.emit('linkTypeSet', { set: false });
  }

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

  // Clean data to store the new saved values
  var data = {};

  // Attach options from widgetInstanceData
  data.options = widgetInstanceData.options;

  // Get and save values to data
  fields.forEach(function (fieldId) {
    data[fieldId] = $('#' + fieldId).val();
  });

  Fliplet.Widget.save(data).then(function () {
    Fliplet.Widget.complete();
  });
});

function initialiseData() {
  if (widgetInstanceData.action) {
    fields.forEach(function (fieldId) {
      $('#' + fieldId).val(widgetInstanceData[fieldId]).change();
    });
  }
}

Fliplet.Pages.get()
  .then(function (pages) {
    var $select = $('#page');
    (pages || []).forEach(function (page) {
      $select.append(
        '<option value="' + page.id + '"' +
        (widgetInstanceData.page === page.id.toString() ? ' selected' : '') +
        '>' + page.title + '</option>'
      );
    });

    return Promise.resolve();
  })
  .then(initialiseData);
