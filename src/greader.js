(function($) {
    var EntryAction = function(element) {
        this.element = element;
    };

    EntryAction.prototype.addAction = function(name, action) {
        this.element.append($("<span>").addClass("link unselectable").text(name).click(action));
    };

    $("#entries").live('DOMNodeInserted', function(e) {
        if (!e.target.className.match(/entry\-actions/))
            return;

        var target = $(e.target);
        var entryAction = new EntryAction(target);
        entryAction.addAction('Twitter', function() {
            alert('foo');
        });

    });
})(jQuery);
