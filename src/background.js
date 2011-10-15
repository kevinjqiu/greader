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

})(jQuery);
