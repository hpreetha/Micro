/*
 ***************************************************************************************************************************************
 * Grid Plugin
 ***************************************************************************************************************************************
 * =======================================
 * API
 * =======================================
 * General structure :
 * $(<<target>>).grid(<<method name>>, <<method parameter>>);
 *
 * To create a grid
 * $(<<target>>).grid('create',{
 * 	rowData : row data for grid // *Required
 *  rowTmpl : template for rendering grid rows // *Required
 *  headerData : Data for grid header //Optional
 *  headerTmpl : template for rendering grid header // *Required
 *	headerCls : css class for the list // Optional
 * 	rowCls : css class for list items //Optional
 * 	scroll : [ture/false/horizontal/vertical], //Optional, Default:true
 * });
 *
 * To add new rows to grid
 * $(<<target>>).grid('add',<<data[]>>)
 *
 * To refresh the grid
 * $(<<target>>).grid('refresh',<<data[]>>)
 *
 */
(function($) {
	var methods, headerTemplate, rowTemplate, gridTemplate, scroller, finalPosition;
	methods = {
		/*
		 * Purpose: To create grid
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
				'scroll' : true,
				'rowData' : [],
				'fields' : {},
				'sort' :false
			}, options);
			//To check if rowData is valid
			if(settings.rowData) {
				if(Object.prototype.toString.call(settings.rowData).slice(8, -1) !== "Array") {
					throw "Invalid type, rowData should be of type Array";
				}
			}
			//To check if headerData is valid
			if(settings.headerData) {
				if(Object.prototype.toString.call(settings.headerData).slice(8, -1) !== "Array") {
					throw "Invalid type, headerData should be of type Array";
				}
			}
			//To check if the target has id, and if it doesn't, an id is generated
			if(!this.attr('id')) {
				this.attr('id', 'grid-' + new Date().getTime());
			}
			settings.id = this.attr('id');
			//To check if both rowTmpl and headerTmpl is given
			if(settings.rowTmpl && settings.headerTmpl) {
				//To check whether given headerTmpl is valid
				if($.trim(settings.headerTmpl).indexOf('#') === 0) {
					if($(settings.headerTmpl).length) {
						headerTemplate = $(settings.headerTmpl).html();
						settings.headerTmpl = headerTemplate;
					} else {
						throw "Template " + settings.headerTmpl + " not found";
					}
				} else {
					headerTemplate = settings.headerTmpl;
				}
				//To check whether given rowTmpl is valid
				if($.trim(settings.rowTmpl).indexOf('#') === 0) {
					if($(settings.rowTmpl).length) {
						rowTemplate = $(settings.rowTmpl).html();
						settings.rowTmpl = rowTemplate;
					} else {
						throw "Template " + settings.rowTmpl + " not found";
					}
				} else {
					rowTemplate = settings.rowTmpl;
				}
			} else {
				throw 'Template(s) not given';
			}
			//Defining the basic structure for gridTemplate
			gridTemplate = [//
			'<div class="grid-header {{if headerCls}}{{:headerCls}}{{/if}}" >', //
			'{{for headerData}}', //
			headerTemplate, //
			'{{/for}}', //
			'</div>', //grid-header//
			'<div class="grid-body" id="{{:id}}-body">', //
			'<div class="grid-wrapper" id="{{:id}}-wrapper">', //
			'</div>', //grid-wrapper//
			'</div>' //grid-body//
			].join("");
			this.addClass('grid');
			//Compiling the grid template
			$.templates('gridTemplate', $.sortTemplate($.convertTemplate(gridTemplate)));
			//Emptying the target, before rendering the grid
			this.empty();
			//Rendering the grid to target
			this.append($.render.gridTemplate(settings));
			if(settings.grouper) {
				if(Object.prototype.toString.call(settings.grouper).slice(8, -1) != "Function") {
					throw "Not a valid function"
				}
				var group = micro.array.groupBy(settings.rowData, settings.grouper);
				var groupTemplate = ["{{for ~getFields(#data)}}", //
				'<div class="grid-group-header">{{>key}}</div>', //
				"{{for value}}", //
				'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
				settings.rowTmpl, //
				'</div>', //
				"{{/for}}", //
				"{{/for}}"//
				].join("");
				$.templates('groupTemplate', $.sortTemplate($.convertTemplate(groupTemplate)));
				$.link.groupTemplate('#' + settings.id + '-wrapper', group);
			} else {
				rowTemplate = [//
				'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
				rowTemplate, //
				'</div>' //
				].join("");
				$.templates('rowTemplate', $.sortTemplate($.convertTemplate(rowTemplate)));
				$.link.rowTemplate('#' + settings.id + '-wrapper', settings.rowData);
			}
			if(settings.scroll) {
				console.log(settings.id + '-body');
				if( typeof settings.scroll === "boolean") {
					// $('#'+settings.id + '-body').scrollable();
				 	// sly = new Sly($('#'+settings.id + '-body'),{
				 		// scrollBar: $('#'+settings.id + '-body'), // Selector or DOM element for scrollbar container.
						// dragHandle:    0,    // Whether the scrollbar handle should be draggable.
						// dynamicHandle: 0,    // Scrollbar handle represents the ratio between hidden and visible content.
						// minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
						// clickBar:      0,    // Enable navigation by clicking on scrollbar.
						// syncSpeed:     0.5,  
				 	// });   
					scroller = new iScroll(settings.id + '-body');
				} else if(settings.scroll === "vertical") {
						// $('#'+settings.id + '-body').scrollable();
					// sly = new Sly($('#'+settings.id + '-body'), {
						// vertical : 0,
						// scrollBar: $('#'+settings.id + '-body'), // Selector or DOM element for scrollbar container.
						// dragHandle:    0,    // Whether the scrollbar handle should be draggable.
						// dynamicHandle: 0,    // Scrollbar handle represents the ratio between hidden and visible content.
						// minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
						// clickBar:      0,    // Enable navigation by clicking on scrollbar.
						// syncSpeed:     0.5,  // Handle => SLIDEE synchronization speed, where: 1 = instant, 0 = infinite.
					// });
					scroller = new iScroll(settings.id + '-body', {
						hScroll : false,
						vScroll : true
					});
				} else if(settings.scroll === "horizontal") {
						// $('#'+settings.id + '-body').scrollable();
					// sly = new Sly($('#'+settings.id + '-body'), {
						// horizontal : 0,
						// scrollBar: $('#'+settings.id + '-body'), // Selector or DOM element for scrollbar container.
						// dragHandle:    0,    // Whether the scrollbar handle should be draggable.
						// dynamicHandle: 0,    // Scrollbar handle represents the ratio between hidden and visible content.
						// minHandleSize: 50,   // Minimal height or width (depends on sly direction) of a handle in pixels.
						// clickBar:      0,    // Enable navigation by clicking on scrollbar.
						// syncSpeed:     0.5,  
					// });

					scroller = new iScroll(settings.id + '-body', {
						hScroll : true,
						vScroll : false
					});
				} else if(Object.prototype.toString.call(settings.scroll).slice(8, -1) === "Object") {
						// $('#'+settings.id + '-body').scrollable();
					//sly = new Sly($('#'+settings.id + '-body'), settings.scroll);
					scroller = new iScroll(settings.id + '-body', settings.scroll);
				} else {
					throw "Invalid scroll option";
				}
				if(scroller) {
					//Binding iscroll object to target div, for later usage
					this.data('scroller', scroller);
				}
			}
			//Binding the settings object to target div, for later usage
			this.data('gridSettings', settings);
			//To check if the event is already binded
			if(!this.data('gridEventBind')) {
				this.on("tap", ".grid-row", function() {
					//To add selected class to the tapped grid row
					$('#' + settings.id + ' .grid-row').removeClass('selected');
					$(this).addClass('selected');
					//To trigger custom "rowTap" event , when an grid row is tapped
					$("#" + settings.id).trigger('rowTap', $.view(this).data);
				});
				this.data('gridEventBind', true);
			}
			if(settings.sort) {
				if( typeof settings.sort === "boolean") {
					this.find('.grid-header > div').on("tap", function(event) {
						var target, clickedIndex, rowTarget, rowElement, fieldName, grid;
						grid = $(this).closest('.grid');
						target = $(event.target);
						clickedIndex = grid.find('.grid-header').children().index(target);
						rowTarget = grid.find('.grid-row')[0];
						rowElement = $(rowTarget).children()[clickedIndex];
						if($(rowElement).attr('data-attribute')) {
							fieldName = $(rowElement).attr('data-attribute');
						} else {
							fieldName = $(rowElement).find('[data-attribute]').attr('data-attribute');
						}
						var sortOrder = $(this).hasClass("asc") ? "desc" : "asc";
						if(fieldName) {
							var sortField = {};
							sortField.field = fieldName;
							sortField.order = sortOrder;
							$(this).closest('.grid').grid('sort', sortField);
							$(this).removeClass(sortOrder == "asc" ? "desc" : "asc");
							$(this).addClass(sortOrder);
						}
					});
				} else {
					throw "Invalid sort option";
				}
			}
			if(settings.rowData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose: To add new items to existing grid
		 * Returns : jQuery object the plugin was invoked on
		 */
		add : function(rowData) {
			if(!rowData) {
				throw "rowData not provided";
			}
			//To check if rowData is valid
			if(rowData) {
				if(Object.prototype.toString.call(rowData).slice(8, -1) !== "Array") {
					throw "Invalid type, rowData should be of type Array";
				}
			}
			var settings = this.data('gridSettings');
			if(!settings) {
				throw "Grid has to be created, before adding item";
			}
			rowTemplate = [//
			'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
			settings.rowTmpl, //
			'</div>' //
			].join("");
			finalPosition = this.find('.grid-wrapper').height();
			//Compiling the row template
			$.templates('rowTemplate', $.sortTemplate($.convertTemplate(rowTemplate)));
			$.observable(settings.rowData).insert(settings.rowData.length, rowData);
			//---
			if((finalPosition + this.find('.grid-body').height()) > (this.find('.grid-wrapper').height())) {
				finalPosition = finalPosition - ((finalPosition + this.find('.grid-body').height()) - (this.find('.grid-wrapper').height()));
			}
			//---
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
				if(this.find('.grid-body').height() < this.find('.grid-wrapper').height()) {
					this.data('scroller').scrollTo(0, -finalPosition, 0, 0);
				}
			}
			if(settings.rowData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			} else {
				this.find(".empty-text").remove();
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose : To refresh the grid
		 * Returns : jQuery object the plugin was invoked on
		 */
		refresh : function(rowData) {
			//To check if rowData is valid
			if(rowData) {
				if(Object.prototype.toString.call(rowData).slice(8, -1) !== "Array") {
					throw "Invalid type, rowData should be of type Array";
				}
			}
			var settings = this.data('gridSettings');
			if(!settings) {
				throw "Grid has to be created, before refreshing";
			}
			if(rowData) {
				settings.rowData = rowData;
			}
			if(settings.grouper) {
				if(Object.prototype.toString.call(settings.grouper).slice(8, -1) != "Function") {
					throw "Not a valid function"
				}
				var group = micro.array.groupBy(settings.rowData, settings.grouper);
				var groupTemplate = ["{{for ~getFields(#data)}}", //
				'<div class="grid-group-header">{{>key}}</div>', //
				"{{for value}}", //
				'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
				settings.rowTmpl, //
				'</div>', //
				"{{/for}}", //
				"{{/for}}"//
				].join("");
				$.templates('groupTemplate', $.sortTemplate($.convertTemplate(groupTemplate)));
				$.link.groupTemplate('#' + settings.id + '-wrapper', group);
			} else {
				rowTemplate = [//
				'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
				settings.rowTmpl, //
				'</div>' //
				].join("");
				//Compiling the row template
				$.templates('rowTemplate', $.sortTemplate($.convertTemplate(rowTemplate)));
				$.link.rowTemplate('#' + settings.id + '-wrapper', settings.rowData);
			}
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.rowData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			} else {
				this.find(".empty-text").remove();
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose : To sort the rows of the grid.
		 * Returns : jQuery object the plugin was invoked on
		 */
		sort : function(sortField) {
			var settings = this.data('gridSettings'), sortFn, fieldName, fieldType, sortOrder, _model;
			if(!settings) {
				throw "Not a valid grid";
			}
			settings.sortedData = micro.array.clone(settings.rowData);
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
					micro.array.sort(settings.sortedData, fieldType || "String", fieldType);
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
			var rowTemplate = [//
			'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
			settings.rowTmpl, //
			'</div>' //
			].join("");
			//Compiling the row template
			$.templates('rowTemplate', $.sortTemplate($.convertTemplate(rowTemplate)));
			$.link.rowTemplate('#' + settings.id + '-wrapper', settings.sortedData);
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.sortedData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			} else {
				this.find(".empty-text").remove();
			}
			//To maintain chainability
			return this;
		},

		/*
		 * Purpose : To filter the rows of the grid.
		 * Returns : jQuery object the plugin was invoked on
		 */
		filter : function(filterFn) {
			var settings = this.data('gridSettings');
			if(!settings) {
				throw "Not a valid grid";
			}
			if(filterFn) {
				if(Object.prototype.toString.call(filterFn).slice(8, -1) == "Function") {
					settings.filteredRowData = settings.rowData.filter(filterFn);
				}
			}
			var rowTemplate = [//
			'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
			settings.rowTmpl, //
			'</div>' //
			].join("");
			//Compiling the row template
			$.templates('rowTemplate', $.sortTemplate($.convertTemplate(rowTemplate)));
			$.link.rowTemplate('#' + settings.id + '-wrapper', settings.filteredRowData);
			//To refresh the scroller object
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.filteredRowData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			} else {
				this.find(".empty-text").remove();
			}
			//To maintain chainability
			return this;
		},
		/*
		 * Purpose : To delete row/s from the grid.
		 * Returns : jQuery object the plugin was invoked on
		 */
		remove : function(rowData) {
			var settings = this.data('gridSettings');
			var deleteIndex = -1;
			if(!settings) {
				throw "Not a valid grid";
			}
			if(Object.prototype.toString.call(rowData).slice(8, -1) == "Object") {
				for(var i = 0; i < settings.rowData.length; i++) {
					if(settings.rowData[i] === rowData) {
						deleteIndex = i;
					}
				}
			}
			if(Object.prototype.toString.call(rowData).slice(8, -1) == "Number") {
				deleteIndex = rowData;
			}
			$.observable(settings.rowData).remove(deleteIndex);
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.rowData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			}
		},
		/*
		 * Purpose: To group item/s of the grid
		 * Returns : jQuery object the plugin was invoked on
		 */
		groupBy : function(grouperFn) {
			var settings = this.data('gridSettings'), group = {};
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
			group = micro.array.groupBy(settings.rowData, grouperFn);
			var groupTemplate = ["{{for ~getFields(#data)}}", //
			'<div class="grid-group-header">{{>key}}</div>', //
			"{{for value}}", //
			'<div class="grid-row ' + ((settings.rowCls) ? settings.rowCls : " ") + '">', //
			settings.rowTmpl, //
			'</div>', //
			"{{/for}}", //
			"{{/for}}"//
			].join("");
			$.templates('groupTemplate', $.sortTemplate($.convertTemplate(groupTemplate)));
			$.link.groupTemplate('#' + settings.id + '-wrapper', group);
			if(this.data('scroller')) {
				this.data('scroller').refresh();
			}
			if(settings.rowData.length === 0 && settings.emptyText) {
				if(this.find(".empty-text").length == 0) {
					this.find('#' + settings.id + '-body').append('<div class="empty-text">' + settings.emptyText + '</div>');
				}
			} else {
				this.find(".empty-text").remove();
			}
			//To maintain chainability
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
	$.fn.grid = function(method) {
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
