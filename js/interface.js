var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};
var validInputEventName = 'interface-validate';

var fields = [
  'linkLabel',
  'action',
  'page',
  'transition',
  'url',
  'query'
];

var btnSelector = {
  document: '.add-document',
  video: '.add-video'
};

var providerInstance;
var currentMode = null;
var files = $.extend(widgetInstanceData.files, {
  selectedFiles: {},
  selectMultiple: false,
  type: ''
});

Object.keys(btnSelector).forEach(function(key, index) {
  var selector = btnSelector[key];
  var config = files;

  $(selector).on('click', function(e) {
    e.preventDefault();

    if ($(this).hasClass('add-document')) {
      config.type = 'document'
    } else if ($(this).hasClass('add-video')) {
      config.type = 'video'
    }

    Fliplet.Widget.toggleSaveButton(Object.keys(config.selectedFiles).length > 0);

    Fliplet.Studio.emit('widget-save-label-update', {
      text: 'Save'
    });

    providerInstance = Fliplet.Widget.open('com.fliplet.file-picker', {
      data: config,
      onEvent: function(e, data) {
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
      Fliplet.Studio.emit('widget-save-label-update', {
        text: 'Save & Close'
      });
      Fliplet.Widget.info('');
      Fliplet.Widget.toggleCancelButton(true);
      Fliplet.Widget.toggleSaveButton(true);
      files.selectedFiles = data.data.length === 1 ? data.data[0] : data.data;
      providerInstance = null;
      if (key === 'document') {
        $('.document .add-document').text('Replace document');
        $('.document .info-holder').removeClass('hidden');
        $('.document .file-title span').text(files.selectedFiles.name);
        Fliplet.Widget.autosize();
      } else if (key === 'video') {
        $('.video .add-video').text('Replace video');
        $('.video .info-holder').removeClass('hidden');
        $('.video .file-title span').text(files.selectedFiles.name);
        Fliplet.Widget.autosize();
      }
    });
  });
});

window.addEventListener('message', function(event) {
  if (event.data === 'cancel-button-pressed') {
    if (!providerInstance) return;
    providerInstance.close();
    providerInstance = null;
    Fliplet.Studio.emit('widget-save-label-update', {
      text: 'Save & Close'
    });
    Fliplet.Widget.toggleCancelButton(true);
    Fliplet.Widget.toggleSaveButton(true);
    Fliplet.Widget.info('');
  }
});

/*Fliplet.Widget.emit(validInputEventName, {
  isValid: false
});*/

$('#action').on('change', function onLinkTypeChange() {
  var selectedValue = $(this).val();
  var selectedText = $(this).find("option:selected").text();
  $('.section.show').removeClass('show');
  $('#' + selectedValue + 'Section').addClass('show');
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);

  /*Fliplet.Widget.emit(validInputEventName, {
    isValid: selectedValue !== 'none'
  });*/

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

$('.document-remove').on('click', function() {
  files.selectedFiles = {};
  $('.document .add-document').text('Browse your media library');
  $('.document .info-holder').addClass('hidden');
  $('.document .file-title span').text('');
  Fliplet.Widget.autosize();
});

$('.video-remove').on('click', function() {
  files.selectedFiles = {};
  $('.video .add-video').text('Browse your media library');
  $('.video .info-holder').addClass('hidden');
  $('.video .file-title span').text('');
  Fliplet.Widget.autosize();
});

Fliplet.Widget.onSaveRequest(function() {
  if (providerInstance) {
    return providerInstance.forwardSaveRequest();
  }

  save(true);
});

// Save data when submitting the form
function save(notifyComplete) {
  // Clean data to store the new saved values
  var data = {};

  // Attach options from widgetInstanceData
  data.options = widgetInstanceData.options;

  // Get and save values to data
  fields.forEach(function(fieldId) {
    data[fieldId] = $('#' + fieldId).val();
  });

  if (data.url && !data.url.match(/^[A-z]+:/i)) {
    data.url = 'http://' + data.url;
  }

  data.files = files.name ? files : files.selectedFiles;

  if (notifyComplete) {
    // TODO: validate query
    Fliplet.Widget.save(data).then(function() {
      Fliplet.Widget.complete();
    });
  } else {
    Fliplet.Widget.save(data).then(function() {
      Fliplet.Studio.emit('reload-widget-instance', widgetInstanceId);
    });
  }
}

function initialiseData() {
  if (widgetInstanceData.action) {
    fields.forEach(function(fieldId) {
      $('#' + fieldId).val(widgetInstanceData[fieldId]).change();
    });
  }
}

Fliplet.Pages.get()
  .then(function(pages) {
    var $select = $('#page');
    (pages || []).forEach(function(page) {
      $select.append(
        '<option value="' + page.id + '"' +
        (widgetInstanceData.page === page.id.toString() ? ' selected' : '') +
        '>' + page.title + '</option>'
      );
    });

    return Promise.resolve();
  })
  .then(initialiseData);
