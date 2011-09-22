(function($) {
    $("#entries").live('DOMNodeInserted', function(e) {
        if (!e.target.className.match(/entry\-actions/))
            return;

        var target = $(e.target);
        target.append($("<span>").addClass("link unselectable").text("Twitter"));
    });
})(jQuery);
