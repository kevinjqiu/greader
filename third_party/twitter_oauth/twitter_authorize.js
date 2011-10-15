/*
 * Copyright 2010 Roman Skabichevsky.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Content script that is executed on Twitter site when user clicks "Allow".
 * We get PIN from this screen so that user does not have to enter it manually
 * and use it to get access token from Twitter API.
 */

var MESSAGE_ID = 'twittershare_message';
var authorizeStarted = false;

var setMessage = function(message) {
  var pinEl = document.getElementById('oauth_pin');
  if (!pinEl) {
    return;
  }
  var messageEl = document.getElementById(MESSAGE_ID);
  if (!messageEl) {
    messageEl = document.createElement('H2');
    messageEl.setAttribute('id', MESSAGE_ID);
    pinEl.parentNode.insertBefore(messageEl, null);
  }
  messageEl.innerHTML = message;
};

var getMessage = function() {
  var messageEl = document.getElementById(MESSAGE_ID);
  if (!messageEl) {
    return null;
  }
  return messageEl.innerHTML;
};

var progressEnabled = false;
var doProgressStep = function() {
  if (!progressEnabled) {
    return;
  }
  var message = getMessage();
  if (message == null) {
    return;
  }
  if (/\.\.\.$/.test(message)) {
    setMessage(message.replace(/\.\.\.$/, ''));
  } else {
    setMessage(message + '.');
  }
  setTimeout(doProgressStep, 500);
};

var startProgress = function() {
  progressEnabled = true;
  doProgressStep();
};

var stopProgress = function(message) {
  progressEnabled = false;
};

var authorize = function() {
  var pinEl = document.getElementById('oauth_pin');
  if (!pinEl) {
    return;
  }
  var pin = pinEl.innerHTML.replace(/[^0-9]+/gmi, '');
  if (!pin) {
    return;
  }
  
  authorizeStarted = true;
  var message = 'Authorizing "Twitter share this page" extension';
  setMessage(message);
  startProgress();

  chrome.extension.sendRequest({method: 'get_access_token', 'pin': pin},
      function(response) {
    stopProgress();
    if (response.status == 'SUCCESS') {
      setMessage('Authorized! You can close this page, the extension is ready to use.');
    } else {
      setMessage('Error. Please activate the extension again and enter the PIN manually.');
    }
  });
};

var checkAuthorize = function() {
  authorize();
  if (!authorizeStarted) {
    setTimeout(checkAuthorize, 1000);
  }
};

checkAuthorize();
