(function($) {
	var methods = {
		slidein : function() {
			this.addClass('slide in');
			methods.removeClassOnAnimationEnd.apply(this, ['slide in']);
		},
		slideinReverse : function() {
			this.addClass('slide in reverse');
			methods.removeClassOnAnimationEnd.apply(this, ['slide in reverse']);
		},
		slideout : function() {
			this.addClass('slide out');
			methods.removeClassOnAnimationEnd.apply(this, ['slide out']);
		},
		slideoutReverse : function() {
			this.addClass('slide out reverse');
			methods.removeClassOnAnimationEnd.apply(this, ['slide out reverse']);
		},
		fadein : function() {
			this.addClass('fade in');
			methods.removeClassOnAnimationEnd.apply(this, ['fade in']);
		},
		fadeout : function() {
			this.addClass('fade out');
			methods.removeClassOnAnimationEnd.apply(this, ['fade out']);
		},
		removeClassOnAnimationEnd : function(className) {
			var me = this;
			me.bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationEnd', function(event) {
				me.removeClass(className);
				$(me).unbind(event);
			});
		}
	};
	$.fn.animatePage = function(method) {
		methods[method].apply(this, arguments);
	};
})(jQuery);
