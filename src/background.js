(function($) {

    var Twitter = {
        "_authorize" : function(callback) {
            this.oauth = this.oauth || ChromeExOAuth.initBackgroundPage({
              'request_url': 'https://api.twitter.com/oauth/request_token',
              'authorize_url': 'https://api.twitter.com/oauth/authorize',
              'access_url': 'https://api.twitter.com/oauth/access_token',
              'consumer_key': TwitterSecrets.consumer_key,
              'consumer_secret': TwitterSecrets.consumer_secret,
              'app_name': 'greader-plugin'
            });

            this.oauth.authorize(callback);
        },
        "update" : function(status, callback) {
            var this_ = this;
            this._authorize(function() {
                this_.oauth.sendSignedRequest("https://api.twitter.com/1/statuses/update.json",
                    callback, {"method":"POST", "parameters":{"status":status}});
            });
        }
    };

    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.type === 'fetch_entry') {
                $.get(request.url, function(data) {
                    sendResponse({"data":data});
                });
            } else if (request.type === 'open_tab') {
                chrome.tabs.create({'url':request.url});
                sendResponse({"status":"ok"});
            } else if (request.type === 'twitter') {
                Twitter.update(request.url, function(resp, xhr) {
                    console.log(resp);
                });
            }
        }
    );
})(jQuery);
