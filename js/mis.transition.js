function mis(option) {

	var transitioning,
	onTransitionEnd = option.onTransitionEnd || function() {}, // callback
	onTransitionStart = option.onTransitionStart || function(){},
	opts = {
	lines: 17, 							// The number of lines to draw
	length: 7, 							// The length of each line
	width: 3, 							// The line thickness
	radius: 11, 						// The radius of the inner circle
	corners: 0.6, 						// Corner roundness (0..1)
	rotate: 46, 						// The rotation offset
	color: '#a40a0a', 					// #rgb or #rrggbb
	speed: 1, 							// Rounds per second
	trail: 30, 							// Afterglow percentage
	shadow: true, 						// Whether to render a shadow
	hwaccel: true, 						// Whether to use hardware acceleration
	className: 'spinner', 				// The CSS class to assign to the spinner
	zIndex: 2e9,						// The z-index (defaults to 2000000000)
	top: 300, 							// Top position relative to parent in px
	left: 'auto' 						// Left position relative to parent in px
	},
	spinner = new Spinner(opts),		// Ajax loader wheel
	effect,
	url;

	function clickHandler(e){
		e.preventDefault();
		var target = e.srcElement || e.target;
		var tagname = target.tagName.toLowerCase();
	
		//try to find an anchor parent
		while (tagname!=="a" && tagname!=="body")
		{
			target = target.parentNode;
			tagname = target.tagName.toLowerCase();
		}
		if (tagname==="body") return;

	    effect = $(target).attr("data-mistrans");
	    url = $(target).attr("href");

	    History.pushState("", "", url);

	    // Dirty IE / way to execute that script if ie (which doesn't support history.js)
	    if (typeof history.pushState === 'undefined') {
	    	if (effect && !isSamepage(url) && !transitioning){ ajaxLoad(url, effect); }
	    }
	    
	};

	function isSamepage(url){
		var currentPageID = $('.current').attr('id');
	    var newPageID = url.split('.')[0];
	    return currentPageID === newPageID ? true : false;
	};

	function ajaxLoad(url, fx){

		spinner.spin(document.body);
		var state = History.getState();
		$.ajax({
		  type: 'GET',
		  url: typeof history.pushState === 'undefined' ? url : state.url,
		  success: function(data){
		  	spinner.stop();
		    slide(creatSlide(data), fx);
		  },
		  error: function(xhr, type){
		    alert('Ajax error!');
		  }
		})
	};

	function creatSlide(data){
		$("body").append(data);
		var slide = $(data).first().attr("id");
	    return $("#"+slide)
	};

	function slide(newSlide, fx){

		var currentSlide = getCurrentSlide();
		transitioning = true;

		currentSlide.addClass(fx + " animOut");
		newSlide.addClass(fx + " animIn current");

		onTransitionStart();

		setTimeout(function() { 
			onAnimComplete();
		}, 1005); // transition duration set in transition.css

		// Uses Zepto .animate()
		// Better transistions but doesn't work in ie mobile
		currentSlide.animate({
		  opacity: 0, 
		  translateX: '-100%'
		}, {duration : 500, easing :'ease-out'})

		newSlide.animate({
		  opacity: 1, 
		  translateX: '0%'
		}, 600, 'ease-in-out')

		function onAnimComplete(){
			transitioning = false;
			currentSlide.remove();
			newSlide.removeClass("animIn " + fx)
			onTransitionEnd();
		}
	};

	function getCurrentSlide(){
		var currentSlideID = $('.current').attr('id');
		var currentSlide = $("#"+currentSlideID);
		return currentSlide
	};

	// Listen to click event
	$(document).on("click", function(e){clickHandler(e)});
	
	// Set up history and back button
	var History = window.History;
	History.Adapter.bind(window,'statechange',function(){ 
        var State = History.getState(); 
        var shortUrl = State.hash.substring(State.hash.lastIndexOf('/') + 1);
		if (effect && !isSamepage(shortUrl) && !transitioning){ ajaxLoad(shortUrl, effect);}
    });
}