var $sections = $('section[data-field]');
var widgetInstanceId = $('[data-widget-id]').data('widget-id');
var widgetInstanceData = Fliplet.Widget.getData(widgetInstanceId) || {};

// Update visible section on
$('select[name="action"]').change(function () {
  updateVisibleSections('action', $(this).val());
});

// Update fields values
$('select[name="action"]').val(widgetInstanceData.action).change();

function updateVisibleSections (fieldName, fieldValue) {
  $sections.filter('[data-field="' + fieldName + '"]');
  $sections.each(function () {
    var $section = $(this);
    $section.toggleClass('hidden', $section.data('value') !== fieldValue);
  });
}

// Save data when submitting the form
$('form').submit(function (event) {
  event.preventDefault();

  var data = {};

  [
    'label',
    'style',
    'action',
    'url',
    'page',
    'popupTitle',
    'popupMessage',
    'popupDismissLabel'
  ].forEach(function (field) {
    data[field] = $('[name="' + field + '"]').val();
  });

  Fliplet.Widget.save(data).then(function () {
    Fliplet.Widget.complete();
  });
});

Fliplet.Pages.get().then(function (pages) {
  $select = $('select[name="page"]');
  (pages || []).forEach(function (page) {
    $select.append(
      '<option value="' + page.id + '"' +
      (widgetInstanceData.page === page.id.toString() ? ' selected' : '') +
      '>' + page.title + '</option>'
    );
  });
});