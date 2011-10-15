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

  var postScriptTemplate =
    'var statusNode = document.getElementById("status");' +
    'var statusValue = "${newStatus}";' +
    'if (!statusNode) {' +
    '  statusNode = document.getElementsByClassName("twitter-anywhere-tweet-box-editor")[0];' +
    '  statusNode.focus();' +
    '  statusNode.value = statusValue;' +
    '  event = document.createEvent("KeyboardEvent");' +
    '  event.initKeyboardEvent("keyup", true, true, window, false, false, false, false, 27, 27);' +
    '  statusNode.dispatchEvent(event);' +
    '} else {' +
    '  statusNode.value = statusValue;' +
    '}';

  function respond(response, isSuccess, obj) {
    var responseData = {};
    responseData.status = isSuccess ? 'SUCCESS' : 'ERROR';
    responseData.obj = obj;
    response(responseData);
  }

  function isTwitterTab(tab) {
    if (tab.url == 'http://twitter.com/' || tab.url == 'https://twitter.com/'
        || tab.url.indexOf('http://twitter.com/?status') == 0
        || tab.url.indexOf('https://twitter.com/?status') == 0) {
      return tab.status != 'loading';
    }
    return false;
  }

  function postToTwitterTab(tab, status, callback) {
    trackEvent('tweetToTab', 'request');
    var details = {};
    details.code = postScriptTemplate.replace(
        "${newStatus}", status.replace(/"/g, '\\"').replace(/\r|\n/g, '\\n'));
    chrome.tabs.executeScript(tab.id, details, function() {
      var updateProperties = {};
      updateProperties.selected = true;
      chrome.tabs.update(tab.id, updateProperties);
      trackEvent('tweetToTab', 'success');
      respond(callback, true);
    });
  }

  function tweetFromApi(status, callback) {
    trackEvent('tweetApi', 'request');
    if (getBooleanOption('authorized')) {
      var params = {
          'oauth_token': getStringOption(DATA_OAUTH_TOKEN),
          'oauth_token_secret': getStringOption(DATA_OAUTH_TOKEN_SECRET),
          'status': status
      };
      AuthHelper.makeApiRequest('https://api.twitter.com/1/statuses/update.json', params,
          function (response) {
        console.log("Update: " + response);
        var success = (response.status == 200);
        trackEvent('tweetApi', success ? 'success' : 'error');
        respond(callback, success, response);
      });
    } else {
      // Should not happen actually.
      authorize(response);
    }
  }

  function openTwitter(status, chromeWindowId, callback) {
    var url = "https://twitter.com/?status=" + encodeURIComponent(status);
    chrome.tabs.getAllInWindow(null, function(tabs) {
      for(var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (isTwitterTab(tab) && getBooleanOption(OPTION_USE_TWITTER_TAB)) {
          postToTwitterTab(tab, status, callback);
          return;
        }
      }
      trackEvent('tweetNewTab', 'request');
      chrome.tabs.create({url: url, windowId: chromeWindowId});
      respond(callback, true);
    });
  }

  function tweetFromTab(title, url, windowId, callback) {
    TwitterUtils.getTitleOrSelection(title, function(statusBody) {
      if (TwitterUtils.needsShorten(statusBody, url)) {
        Shortener.shorten(url, function(shortenResponse) {
          if (shortenResponse.status == 'SUCCESS') {
            openTwitter(TwitterUtils.composeTweet(statusBody, shortenResponse.obj.shortUrl), windowId, callback);
          } else {
            respond(callback, false, shortenResponse.obj);
          }
        });
      } else {
        openTwitter(TwitterUtils.composeTweet(statusBody, url), windowId, callback);
      } 
    });
  }
  
  function authorize(callback) {
    trackEvent('twitterAuthorize', 'request');
    // get request token and open twitter with permissions question.
    AuthHelper.getRequestToken(function(oauthResponse) {
      var success = (oauthResponse.status == 'SUCCESS');
      trackEvent('twitterAuthorize', success ? 'success' : 'error');
      respond(callback, success, oauthResponse.obj);
    });
  }

  function getAccessToken(pin, callback) {
    trackEvent('twitterGetAccessToken', 'request');
    AuthHelper.getAccessToken(pin, function(oauthResponse) {
      var success = (oauthResponse.status == 'SUCCESS');
      trackEvent('twitterGetAccessToken', success ? 'success' : 'error');
      respond(callback, success, oauthResponse.obj);
    });
  }

chrome.extension.onRequest.addListener(
    function(request, sender, callback) {
  if (request.method == 'tweetFromTab') {
    tweetFromTab(request.title, request.url, request.windowId, callback);
  } else if (request.method == 'authorize') {
    authorize(callback);
  } else if (request.method == 'get_access_token') {
    getAccessToken(request.pin, callback);
  } else if (request.method == 'tweetFromApi') {
    tweetFromApi(request.status, callback);
  } else if (request.method == 'shorten') {
    Shortener.shorten(request.url, callback);
  }
});
