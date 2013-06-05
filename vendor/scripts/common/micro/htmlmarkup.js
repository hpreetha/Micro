//HTML Markup Plugin
(function($) {
	$.fn.markup = function(options) {
		//To check if options is provided
		if(!options) {
			throw "Options not provided";
		}
		//To check if the options is of type object
		if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
			throw 'Invalid type, options should be of type Object';
		}
		//Extending options with default values
		var settings = $.extend({
			dataBinding : false
		}, options);
		//To check whether data is provided when dataBinding is true
		if(settings.dataBinding && !settings.data) {
			throw "Cannot perform bind without data.";
		}
		if(settings.tmpl) {
			if($.trim(settings.tmpl).indexOf('#') === 0) {
				if($(settings.tmpl).length) {
					settings.tmpl = $(settings.tmpl).html();
					if(settings.tmpl.length === 0) {
						throw "Template " + settings.tmpl + " is empty";
					}
				} else {
					throw "Template " + settings.tmpl + " not found";
				}
			}
		} else if(settings.url) {
			$.ajax({
				url : settings.url,
				async : false,
				success : function(content, textStatus, jqXHR) {
					if(jqXHR.getResponseHeader('Content-Type') !== 'text/html') {
						throw "Invalid Content Type";
					}
					if(content.length === 0) {
						throw "Content is empty";
					}
					settings.tmpl = content;
				},
				error : function() {
					throw "Unable to load template. Please check the path and name of the template";
				}
			});

		} else {
			throw "Either tmpl or url has to be provided";
		}
		$.templates('markupTemplate', $.convertTemplate(settings.tmpl));
		if(settings.dataBinding) {
			$.link.markupTemplate('#' + this.attr('id'), settings.data);
		} else {
			this.html($.render.markupTemplate(settings.data));
		}
		//To maintain chainability
		return this;
	};
})(jQuery);
