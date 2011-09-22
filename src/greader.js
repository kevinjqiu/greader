(function($) {
    $(document).ready(function() {
        var entry_actions = $(".entry-actions");
        console.log(entry_actions);
        entry_actions.append($("<span>").addClass("link unselectable").text("Twitter"));
    });
})(jQuery);
