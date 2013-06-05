/*
 ***************************************************************************************************************************************
 *Accordion Plugin
 ***************************************************************************************************************************************
 * =======================================
 * API
 * =======================================
 * Beta
 */
(function($) {
	var methods, accordionTemplate;
	methods = {
		create : function(options) {
			if(options) {
				if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
					throw 'Invalid type of options';
				}
			}
			//Creating a settings object
			var settings = $.extend({
			}, options);
			//Emptying the target
			this.empty();
			//Adding accordion class the target
			this.addClass("accordion");
			//Binding the settings object for later usage
			this.data("accordionSettings", settings);
			//To maintain chainability
			return this;
		},
		addGroup : function(options) {
			//Retriving the settings object
			var settings = this.data("accordionSettings");
			//To check if the accordian is created
			if(!settings) {
				throw "Accordion has to be created, before adding group(s)";
			}
			//To check if options is provided
			if(!options) {
				throw 'No options provided';
			}
			//To check if the options is of type object
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type of options';
			}
			//To check if groupId is given
			if(!options.groupId) {
				throw 'groupId is not provided';
			}
			//To check if title is given
			if(!options.title) {
				throw 'title is not provided';
			}
			//To check if groupId is already used
			if($('#' + options.groupId).length) {
				throw 'Provide a valid id. #' + options.groupId + ' already exists';
			}
			//To check open parameter
			if(options.open) {
				if(Object.prototype.toString.call(options.open).slice(8, -1) !== "Boolean") {
					throw "'open' should be of type boolean";
				}
			}
			//Defining the accordion group template
			accordionTemplate = [//
			'<div class="accordion-group">', //
			'<div class="accordion-heading ' + (settings.headerCls || '') + '{{if headerCls}} {{:headerCls}}{{/if}}">', //
			'<a class="accordion-toggle" data-toggle="collapse" data-parent="#' + this.attr('id') + '" href="#{{:groupId}}">', //
			'{{:title}}', //
			'</a>', //
			'</div>', //
			'<div id="{{:groupId}}" class="accordion-body collapse {{if open==true}}in{{/if}}">', //
			'<div class="accordion-inner ' + (settings.cls || '') + ' {{if cls}}{{:cls}}{{/if}}">', //
			'</div>', //
			'</div>', //
			'</div>'//
			].join("");
			//Compiling the the accordion template
			$.templates('accordionTemplate', accordionTemplate);
			//Renderding the accordion group
			this.append($.render.accordionTemplate(options));
			//Creating a flag, to mark the div as accordionGroup
			this.find('#' + options.groupId).data('accordionGroup', true);
			//To maintain chainability
			return this.find('#' + options.groupId);
		},
		addGroupItem : function(options) {
			if(!this.data('accordionGroup')) {
				throw 'Not a valid accordian group';
			}
			//To check if options is provided
			if(!options) {
				throw 'No options provided';
			}
			//To check if the options is of type object
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type of options';
			}
			//To check if itemId is provided
			if(!options.itemId) {
				throw "Provide the itemId";
			}
			//To check if itemId is already used
			if($('#' + options.itemId).length) {
				throw 'Provide a valid item id. #' + options.itemId + ' already exists';
			}
			//Creating the item container container
			this.find('.accordion-inner').append(//
			'<div ' + //
			'id="' + options.itemId + '" ' + //
			((options.itemCls) ? 'class="' + options.itemCls + '"' : '') + //
			'>' + //
			'</div>');
			//Returning the jquery object of newly create item container
			return this.find('#' + options.itemId);
		}
	};
	$.fn.accordion = function(method) {
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