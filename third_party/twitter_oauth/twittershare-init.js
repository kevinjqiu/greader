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

// Enables share button for given tab if suitable.
function enableShareIfNeeded(tab) {
  if (tab.url && /^http|^ftp/.test(tab.url)) {
    chrome.pageAction.show(tab.id);
  } 
}

// Enable share button when a page is loaded.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  enableShareIfNeeded(tab);
});

// Enable share button on extension load for all suitable web pages.
chrome.windows.getAll({populate: true}, function(windows) {
  for (var i in windows) {
    var window = windows[i];
    for (var j in window.tabs) {
      var tab = window.tabs[j];
      enableShareIfNeeded(tab);
    }
  }
});

// Enable Twitter API sharing and always-shortening for users who just installed the app.
if (getBooleanOption(OPTION_FIRST_RUN)) {
  setBooleanOption(OPTION_USE_TWITTER_API, true);
  setBooleanOption(OPTION_SHORTEN_LINKS, true);
  setBooleanOption(OPTION_FIRST_RUN, false);
}
