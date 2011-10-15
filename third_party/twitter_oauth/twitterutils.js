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

// Depends on: options.js

var TwitterUtils = TwitterUtils || {};

TwitterUtils.URL_SCRIPTS_DISALLOWED =
    'https://chrome.google.com/extensions/|https://chrome.google.com/webstore';

// Maximum length of shortened URL.
TwitterUtils.SHORTENED_URL_MAX_LENGTH = 22;

// Maximum length status text (excluding URL).
TwitterUtils.STATUS_MAX_LENGTH = 140 - TwitterUtils.SHORTENED_URL_MAX_LENGTH;  

TwitterUtils.needsShorten = function(title, url) {
  if (getBooleanOption(OPTION_SHORTEN_LINKS)) {
    return true;
  }
  // Yeah, we better cut title after we shorten or append URL to it.
  if (title.length > TwitterUtils.STATUS_MAX_LENGTH) {
    title = title.substring(0, TwitterUtils.STATUS_MAX_LENGTH - 3) + '...';
  }
  var status = title + ' ' + url;
  return status.length > 140;
};


TwitterUtils.composeTweet = function(body, url, callback) {
  if (body.length > TwitterUtils.STATUS_MAX_LENGTH) {
    body = body.substring(0, TwitterUtils.STATUS_MAX_LENGTH - 3) + '...';
  }
  return body + ' ' + url;
};


TwitterUtils.getTitleOrSelection = function(title, callback) {
  if (getBooleanOption(OPTION_TWEET_SELECTION)) {
    chrome.tabs.getSelected(null, function(tab) {
      if (!tab.url.match('^' + TwitterUtils.URL_SCRIPTS_DISALLOWED)) {
        chrome.tabs.executeScript(tab.id, {file: 'selection.js'}, function() {
          chrome.tabs.sendRequest(tab.id, {'method': 'selection'}, function(data) {
            var selection = data.selection || '';
            selection = selection.trim();
            var statusBody = selection.length > 0 ? selection : title;
            callback(statusBody);
          });
        });
      } else {
        // Can't execute content script here. Just return title.
        callback(title);
      }
    });
  } else {
    callback(title);
  }
};
