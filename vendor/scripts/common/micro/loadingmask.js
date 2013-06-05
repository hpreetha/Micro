/*
 ***************************************************************************************************************************************
 *Loading mask Plugin
 ***************************************************************************************************************************************
 * =======================================
 * API
 * =======================================
 * General structure :
 * $(<<target>>).loadingMask(<<method name>>, <<method parameter>>);
 *
 * To show loading mask
 * $(<<target>>).loadingMask('show',{
 * 	title : title for loading mask //Optional, Default : "Loading.."
 *  msg : message to be show in loading mask//Optional Default : null
 * 	tmpl : template for rendering custom loading mask //Optional
 * });
 *
 * To hide loading mask
 * To add new rows to grid
 * $(<<target>>).loadingMask('hide');
 *
 */
(function($) {
	var settings, methods, mask, maskTemplate;
	methods = {
		/*
		 * Purpose: To show loading mask
		 * Returns : jQuery object the plugin was invoked on
		 */
		show : function(options) {
			//To check if options is provided, it has to be object
			if(options) {
				if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
					throw 'Invalid type, options should be of type Object';
				}
			}
			//Extending option with default values
			var settings = $.extend({
				'title' : 'Loading...'
			}, options);
			//To make sure that the target dosen't have any existing loadingmask
			if(!this.data('loadingMaskId')) {
				//Generating an id for loading mask
				settings.id = 'loadingmask-' + new Date().getTime();
				//To check if tmpl is given and its valid
				if(settings.tmpl) {
					if($.trim(settings.tmpl).indexOf('#') === 0) {
						if($(settings.tmpl).length) {
							maskTemplate = $(settings.tmpl).html();
							settings.tmpl = maskTemplate;
						} else {
							throw "Template " + settings.tmpl + " not found";
						}
					} else {
						maskTemplate = settings.tmpl;
					}
				} else {
					//Defining default structure for loading window, when tmpl is not given
					maskTemplate = [//
					'<div class="loading-window">', //
					'<div class="loading-spinner"></div>', //
					'<div class="loading-title">{{:title}}</div>', //
					'{{if msg}}<div class="loading-msg">{{:msg}}</div>{{/if}}', //
					'</div>'//
					].join("");
				}
				//Defining default structure for loading mask
				mask = [//
				'<div class="loading-mask" id="{{:id}}">', //
				maskTemplate, '</div>'//
				].join("");
				//Compiling the loading mask template
				$.templates('mask', mask);
				//Rendering the loading mask to target
				this.append($.render.mask(settings));
				//Bind the id of loading mask to target ,for later usage
				this.data('loadingMaskId', settings.id);
			} else {
				console.log('Warning: Loading mask already exists');
			}

			//To maintain chainability
			return this;
		},
		/*
		 * Purpose : To hide existing loading mask
		 * Returns : jQuery object the plugin was invoked on
		 */
		hide : function() {
			if(this.data('loadingMaskId')) {
				$('#' + this.data('loadingMaskId')).remove();
				this.data('loadingMaskId', null);
			}
			//To maintain chainability
			return this;
		}
	};

	$.fn.loadingMask = function(method) {
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
