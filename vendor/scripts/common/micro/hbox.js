// Hbox
(function($) {
	var methods, tabTemplate;
	methods = {
		create : function(options) {
			this.addClass('hbox');
			return this;
		},
		addItem : function(options) {
			if(!this.hasClass("hbox")) {
				throw "Not a valid hbox";
			}
			//To check if options is provided
			if(!options) {
				throw "options not provided";
			}
			//To check if the options is of type object
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type, options should be object';
			}
			//To check if itemId is provided
			if(!options.itemId) {
				throw "Provide the item id";
			}
			//To check if itemId already exisiting
			if($('#' + options.itemId).length) {
				throw 'Provide a valid item id. #' + options.itemId + ' already exists';
			}
			//To check if flex is valid
			if(options.flex) {
				if( typeof options.flex !== "number") {
					throw "flex has to be a number"
				}
				if((options.flex + "").indexOf(".") > -1) {
					throw "flex should be whole number"
				}
			}
			var itemTemplate = ['<div id="' + options.itemId + '" ' + //
			((options.itemCls) ? ' class="' + options.itemCls + '{{if flex}} flex{{/if}}"' : '{{if flex}}class="flex"{{/if}}') + //
			'{{if flex}}style = "-webkit-box-flex: {{:flex}} !important;"{{/if}}' + //
			'></div>'].join("");
			$.templates('itemTemplate', itemTemplate);
			this.append($.render.itemTemplate(options));
			//Returning the new added item container
			return this.find('#' + options.itemId);
		}
	};
	$.fn.hbox = function(method) {
		// Method calling logic
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			throw 'Method ' + method + ' does not exist';
		}
	};
})(jQuery);