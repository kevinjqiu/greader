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
            .addClass(action['icon_class'])
            .text(action['caption'])
            .click(onclick));
    };

    var clickThroughAction = {
        'name':'click_through',
        'caption':'Click Through',
        'fn':function(entry) {
            chrome.extension.sendRequest({"type":"fetch_entry", "url":entry.url}, function(response) {
                var matched = /<div class="ldTitle">(.*?)<\/div>/.exec(response.data);
                if (matched) {
                    var href = ($(matched[1]).attr("href"));
                    if (href !== null) {
                        chrome.extension.sendRequest({"type":"open_tab", "url":href}, function(response) {
                            console.info(href + " opened");
                        });
                    }
                } else {
                    console.error("DZone matcher no longer works.");
                }
            });
        }
    };

    var twitterThisAction = {
        'name':'twitter',
        'caption':'Twitter!',
        'fn':function(entry) {
            // start oauth dance
            alert('foo');
        }
    };

    $("#entries").live('DOMNodeInserted', function(e) {
        if (!e.target.className.match(/entry\-actions/))
            return;

        var entryAction = new EntryAction($(e.target));
        if (entryAction.entry.url.match(/^http\:\/\/feeds\.dzone\.com/)) {
            entryAction.addAction(clickThroughAction);
        }
        entryAction.addAction(twitterThisAction);
    });
})(jQuery);
