
(function($) {
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.type === 'fetch_entry') {
                $.get(request.url, function(data) {
                    sendResponse({"data":data});
                });
            } else if (request.type === 'open_tab') {
                chrome.tabs.create({'url':request.url});
                sendResponse({"status":"ok"});
            }
        }
    );

    var twitter_oauth = ChromeExOAuth.initBackgroundPage({
      'request_url': 'https://api.twitter.com/oauth/request_token',
      'authorize_url': 'https://api.twitter.com/oauth/authorize',
      'access_url': 'https://api.twitter.com/oauth/access_token',
      'consumer_key': TwitterSecrets.consumer_key,
      'consumer_secret': TwitterSecrets.consumer_secret,
      'app_name': 'greader-plugin'
    });

    twitter_oauth.authorize(function() {
        alert('authorized');
    });

})(jQuery);
