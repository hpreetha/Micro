$.views.tags({
	fields : function(object) {
		var key, ret = "";
		for(key in object ) {
			if(object.hasOwnProperty(key)) {
				// For each property/field, render the content of the {{fields object}} tag, with "~key" as template parameter
				ret += this.tagCtx.render(object[key], {
					key : key
				});
			}
		}
		return ret;
	}
});
//Define a custom getFields helper function to iterate over fields and return
$.views.helpers({
	getFields : function(object) {
		var key, value, fieldsArray = [];
		for(key in object ) {
			if(object.hasOwnProperty(key)) {
				value = object[key];
				// For each property/field add an object to the array, with key and value
				fieldsArray.push({
					key : key,
					value : value
				});
			}
		}
		// Return the array, to be rendered using {{for ~fields(object)}}
		return fieldsArray;
	}
});
//Name spacing
(function($) {
	micro = {};
	//Private Method
	function initialize() {

	}


	micro._construct = function() {
		initialize();
	};
	micro._construct();
})(this, jQuery);
//Platform
(function($) {
	micro.platform = {};
	//Private Method
	function initialize() {
		//Initializing Platform Flags
		micro.platform.isIos = false;
		micro.platform.isAndroid = false;
		micro.platform.isTablet = false;
		micro.platform.isMobile = false;
		micro.platform.os = "";
		
		//To check if device is iPhone, iPod or iPad
		if(/iP(hone|od|ad)/.test(navigator.userAgent)) {
			micro.platform.isIos = true;
			if(/iPhone/.test(navigator.userAgent)) {
				micro.platform.isMobile = true;
			} else if(/iPad/.test(navigator.userAgent)) {
				micro.platform.isTablet = true;
			}
			var version = /OS (\d+)_(\d+)/.exec(navigator.userAgent);
			if(version) {
				micro.platform.os = "iOS " + version[1] + "." + version[2];
			}
			return;
		}
		//To check if device is Android
		if(/Android/.test(navigator.userAgent)) {
			micro.platform.isAndroid = true;
			if(/Mobile/.test(navigator.userAgent)) {
				micro.platform.isMobile = true;
			} else {
				micro.platform.isTablet = true;
			}
			var version = /Android (\d+).(\d+)/.exec(navigator.userAgent);
			if(version) {
				micro.platform.os = version[0];
			}
			return;
		}
	}
	micro.platform._construct = function() {
		initialize();
	};
	micro.platform._construct();
})(this, jQuery);
//Array
(function($) {
	micro.array = {};
	//Groups an array based on the grouperFn provided.
	micro.array.groupBy = function(arr, grouperFn) {
		var result = {}, keys = [], sorted_obj = {};
		for(var i = 0; i < arr.length; i++) {
			var key = grouperFn(arr[i]);
			if(key) {
				(result[key] ? result[key] : result[key] = []).push(arr[i]);
			}
		}
		//Retriving keys from result for sorting
		for(var key in result) {
			if(result.hasOwnProperty(key)) {
				keys.push(key);
			}
		}
		// sort keys
		keys.sort();
		// create new array based on Sorted Keys
		jQuery.each(keys, function(i, key) {
			sorted_obj[key] = result[key];
		});
		return sorted_obj;
	};
	//Sorts an array
	micro.array.sort = function(arr, fieldName, fieldType, order) {
		var sortFn;
		//To check if fieldName is given
		if(fieldName) {
			//If a function is provided, the function is used as sort function to sort the array
			if(Object.prototype.toString.call(fieldName).slice(8, -1) == "Function") {
				sortFn = fieldName;
				arr.sort(sortFn);
			} else if(Object.prototype.toString.call(fieldName).slice(8, -1) == "String") {
				if(fieldType == "Number") {
					if(order == "desc") {
						arr.sort(function(item1, item2) {
							return item2[fieldName] - item1[fieldName];
						});
					} else {
						arr.sort(function(item1, item2) {
							return item1[fieldName] - item2[fieldName];
						});
					}
				}
				if(fieldType == "String") {
					if(order == "desc") {
						arr.sort(function(item1, item2) {
							if(item2[fieldName] > item1[fieldName]) {
								return 1;
							} else if(item2[fieldName] < item1[fieldName]) {
								return -1;
							} else {
								return 0;
							}

						});
					} else {
						arr.sort(function(item1, item2) {

							if(item2[fieldName] > item1[fieldName]) {
								return -1;
							} else if(item2[fieldName] < item1[fieldName]) {
								return 1;
							} else {
								return 0;
							}

						});
					}
				}
			}
		}
		//When fieldName is not given, The native sort function is called on the array
		else {
			arr.sort();
		}
		return arr;
	};
	//Clones an array
	micro.array.clone = function(arr) {
		return arr.slice(0);
	}
})(this, jQuery);
//Function to hide keyboard when body is tapped
(function() {
	$(document).ready(function() {
		$('body').on('tap', function(event) {
			if(event.target.nodeName === "TEXTAREA" || event.target.nodeName === "INPUT" || event.target.nodeName === "SELECT") {
				return;
			}
			if(document.activeElement.nodeName === "TEXTAREA" || document.activeElement.nodeName === "INPUT") {
				$(document.activeElement).blur();
			}
		});
	});
})(this, jQuery);
/*
 ***************************************************************************************************************************************
 *Navigation Plugin
 ***************************************************************************************************************************************
 * =======================================
 * API
 * =======================================
 * General structure :
 * $.navigatePage(<<spine view object>>, <<show animation>>, <<hide animation>>);
 * animations: slidein , slideout, slideinReverse, slideoutReverse
 */
$.navigatePage = function(viewObject, showAnimation, hideAnimation,domCache) {
	if(document.activeElement.nodeName === "TEXTAREA" || document.activeElement.nodeName === "INPUT" || document.activeElement.nodeName === "SELECT") {
		$(document.activeElement).blur();
	}
	var activeView = $(viewObject.target+'>.active-view')[0];
	if(activeView) {
		if($(activeView).attr('id') === viewObject.id) {
			console.log('Warn : Cannot navigate to same view');
			return;
		}
	}
	if(viewObject) {
		$('#' + viewObject.id).addClass('active-view');
		if(showAnimation || viewObject.options.showAnimation) {
			$('#' + viewObject.id).animatePage(showAnimation || viewObject.options.showAnimation);
		}
	}
	if(activeView) {
		$(activeView).removeClass('active-view');
		if(hideAnimation || viewObject.options.hideAnimation) {
			$(viewObject.target).append('<div class="animation-mask"></div>');
			$(activeView).addClass('prev-view');
			$(activeView).animatePage(hideAnimation || viewObject.options.hideAnimation);
			$(activeView).bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationEnd', function(event) {
				$(activeView).removeClass('prev-view');
				$(viewObject.target).find('.animation-mask').remove();
				$(activeView).unbind(event);
				if(!domCache){
					$(activeView).remove();
				}
			});
		}
		else{
			$(activeView).remove();
		}
	}
};
/*
 ***************************************************************************************************************************************
 *Convert Template Plugin
 ***************************************************************************************************************************************
 */
$.convertTemplate = function(tmpl) {
	var matched, blockPattern, inputPattern, wholeMatch, data;
	if(tmpl) {
		//Pattern for input fields
		inputPattern = /value\s?=\s?['"]\s?\{\{@(.*?)\}\}\s?['"]/gi;
		while(( matched = inputPattern.exec(tmpl)) !== null) {
			tmpl = tmpl.replace(matched[0], 'data-link="' + matched[1] + '"');
		}
		//Pattern for html blocks
		blockPattern = /<[^<>]*>[^<>]*\{\{@(.*?)\}\}[^<>]*<\/[^<>]*>/g;
		while(( matched = blockPattern.exec(tmpl)) !== null) {
			wholeMatch = matched[0];
			data = matched[1];
			wholeMatch = wholeMatch.replace(">", ' ' + 'data-link="' + data + '">');
			tmpl = tmpl.replace(matched[0], wholeMatch);
		}
		return tmpl;
	}
};
/*
 ***************************************************************************************************************************************
 *Sort Template Plugin
 ***************************************************************************************************************************************
 */
$.sortTemplate = function(tmpl) {
	var matched, blockPattern, wholeMatch, data;
	if(tmpl) {
		blockPattern = /<[^<>]*>[^<>]*\{\{[@||:||>](.*?)\}\}[^<>]*<\/[^<>]*>/g;
		while(( matched = blockPattern.exec(tmpl)) !== null) {
			wholeMatch = matched[0];
			data = matched[1];
			wholeMatch = wholeMatch.replace(">", ' ' + 'data-attribute="' + data + '">');
			tmpl = tmpl.replace(matched[0], wholeMatch);
		}
		return tmpl;
	}
};