/*
 ***************************************************************************************************************************************
 *Tab Plugin
 ***************************************************************************************************************************************
 */
(function($) {
	var methods, tabTemplate;
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
			//Defining general structure for tab
			tabTemplate = [//
			'<ul class="nav nav-tabs">', //
			'</ul>', //
			'<div class="tab-content">', //
			'</div>'//
			].join("");
			//Rendering the tab structure to the target div
			this.html(tabTemplate);
			//Binding the settings object for later usage
			this.data("tabSettings", settings);
			//To maintian chainability
			return this;
		},
		addTab : function(options) {
			//Retriving the settings object
			var settings = this.data("tabSettings");
			//To check to if the tabgroup is created
			if(!settings) {
				throw "Tab has to be created, before adding Tab(s)";
			}
			//To check if options is provied
			if(!options) {
				throw 'No options provided';
			}
			//To check if the options is of type object
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type of options';
			}
			//To check if tabId is provided
			if(!options.tabId) {
				throw 'tabId is not provided';
			}
			//To check if title is provided
			if(!options.title) {
				throw 'title is not provided';
			}
			//To check if the tabId already exists
			if($('#' + options.tabId).length) {
				throw 'Provide a valid id. #' + options.tabId + ' already exists';
			}
			//Defining the structure for the tab body
			var tabBodyTemplate = [//
			'<div class="tab-pane fade {{if cls}}{{:cls}}{{/if}} ' + ((this.find('div.tab-content .tab-pane').length) === 0 ? 'active in ' : '') + (settings.cls || '') + '" id="{{:tabId}}">', //
			//Content
			'</div>'//
			].join("");
			//Defining the structure for the tab header
			var tabHeadTemplate = [//
			'<li class="{{if tabCls}}{{:tabCls}}{{/if}} ' + ((this.find('ul.nav-tabs li').length) === 0 ? 'active ' : '') + (settings.tabCls || '') + '">', //
			'<a href="#{{:tabId}}" data-toggle="tab">{{:title}}</a>', //
			'</li>'//
			].join("");
			//Compiling the tab header template
			$.templates('tabHeadTemplate', tabHeadTemplate);
			//Compiling the tab body template
			$.templates('tabBodyTemplate', tabBodyTemplate);
			//Rendering tab header
			this.find('ul.nav-tabs').append($.render.tabHeadTemplate(options));
			//Rendering tab body
			this.find('div.tab-content').append($.render.tabBodyTemplate(options));
			//Creating a flag, to mark the div as tabGroup
			this.find('#' + options.tabId).data('tabGroup', true);
			//To maintain chainability
			return this.find('#' + options.tabId);
		},
		addTabItem : function(options) {
			if(!this.data("tabGroup")) {
				throw "Not a valid tab Group";
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
			//Creating a div container
			this.append('<div id="' + options.itemId + '" ' + ((options.itemCls) ? ' class="' + options.itemCls + '"' : '') + '></div>');
			//Returning the new added item container
			return this.find('#' + options.itemId);
		}
	};
	$.fn.tabGroup = function(method) {
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