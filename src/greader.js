(function($) {
    var EntryAction = function(element) {
        this.element = element;
        var entryElmt = this.element.parent(".entry");
        var url = $(entryElmt).find(".entry-title-link").attr('href');
        this.entry = {
            "url" : url
        };
    };

    EntryAction.prototype.addAction = function(action) {
        var that = this;
        var onclick = function(e) {
            var actionFunc = action['fn'];
            actionFunc(that.entry);
        }

        this.element.append($("<span>")
            .addClass("link unselectable")
            .text(action['name'])
            .click(onclick));
    };

    $("#entries").live('DOMNodeInserted', function(e) {
        if (!e.target.className.match(/entry\-actions/))
            return;

        var entryAction = new EntryAction($(e.target));
        entryAction.addAction({
            'name':'Click Through', 
            'fn':function(entry) {
                chrome.extension.sendRequest(entry, function(response) {
                    var matched = /<div class="ldTitle">(.*?)<\/div>/(response.data);
                    var href = ($(matched[1]).attr("href"));
                    alert(href);
                });
            }
        });

    });
})(jQuery);
