var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};
var validInputEventName = 'interface-validate';

var fields = [
  'linkLabel',
  'action',
  'page',
  'document',
  'transition',
  'url',
  'query'
];

var BTN_SELECTOR = {
  BTN_SELECT_DOCUMENT: '.add-document',
  BTN_SELECT_VIDEO: '.add-video'
};

var $FILEPICKER;
var providerInstance;

var currentMode = null;

var CONFIGS = widgetInstanceData.CONFIGS || {
  'add-document': {
      selectFiles: [],
      selectMultiple: false,
      type: 'document',
      fileExtension: ['PDF', 'DOC', 'DOCX', 'KEY', 'PPT', 'ODT', 'XLS', 'XLSX']
  },
  'add-video': {
      selectFiles: [],
      selectMultiple: false,
      type: 'video',
      fileExtension: ['MOV', 'MPEG4', 'MP4', 'AVI', 'WMV', 'FLV', '3GPP', 'WebM']
  }
};

Object.keys(BTN_SELECTOR).forEach(function (key) {
  var selector = BTN_SELECTOR[key];
  var mode = selector.slice(1);
  var config = CONFIGS[mode];

  if (config.selectFiles.length > 0){
    var $el = $(selector).parents('.file-picker-select').find('.result');
    $el.text(JSON.stringify(config.selectFiles, null, 4));
    $el.show();
  }

  $(selector).on('click', function (e) {
    e.preventDefault();
    Fliplet.Widget.autosize();

    config.selector = '#file-picker';

    Fliplet.Widget.toggleSaveButton(config.selectFiles.length > 0);
    providerInstance = Fliplet.Widget.open('com.fliplet.file-picker', {
      data: config,
      onEvent: function (e, data) {
        switch (e) {
          case 'widget-rendered':
            break;
          case 'widget-set-info':
            Fliplet.Widget.toggleSaveButton(!!data.length);
            var msg = data.length ? data.length + ' files selected' : 'no selected files';
            Fliplet.Widget.info(msg);
            break;
          default:
            break;
        }
      }
    });

    providerInstance.then(function(data) {
      Fliplet.Studio.emit('widget-save-label-update', {  text : 'Save & Close'   });
      Fliplet.Widget.info('');
      Fliplet.Widget.toggleCancelButton(true);
      Fliplet.Widget.toggleSaveButton(true);
      CONFIGS[mode].selectFiles = data.data;
      providerInstance = null;
    });
  });
});

function beginAnimationFilePicker() {
  Fliplet.Studio.emit('widget-save-label-update', {  text : 'Select'   });
  Fliplet.Widget.toggleCancelButton(false);
  var animProgress = 100;
  var animInterval;
  $FILEPICKER = $('iframe');

  $FILEPICKER.show();

  animInterval = setInterval(function () {
    animProgress -= 2;
    $FILEPICKER.css({left: animProgress + '%'});
    if (animProgress == 0) {
      clearInterval(animInterval);
    }
  }, 5);
}

window.addEventListener('message', function (event) {
  if (event.data === 'cancel-button-pressed'){
    if (!providerInstance) return;
    providerInstance.close();
    providerInstance = null;
    Fliplet.Studio.emit('widget-save-label-update', {  text : 'Save & Close'   });
    Fliplet.Widget.toggleCancelButton(true);
    Fliplet.Widget.toggleSaveButton(true);
    Fliplet.Widget.info('');
  }
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

Fliplet.Widget.onSaveRequest(function () {
  if (providerInstance) {
    return providerInstance.forwardSaveRequest();
  }

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

  if (data.url && !data.url.match(/^[A-z]+:/i)) {
    data.url = 'http://' + data.url;
  }

  data.CONFIGS = CONFIGS;

  // TODO: validate query
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
