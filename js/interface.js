var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};
var validInputEventName = 'interface-validate';

// Clean data to store the new saved values
var data = {};

var fields = [
  'linkLabel',
  'action',
  'page',
  'document',
  'transition',
  'url',
  'query'
];

var imageProvider = Fliplet.Widget.open('com.fliplet.image-manager', {
  // If provided, the iframe will be appended here,
  // otherwise will be displayed as a full-size iframe overlay
  data: widgetInstanceData.pinchToZoom,
  selector: "#pinchToZoomSection",
  single: true,
  type: 'image',
  // Events fired from the provider
  onEvent: function (event, data) {}
});

imageProvider.then(function (result) {
  data.pinchToZoom = result.data;
  Fliplet.Widget.save(data)
    .then(function () {
      Fliplet.Widget.complete();
    });
});



Fliplet.Widget.emit(validInputEventName, {
  isValid: false
});

$('#action').on('change', function onLinkTypeChange() {
  var selectedValue = $(this).val();
  var selectedText = $(this).find("option:selected").text();
  $('.section.show').removeClass('show');
  $('#' + selectedValue + 'Section').addClass('show');
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);

  Fliplet.Widget.emit(validInputEventName, {
    isValid: selectedValue !== 'none'
  });

  // Tells the parent widget this provider has changed its interface height
  Fliplet.Widget.autosize();
});

$('#page').on('change', function onScreenListChange() {
  var selectedText = $(this).find("option:selected").text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});

$('#transition').on('change', function onTransitionListChange() {
  var selectedText = $(this).find("option:selected").text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});

$('#add-query').on('click', function() {
  $(this).addClass('hidden');
  $(this).parents('#screen-form').addClass('show-query');
});

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  $('form').submit();
});

// Save data when submitting the form
$('form').submit(function (event) {
  event.preventDefault();

  // Attach options from widgetInstanceData
  data.options = widgetInstanceData.options;

  // Get and save values to data
  fields.forEach(function (fieldId) {
    data[fieldId] = $('#' + fieldId).val();
  });

  // Fix url
  if (data.url && !data.url.match(/^[A-z]+:/i)) {
    data.url = 'http://' + data.url;
  }

  // Get data from image provider
  imageProvider.forwardSaveRequest();

  // TODO: validate query
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

Fliplet.Navigator.onReady().then(function () {
  Fliplet.Widget.autosize();
});
