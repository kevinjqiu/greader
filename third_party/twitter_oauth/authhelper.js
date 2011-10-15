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
 * Twitter-specific and extension-specific encapsulation of OAuth stuff.
 */

var CONSUMER_KEY = 'IjZx2Qvj5koH5Ddl0gWL3Q';
var CONSUMER_SECRET_KEY = 'MBKeaWZikeOCJG9MkK9psoaka2dHIqomPp3wn1R3G84';

var AuthHelper = {};

AuthHelper.clearAuthData = function() {
  clearOption(DATA_OAUTH_TOKEN);
  clearOption(DATA_OAUTH_TOKEN_SECRET);
  clearOption(DATA_AUTHORIZED);
  clearOption(DATA_PIN_REQUESTED);
};

AuthHelper.makeApiRequest = function(url, params, callback) {
  var accessor = { consumerSecret: CONSUMER_SECRET_KEY
                 , tokenSecret   : params['oauth_token_secret']};
  delete params['oauth_token_secret'];
  var message = { action: url
                , method: 'POST'
                , parameters: [
                    ['oauth_consumer_key', CONSUMER_KEY],
                    ['oauth_signature_method', 'HMAC-SHA1']
                  ]
                };
  for (var i in params) {
    if (params[i] !== undefined) {
      OAuth.setParameter(message, i, params[i]);
    }
  }
  OAuth.completeRequest(message, accessor);

  var xhr = new XMLHttpRequest();
  var parameterMap = OAuth.getParameterMap(message.parameters);
  var postData = '';
  for (var p in parameterMap) {
    if (postData != '') {
      postData += '&';
    }
    postData += p + '=' + encodeURIComponent(parameterMap[p]);
  }
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var responseObj = null;
      try {
        responseObj = JSON.parse(xhr.responseText); 
      } catch (e) {}
      callback({'status': xhr.status, 'obj': responseObj, 'text': xhr.responseText});
    }
  };
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(postData);
};

AuthHelper.getAccessToken = function(pin, callback) {
  clearOption(DATA_AUTHORIZED);
  var oauth_token = getStringOption(DATA_OAUTH_TOKEN);
  var oauth_token_secret = getStringOption(DATA_OAUTH_TOKEN_SECRET);
  if (!oauth_token || !oauth_token_secret) {
    console.log('No valid tokens.');
    callback({'status': 'ERROR', 'obj': {'error': 'No valid tokens.'}});
  }

  AuthHelper.makeApiRequest('https://api.twitter.com/oauth/access_token', 
      {'oauth_token': oauth_token, 
       'oauth_token_secret': oauth_token_secret, 'oauth_verifier': pin},
       function(response) {
    console.log('access token status: ' + response.status + ', text: ' + response.text);
    var params = OAuth.getParameterMap(response.text);
    console.log(params);
    if (response.status == 200 && params['oauth_token'] && params['oauth_token_secret']) {
      setStringOption(DATA_OAUTH_TOKEN, params['oauth_token']);
      setStringOption(DATA_OAUTH_TOKEN_SECRET, params['oauth_token_secret']);
      clearOption(DATA_PIN_REQUESTED);
      setBooleanOption(DATA_AUTHORIZED, true);
      callback({'status': 'SUCCESS', 'obj': response});
    } else {
      callback({'status': 'ERROR', 'obj': response});
    }
  });
};

AuthHelper.getRequestToken = function(callback) {
  AuthHelper.clearAuthData();
  AuthHelper.makeApiRequest('https://api.twitter.com/oauth/request_token', {},
      function(response) {
    console.log(response);
    var params = OAuth.getParameterMap(response.text);
    if (response.status == 200) {
      setStringOption(DATA_OAUTH_TOKEN, params['oauth_token']);
      setStringOption(DATA_OAUTH_TOKEN_SECRET, params['oauth_token_secret']);
      setBooleanOption(DATA_PIN_REQUESTED, true);
      chrome.tabs.create({
          "url": 'https://api.twitter.com/oauth/authorize?oauth_token=' + params['oauth_token'],
          "selected": true
      });
    }
    callback({'status': response.status == 200 ? 'SUCCESS' : 'ERROR', 'obj': response});
  });
};
