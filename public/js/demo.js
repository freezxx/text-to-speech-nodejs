/**
 * Copyright 2014, 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global $:false */

'use strict';

$(document).ready(function() {

function getToken(callback) {
  $.get('/token', function(data) {
    callback(data);
  });
}

function showError(msg) {
  console.error('Error: ', msg);
  var errorAlert = $('.error-row');
  errorAlert.hide();
  errorAlert.css('background-color', '#d74108');
  errorAlert.css('color', 'white');
  var errorMessage = $('#errorMessage');
  errorMessage.text(msg);
  errorAlert.show();
  $('#errorClose').click(function(e) {
    e.preventDefault();
    errorAlert.hide();
    return false;
  });
}

getToken(function(token) {

  // Show tabs
  $('#nav-tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  var audio = $('.audio').get(0);

  var speechSynthesisOptions = {
    audioElement: audio,
    url: 'https://stream-s.watsonplatform.net/text-to-speech-beta/api/v1',
    api_key: token
  };

  var speechSynthesis = new SpeechSynthesis(speechSynthesisOptions);

  speechSynthesis.onvoiceschanged = function() {
    console.log('voices changed');
    var voices = speechSynthesis.getVoices();
    console.log('voices', voices);
    showVoices(voices, speechSynthesis);
  };
});

function parseVoices(voices) {
  var voiceName = voice.name.substring(6, voice.name.length - 5);
}

function showVoices(voices, speechSynthesis) {

  $.each(voices, function(idx, voice) {
    var voiceName = voice.name.substring(6, voice.name.length - 5);
    var optionText = voice._gender + ' voice: ' + voiceName + ' (' + voice.lang + ')';
      $('#voice')
      .append($('<option>', { value : voice.name })
        .prop('selected', voice.name === 'en-US_MichaelVoice' ? true : false)
        .text(optionText));
      });

    var audio = $('.audio').get(0),
    textArea = $('#textArea');

    var textChanged = false;

    $('#textArea').val(englishText);

    $('#textArea').change(function(){
      textChanged = true;
    });

    $('#voice').change(function(){
      var lang = $(this).val().substring(0, 2);
      if (!textChanged) {
        switch(lang) {
          case 'es':
            $('#textArea').val(spanishText);
            break;
          case 'fr':
            $('#textArea').val(frenchText);
            break;
          case 'de':
            $('#textArea').val(germanText);
            break;
          case 'it':
            $('#textArea').val(italianText);
            break;
          default:
            $('#textArea').val(englishText);
            break;
        }
      }
      if (!textChanged) {
        switch(lang) {
          case 'es':
            $('#ssmlArea').val(spanishSSML);
            break;
          case 'fr':
            $('#ssmlArea').val(frenchSSML);
            break;
          case 'de':
            $('#ssmlArea').val(germanSSML);
            break;
          case 'it':
            $('#ssmlArea').val(italianSSML);
            break;
          default:
            $('#ssmlArea').val(englishSSML);
            break;
        }
      }
    });


    // IE and Safari not supported disabled Speak button
    if ($('body').hasClass('ie') || $('body').hasClass('safari')) {
      $('.speak-button').prop('disabled', true);
    }

    if ($('.speak-button').prop('disabled')) {
      $('.ie-speak .arrow-box').show();
    }

    $('.audio').on('error', function () {
      showError('Error processing the request');
    });

    $('.audio').on('loadeddata', function () {
      $('.result').show();
      $('.error-row').hide();
    });

    $('.download-button').click(function() {
      console.log('click download');
      textArea.focus();
      if (validText(textArea.val())) {
        var utteranceDownloadOptions = {
          text: $('#textArea').val(),
          voice: $('#voice').val(),
          download: true
        };
        // We run this query through the Node.js proxy
        // because Firefox doesn't support initiating the
        // 'save as' file dialog from JavaScript
        // (so Node.js sends the appropriate 'content-disposition' header)
        var sessionPermissions = JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1;
        var downloadURL = '/synthesize?download=true'
          + '&X-WDC-PL-OPT-OUT=' +  sessionPermissions
          + '&voice=' + utteranceDownloadOptions.voice
          + '&text=' + encodeURIComponent(utteranceDownloadOptions.text);
        window.location.href = downloadURL;
      }
    });

    $('.speak-button').click(function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      $('.result').hide();
      audio.pause();

      $('#textArea').focus();
      if (validText(textArea.val())) {

        var utteranceOptions = {
          text: $('#textArea').val(),
          voice: $('#voice').val(),
          sessionPermissions: JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1
        };

        var utterance = new SpeechSynthesisUtterance(utteranceOptions);
        var progressIndicator = $('#progressIndicator');
        speechSynthesis.speak(utterance);

      }
      return false;
    });

    function containsAllLatin1(str) {
      return  /^[A-z\u00C0-\u00ff\s?@¿"'\.,-\/#!$%\^&\*;:{}=\-_`~()]+$/.test(str) ;
    }

    function validText(text) {
      $('.error-row').hide();
      $('.errorMsg').text('');
      $('.latin').hide();

      if ($.trim(text).length === 0) { // empty text
        showError('Please enter the text you would like to synthesize in the text window.');
        return false;
      }

      if (!containsAllLatin1(text)) {
        showError('Language not supported. Please use only ISO 8859 characters');
        return false;
      }
      return true;
    }

}

  (function() {
    console.log('Initializing session permissions handler');
    // Radio buttons
    // Set default to allow
    localStorage.setItem('sessionPermissions', true);
    var sessionPermissionsRadio = $("#sessionPermissionsRadioGroup input[type='radio']");
    sessionPermissionsRadio.click(function(evt) {
      var checkedValue = sessionPermissionsRadio.filter(':checked').val();
      console.log('checkedValue', checkedValue);
      localStorage.setItem('sessionPermissions', checkedValue);
    });
  }())

});