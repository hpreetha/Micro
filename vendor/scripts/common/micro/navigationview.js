//Navigation View
(function($) {
	var methods = {
		create : function() {
			var settings = {
				views : [],
				currentActive : 0
			};
			this.html("");
			this.data('navigationViewSettings', settings);
		},
		push : function(viewObject, data, binding) {
			var settings = this.data('navigationViewSettings');
			if(!viewObject instanceof Spine.View) {
				throw "Not a valid Spine.View or no View is passed";
			}
			if(!viewObject.id) {
				viewObject.id = 'view-' + (new Date()).getTime();
			}
			viewObject.target = '#' + this.attr('id');
			$.templates('_template', viewObject.content);
			if(!document.getElementById(viewObject.id)) {
				$(viewObject.target).append('<div class="view-container" id="' + viewObject.id + '"></div>');
			}
			if(binding) {
				$.link._template('#' + viewObject.id, data);
			} else {
				$('#' + viewObject.id).html($.render._template(data));
			}
			$.navigatePage(viewObject,"","",true);
			if(settings.views.indexOf(viewObject) == -1) {
				settings.views.push(viewObject)
			}
		},
		pop : function() {
			var settings = this.data('navigationViewSettings'), popedView;
			if(settings.views.length > 1) {
				popedView = settings.views.pop();
				$('#' + popedView.id).bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationEnd', function(event) {
					$('#' + popedView.id).unbind(event);
					$('#' + popedView.id).remove();
				});
				$.navigatePage(settings.views[settings.views.length - 1], 'slideinReverse', 'slideoutReverse',true);
			} else if(settings.views.length == 1) {
				$('#' + settings.views[0].id).remove();
			}
		}
	};
	$.fn.navigationView = function(method) {
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			throw 'Method ' + method + ' does not exist';
		}
	};
})(jQuery);

