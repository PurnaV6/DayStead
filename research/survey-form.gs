// Creates the DayStead survey as a Google Form, with answers saved to a Google Sheet.
// How to use: go to https://script.google.com, click "New project", paste this file,
// click Run, allow access when asked, then open "Execution log" for the two links.
function createDaySteadSurvey() {
  var form = FormApp.create('DayStead: keeping on top of bills, medicines and appointments');
  form.setDescription(
    'A 3-minute survey about how you keep track of bills, medicines and appointments, ' +
    'for yourself or someone you look after. Your answers help us build DayStead, a UK app ' +
    'that puts all three in one place. No sign-up needed.'
  );
  form.setProgressBar(true);

  form.addCheckboxItem()
    .setTitle('Who do you manage bills, medicines or appointments for?')
    .setChoiceValues(['Me', 'A parent', 'A partner', 'A child', 'Someone else I care for'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('In the last 3 months, have you missed or nearly missed a bill payment?')
    .setChoiceValues(['Yes', 'No', 'Not sure'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('In the last 3 months, have you, or someone you care for, missed a medicine dose?')
    .setChoiceValues(['Yes', 'No', 'Not sure', 'No medicines to manage'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('What do you use now to keep track?')
    .setChoiceValues(['Phone calendar', 'Notes app', 'Paper or a diary', 'A bank app', 'A medicine app', 'Nothing in particular'])
    .showOtherOption(true)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('What is the most annoying part of keeping on top of it?')
    .setHelpText('A sentence or two is perfect.');

  form.addTextItem()
    .setTitle('Do you pay for any app that helps with this today? Which one, and how much?');

  form.addMultipleChoiceItem()
    .setTitle('If one app did bills, medicines and appointments together, with a 1 month free trial, which would you choose?')
    .setChoiceValues(['£3.99 a month', '£35.99 a year (save 25%)', 'I would not pay for this'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('Want to try DayStead free for a month? Leave your email.')
    .setHelpText('Optional. We will only use it to invite you to try DayStead, and you can ask us to delete it at any time.')
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());

  form.setConfirmationMessage('Thank you. Your answers really help.');

  var sheet = SpreadsheetApp.create('DayStead survey responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('Share this link: ' + form.getPublishedUrl());
  Logger.log('Edit the form: ' + form.getEditUrl());
  Logger.log('Responses sheet: ' + sheet.getUrl());
}
