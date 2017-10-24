var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};
var customAppsList = Fliplet.Navigate.Apps.list();
var validInputEventName = 'interface-validate';
var defaultTransitionVal = 'slide.left';

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
  selectFiles: [], // To use the restore on File Picker
  selectMultiple: false,
  type: ''
});

var config = files;
if (files.id) {
  config.selectFiles.push({
    appId: files.appId ? files.appId : undefined,
    organizationId: files.organizationId ? files.organizationId : undefined,
    mediaFolderId: files.mediaFolderId ? files.mediaFolderId : undefined,
    parentId: files.parentId ? files.parentId : undefined,
    contentType: files.contentType ? files.contentType : undefined,
    id: files.id ? files.id : undefined
  });
}

// Add custom app actions to the html
var $appAction = $('#appAction');
Object.keys(customAppsList).forEach(function(appName) {
  var app = customAppsList[appName];

  if (app.actions) {
    var $opt = $('<optgroup label="' + app.label + '"></optgroup>');

    Object.keys(app.actions).forEach(function (actionName) {
      var action = app.actions[actionName];
      $opt.append('<option value="' + appName + '.' + actionName + '">' + app.label + ': ' + action.label + '</option>');
    });

    $appAction.append($opt);
  }
});

Object.keys(btnSelector).forEach(function(key, index) {
  var selector = btnSelector[key];

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

$(window).on('resize', Fliplet.Widget.autosize);

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

$appAction.on('change', function onAppActionChange() {
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
  Fliplet.Widget.autosize();
});

$('#query').on('change', function() {
  if ($(this).val() !== '') {
    $('#add-query').trigger('click');
  }
});

$('.document-remove').on('click', function() {
  files.selectedFiles = {};
  files.selectFiles = [];
  files.toRemove = true;
  $('.document .add-document').text('Browse your media library');
  $('.document .info-holder').addClass('hidden');
  $('.document .file-title span').text('');
  Fliplet.Widget.autosize();
});

$('.video-remove').on('click', function() {
  files.selectedFiles = {};
  files.selectFiles = [];
  files.toRemove = true;
  $('.video .add-video').text('Browse your media library');
  $('.video .info-holder').addClass('hidden');
  $('.video .file-title span').text('');
  Fliplet.Widget.autosize();
});

if (widgetInstanceData.action === 'app' && widgetInstanceData.appAction) {
  $appAction.find('option[value="' + widgetInstanceData.appAction + '"]').attr('selected','selected');
}

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

  var appAction = $appAction.val();
  if (data.action === 'app' && appAction) {
    data.appAction = appAction;
  }

  if (data.url && !data.url.match(/^[A-z]+:/i)) {
    data.url = 'http://' + data.url;
  }

  if (['document', 'video'].indexOf(data.action) !== -1) {
    if (files.toRemove) {
      data.files = {};
    } else {
      data.files = _.isEmpty(files.selectedFiles) ? files : files.selectedFiles;
    }
  }

  // cleanup
  ['url', 'query', 'page'].forEach(function (key) {
    if (data[key] === '') {
      delete data[key];
    }
  });

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
      $('#' + fieldId).val(widgetInstanceData[fieldId]).trigger('change');
      Fliplet.Widget.autosize();
    });

    if (widgetInstanceData.action === 'app' && widgetInstanceData.appAction) {
      $appAction.val(widgetInstanceData.appAction);
      $appAction.trigger('change');
    }

    return;
  }

  $('#transition').val(defaultTransitionVal).trigger('change')
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

Fliplet.Widget.autosize();
