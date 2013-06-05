/*
 ***************************************************************************************************************************************
 *Carousel Plugin
 ***************************************************************************************************************************************
 */
(function($) {

	var methods, carouselSettings;
	methods = {
		create : function(options) {
			if(options) {
				if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
					throw 'options not provided or Invalid type of options';
				}
			}
			// Default config params
			var settings = $.extend({
				'mode' : 'horizontal',
				'slidesPerSlide' : 1,
				'slidesPerGroup' : 1,
				'initialSlide' : 0,
				'pagination' : '.pagination-sd',

			}, options);
			this.empty();
			//Adding swiper class to the target
			this.addClass("swiper-wrapper");
			this.wrap('<div class="swiper-container"></div>');
			// Adding a div to show the pagination
			$('.swiper-container').append('<div class="pagination-sd"></div>');
			//To check if valid mode is given
			if(settings.mode !== 'horizontal' && settings.type !== 'vertical') {
				throw "Invalid mode";
			}
			//code for creating swiper Object
			var swiperObject = $('.swiper-container').swiper({
				pagination : '.pagination-sd',
				mode : settings.mode,
				slidesPerSlide : settings.slidesPerSlide,
				initialSlide : settings.initialSlide,
				slidesPerGroup : settings.slidesPerGroup,
				loop : false
			})
			//Config params and swiper object saved for future use
			this.data("swiper", swiperObject);
			this.data("carouselSettings", settings);
			return this;
		},
		removeItem : function(index) {
			var swiper = this.data("swiper");
			//if indes is passed as a parameter
			if(index) {
				if(Object.prototype.toString.call(index).slice(8, -1) == 'Number') {
					swiper.removeSlide(index);
				} else {
					throw 'Please Enter number ';
				}
			}
			// else removes the current activeslide
			else {
				swiper.removeSlide(swiper.activeSlide);
			}
		},
		goToItem : function(options) {
			//to go to a particular Item if id or index is given
			var swiper = this.data("swiper");
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type of options';
			}
			if(options.id) {
				swiper.swipeTo($('#' + id).index());
			} else if(options.index) {
				swiper.swipeTo(options.index);
			} else {
				throw "Either id or index has to be provided";
			}
		},
		getLastItem : function() {
			var swiper = this.data("swiper");
			return swiper.getLastSlide().index()
		},
		addItem : function(options) {
			var settings = this.data("carouselSettings");
			var swiper = this.data("swiper");
			var swiperLength = $('.swiper-container').find('.swiper-slide').length;
			if(!settings) {
				throw "Carousel has to be created, before adding slide(s)";
			}
			if(!options) {
				throw 'No options provided';
			}
			if(Object.prototype.toString.call(options).slice(8, -1) !== "Object") {
				throw 'Invalid type of options';
			}
			if(!options.slideId) {
				throw 'slideId is not provided';
			}
			if($('#' + options.slideId).length) {
				throw 'Provide a valid id. #' + options.slideId + ' already exists';
			}
			var slideId = options.slideId;
			slideId = swiper.createSlide()
			slideId.append();
			slideId.id = options.slideId;
			return this.find('#' + options.slideId);
		}
	};
	$.fn.carousel = function(method) {
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