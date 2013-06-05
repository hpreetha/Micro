/*
 ***************************************************************************************************************************************
 *List Plugin
 ***************************************************************************************************************************************
 * =======================================
 * API
 * =======================================
 * Basic api's structure for list
 *
 * General structure :
 * $(<<target>>).list(<<method name>>, <<method parameter>>);
 *
 * To create a list
 * $(<<target>>).list('create',{
 * 	showDisclosure : [ture/false], //Optional, Default false
 * 	listType : [plain/inset], //Optional, Default : plain
 * 	scroll : [ture/false/horizontal/vertical], //Optional, Default:True
 * 	itemTmpl : template for rendering items in list // *Required
 *	cls : css class for the list// Optional
 * 	itemCls : css class for list items //Optional
 * });
 *
 * To add new items to list
 * $(<<target>>).list('add',<<data[]>>)
 *
 * To refresh the list
 * $(<<target>>).list('refresh',<<data[]>>)
 *
 */
(function($) {
	var methods, itemTemplate, listTemplate, scroller, finalPosition;
	methods = {
		/*
		 * Purpose: To create list
		 * Returns : jQuery object the plugin was invoked on
		 */
		create : function(options) {
			//To check if options is provided
			if(!options) {
				throw "Options not provided";
			}
			//To check if the options is of type object
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type, options should be of type Object';
			}
			var settings = $.extend({
				'showDisclosure' : false,
				'type' : 'plain',
				'scroll' : true,
				'data' : [],
				'fields' : []
			}, options);
			//To check if valid data object is passed
			if(settings.data) {
				if(Object.prototype.toString.call(settings.data).slice(8, -1) !== "Array") {
					throw "Invalid type , data should be of type Array";
				}
			}
			//To check if the target has id, and if it doesn't, an id is generated
			if(!this.attr('id')) {
				this.attr('id', 'list-' + new Date().getTime());
			}
			settings.id = this.attr('id');
			//To check if valid list type is give
			if(settings.type !== 'plain' && settings.type !== 'inset') {
				throw "Invalid list type";
			}
			//To disable scroll if the list type is inset
			if(settings.type === 'inset') {
				settings.scroll = false;
			}
			//To check whether itemTmpl is given
			if(settings.itemTmpl) {
				if($.trim(settings.itemTmpl).indexOf('#') === 0) {
					if($(settings.itemTmpl).length) {
						itemTemplate = $(settings.itemTmpl).html();
						settings.itemTmpl = itemTemplate;
					} else {
						throw "Template " + settings.itemTmpl + " not found";
					}
				} else {
					itemTemplate = settings.itemTmpl;
				}

			} else {
				throw "itemTmpl not given";
			}
			//Adding class to list-container class to the target
			this.addClass('list-container');
			//Defining the basic structure of list
			listTemplate = [//
			'<ul id="{{:id}}-inner" class="list{{if type == "inset"}} inset{{/if}}{{if cls}} {{:cls}}{{/if}}{{if showDisclosure}} list-disclosure{{/if}}">', //
			'</ul>', //
			'</div>'//
			].join("");
			//Compiling the list template
			$.templates('listTemplate', listTemplate);
			//Emptying the target, before rendering the list
			this.empty();
			//Rendering the list structure to target
			this.append($.render.listTemplate(settings));
			if(settings.grouper) {
				if(Object.prototype.toString.call(settings.grouper).slice(8, -1) != "Function") {
					throw "grouper is not a function"
				}
				var group = micro.array.groupBy(settings.data, settings.grouper);
				var groupTemplate = ["{{for ~getFields(#data)}}", //
				'<div class="list-group-header">{{>key}}</div>', //
				"{{for value}}", //
				'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
				settings.itemTmpl, //
				'</li>', //
				"{{/for}}", //
				"{{/for}}"//
				].join("");
				$.templates('groupTemplate', $.convertTemplate(groupTemplate));
				$.link.groupTemplate('#' + settings.id + '-inner', group);
			} else {
				itemTemplate = [//
				'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
				itemTemplate, //
				'</li>'//
				].join("");
				$.templates('itemTemplate', $.convertTemplate(itemTemplate));
				$.link.itemTemplate('#' + settings.id + '-inner', settings.data);
			}
			//To create iScroll object, to make the list scrollable
			if(settings.scroll) {
				if( typeof settings.scroll === "boolean") {
					scroller = new iScroll(this.attr('id'));
				} else if(settings.scroll === "vertical") {
					scroller = new iScroll(this.attr('id'), {
						hScroll : false,
						vScroll : true
					});
				} else if(settings.scroll === "horizontal") {
					scroller = new iScroll(this.attr('id'), {
						hScroll : true,
						vScroll : false
					});
				} else if(Object.prototype.toString.call(settings.scroll).slice(8, -1) === "Object") {
					scroller = new iScroll(this.attr('id'), settings.scroll);
				} else {
					throw "Invalid scroll option";
				}
				if(scroller) {
					//Binding iscroll object to target div, for later usage
					this.data('scroller', scroller);
				}
			}
			//Binding the settings object to target div, for later usage
			this.data('listSettings', settings);
			//To check if the event is already binded
			if(!this.data('listEventBind')) {
				$("#" + settings.id).on("tap", "li", function() {
					//To add selected class to the tapped li item
					$('#' + settings.id + ' li').removeClass('selected');
					$(this).addClass('selected');
					//To trigger custom "itemTap" event , when an list item is tapped
					$("#" + settings.id).trigger('itemTap', $.view(this).data);
				});
				this.data('listEventBind', true);
			}
			if(settings.data.length === 0 && settings.emptyText) {
				this.append('<div class="empty-text">' + settings.emptyText + '</div>');
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose : To refresh the list
		 * Returns : jQuery object the plugin was invoked on
		 */
		refresh : function(data) {
			if(data) {
				//To check if valid data object is passed
				if(Object.prototype.toString.call(data).slice(8, -1) !== "Array") {
					throw "Invalid type , data should be of type Array";
				}
			}
			var settings = this.data('listSettings');
			if(!settings) {
				throw "List has to be created, before refreshing";
			}
			if(this.find('.empty-text').length !== 0) {
				this.find('.empty-text').remove();
			}
			if(data) {
				settings.data = data;
			}
			//Emptying the target, before rendering the list
			$('#' + settings.id + '-inner').empty();
			if(settings.grouper) {
				if(Object.prototype.toString.call(settings.grouper).slice(8, -1) != "Function") {
					throw "grouper is not a function"
				}
				var group = micro.array.groupBy(settings.data, settings.grouper);
				var groupTemplate = ["{{for ~getFields(#data)}}", //
				'<div class="list-group-header">{{>key}}</div>', //
				"{{for value}}", //
				'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
				settings.itemTmpl, //
				'</li>', //
				"{{/for}}", //
				"{{/for}}"//
				].join("");
				$.templates('groupTemplate', $.convertTemplate(groupTemplate));
				$.link.groupTemplate('#' + settings.id + '-inner', group);
			} else {
				itemTemplate = [//
				'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
				settings.itemTmpl, //
				'</li>'//
				].join("");
				$.templates('itemTemplate', $.convertTemplate(itemTemplate));
				$.link.itemTemplate('#' + settings.id + '-inner', settings.data);
			}
			if(settings.data.length === 0 && settings.emptyText) {
				this.append('<div class="empty-text">' + settings.emptyText + '</div>');
			}
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
				this.data('scroller').scrollTo(0, 0, 0, 0);
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose: To add items to existing list
		 * Returns : jQuery object the plugin was invoked on
		 */
		add : function(data) {
			if(data) {
				if(Object.prototype.toString.call(data).slice(8, -1) !== "Array") {
					throw "Invalid type , data should be of type Array";
				}
			} else {
				throw "data not provided";
			}
			var settings = this.data('listSettings');
			if(!settings) {
				throw "List has to be created, before adding item";
			}
			if(this.find('.empty-text').length !== 0) {
				this.find('.empty-text').remove();
			}
			finalPosition = $(this).find('ul').height();
			itemTemplate = [//
			'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
			settings.itemTmpl, //
			'</li>'//
			].join("");
			$.templates('itemTemplate', $.convertTemplate(itemTemplate));
			$.observable(settings.data).insert(settings.data.length, data);
			//---
			if((finalPosition + this.height()) > (this.find('ul').height())) {
				finalPosition = finalPosition - ((finalPosition + this.height()) - (this.find('ul').height()));
			}
			//---
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
				if(this.height() < this.find('ul').height()) {
					this.data('scroller').scrollTo(0, -finalPosition, 0, 0);
				}
				//this.data('scroller')
			}
			if(settings.data.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose: To remove an item from the list
		 * Returns : jQuery object the plugin was invoked on
		 */
		remove : function(itemData) {
			var settings = this.data('listSettings');
			var deleteIndex = -1;
			if(!settings) {
				throw "Not a valid list";
			}
			if(Object.prototype.toString.call(itemData).slice(8, -1) == "Object") {
				for(var i = 0; i < settings.data.length; i++) {
					if(settings.data[i] === itemData) {
						deleteIndex = i;
					}
				}
			}
			if(Object.prototype.toString.call(itemData).slice(8, -1) == "Number") {
				deleteIndex = itemData;
			}
			$.observable(settings.data).remove(deleteIndex);
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.data.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			}
		},
		/*
		 * Purpose: To sort item/s of the list
		 * Returns : jQuery object the plugin was invoked on
		 */

		sort : function(sortField) {
			var settings = this.data('listSettings'), sortFn, fieldName, fieldType, sortOrder, _model;
			if(!settings) {
				throw "Not a valid list";
			}
			settings.sortedData = micro.array.clone(settings.data);
			if(settings.sortedData.length) {
				if(settings.sortedData[0] instanceof Spine.Model) {
					_model = settings.sortedData[0].constructor;
				}
			}
			if(sortField) {
				if(Object.prototype.toString.call(sortField).slice(8, -1) == "Function") {
					sortFn = sortField;
					settings.sortedData.sort(sortFn);
				} else if(Object.prototype.toString.call(sortField).slice(8, -1) == "String") {
					fieldName = sortField;
					if(_model) {
						fieldType = settings.sortedData[0].constructor.getAttributeType(fieldName);
					}
					micro.array.sort(settings.sortedData, fieldName, fieldType || "String");
				} else if(Object.prototype.toString.call(sortField).slice(8, -1) == "Object") {
					var fieldName = sortField.field;
					var sortOrder = sortField.order;
					if(fieldName) {
						if(_model) {
							fieldType = settings.sortedData[0].constructor.getAttributeType(fieldName);
						}
						micro.array.sort(settings.sortedData, fieldName, fieldType || "String", sortOrder);
					}
				}
			} else {
				settings.sortedData.sort();
			}
			//Template definition for list item
			var itemTemplate = [//
			'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
			settings.itemTmpl, //
			'</li>'//
			].join("");
			$.templates('itemTemplate', $.convertTemplate(itemTemplate));
			$.link.itemTemplate('#' + settings.id + '-inner', settings.sortedData);
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			//To maintain chainability
			return this;
		},

		/*
		 * Purpose: To filter item/s of the list
		 * Returns : jQuery object the plugin was invoked on
		 */
		filter : function(filterFn) {
			var settings = this.data('listSettings');
			if(!settings) {
				throw "Not a valid list";
			}
			if(filterFn) {
				if(Object.prototype.toString.call(filterFn).slice(8, -1) == "Function") {
					settings.filteredData = settings.data.filter(filterFn);
				}
			}
			var itemTemplate = [//
			'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
			settings.itemTmpl, //
			'</li>'//
			].join("");
			$.templates('itemTemplate', $.convertTemplate(itemTemplate));
			$.link.itemTemplate('#' + settings.id + '-inner', settings.filteredData);
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.filteredData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			} else {
				this.find(".empty-text").remove();
			}

			//To maintain chainability
			return this;
		},
		/*
		 * Purpose: To group item/s of the list
		 * Returns : jQuery object the plugin was invoked on
		 */
		groupBy : function(grouperFn) {
			var settings = this.data('listSettings'), group = {}, groupTemplate;
			if(!settings) {
				throw "Not a valid list";
			}
			if(grouperFn) {
				if(Object.prototype.toString.call(grouperFn).slice(8, -1) != "Function") {
					throw "Not a valid function"
				}
			} else {
				throw "grouper function not given"
			}
			group = micro.array.groupBy(settings.data, grouperFn);
			groupTemplate = ["{{for ~getFields(#data)}}", //
			'<div class="list-group-header">{{>key}}</div>', //
			"{{for value}}", //
			'<li' + ((settings.itemCls) ? " class=" + settings.itemCls : " ") + '>', //
			settings.itemTmpl, //
			'</li>', //
			"{{/for}}", //
			"{{/for}}"//
			].join("");
			$.templates('groupTemplate', $.convertTemplate(groupTemplate));
			$.link.groupTemplate('#' + settings.id + '-inner', group);
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			// //To maintain chainability
			return this;

		},
		/*
		 * Purpose : To get the binded scroller object
		 * Returns : iScroll object
		 */
		scroller : function() {
			return this.data('scroller');
		}
	};
	$.fn.list = function(method) {
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
