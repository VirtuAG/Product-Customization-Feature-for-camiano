function AppicalBar(nameClass) {
    this.class = nameClass;
    this.el = $("." + this.class);
    this.el.find('.js-header-appical--close-btn').click(this.close.bind(this));
}
AppicalBar.prototype.close = function() {
    this.el.addClass("hidden");
    this.el.unbind("click");
};

function initAppicalBar(nameClass) {
    new AppicalBar(nameClass);
}
$(document).ready(function() {
    initAppicalBar('js-appical-container');
});