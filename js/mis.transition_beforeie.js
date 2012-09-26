function mis(option) {


	var onTransitionEnd = option.onTransitionEnd || function() {}; 		// callback
	var onTransitionStart = option.onTransitionStart || function(){};	// callback
	var opts = {
		lines: 17, 				// The number of lines to draw
		length: 7, 				// The length of each line
		width: 3, 				// The line thickness
		radius: 11, 			// The radius of the inner circle
		corners: 0.6, 			// Corner roundness (0..1)
		rotate: 46,				// The rotation offset
		color: '#a40a0a', 		// #rgb or #rrggbb
		speed: 1, 				// Rounds per second
		trail: 30, 				// Afterglow percentage
		shadow: true, 			// Whether to render a shadow
		hwaccel: true, 			// Whether to use hardware acceleration
		className: 'spinner', 	// The CSS class to assign to the spinner
		zIndex: 2e9, 			// The z-index (defaults to 2000000000)
		top: 300, 				// Top position relative to parent in px
		left: 'auto'			// Left position relative to parent in px
	};

	var spinner = new Spinner(opts);

	function clickHandler(e){
		
	    var target = e.srcElement || e.target;
	    var effect = $(target).attr("data-mistrans");

	    var url = $(target).attr("href");
	    var currentPageID = $('.current').attr('id');
	    var newPageID = url.split('.')[0];

	    // If page request is different than current page load it.
	    if (effect && currentPageID != newPageID) 
	    {
	    	e.preventDefault();
			ajaxLoad(url, effect);
	    }
	};

	function ajaxLoad(url, fx){

		spinner.spin(document.body);
		// Create page container
		var pageID = url.split('.')[0];
		$("body").append("<div class='page' id='"+pageID+"'></div>");
		var page = $("#"+pageID);

		$.ajax({
		  type: 'GET',
		  url: url,
		  success: function(data){
		    slide(page.append(data), fx);
		    spinner.stop();
		  },
		  error: function(xhr, type){
		    alert('Ajax error!');
		  }
		})
	};

	function slide(newSlide, fx){

		var currentSlide = getCurrentSlide();
		// Slide current slide out
		currentSlide.addClass(fx + " out");
		// Slide new slide in
		newSlide.addClass(fx + " in current");

		onTransitionStart();

		setTimeout(function() { 
			currentSlide.remove();
			newSlide.removeClass("in " + fx)
			onTransitionEnd();
		}, 1005); // transition duration set in transition.css
	};

	function getCurrentSlide(){
		var currentSlide = $("#"+ $('.current').attr('id'));
		return currentSlide
	}

	// Listen to click event
	$(document).on("click", function(e){clickHandler(e)});
}