var Countdown = function(){

	var counter = 3;
	var timer;

	function decrement(){
		counter--;
		if(counter <= 0) {
			RoadhouseMob.collapseMainNav();
			stop();
            return;
		}
	}

	function start(){
		clearInterval(timer);
		timer = setInterval( decrement, 1000)
	}

	function stop(){
		clearInterval(timer);
	}

	function reset(){
		counter = 5;
		start();
	}

	return {
		reset:reset,
		start:start,
		stop:stop
	}

}();



(function(window){


	// Public variables
	NavCountdown.publicVar = 5

	// Static vbariable
	function NavCountdown(count){
		this.counter = count; 
		this.timer;
	}

	// Public method
	NavCountdown.prototype.start = function(){
		navC = this;
		clearInterval(this.timer);
		this.timer = setInterval(function(){
			decrement(navC);
		}, 1000)
	}

	NavCountdown.prototype.stop = function(){
		clearInterval(this.timer);
	}

	NavCountdown.prototype.reset = function(){
		this.counter = 5;
		this.start();
	}

	// Private method (must be passed the context)
	function decrement(context){
		log("counter: "+context.counter);
		context.counter--;
		if(context.counter <= 0) {
			RoadhouseMob.collapseMainNav();
			context.stop();
            return;
		}
	}

	window.NavCountdown = NavCountdown;

}(window));

var RoadhouseMob = function($){

	function init(){

		initMainNav();

		//Listen to slider ready
		document.addEventListener("slideReady", function(e) {
			var swiper = $("#"+e.detail.swiper.container.id);
			//swiper.css({"opacity":1})
			//log(e.detail.swiper.container.id+" ready");
		});

		// Build them
		buildHomeSliders();
	}

	function initMainNav(){
		
		$('#mainNavigation li').on("click", function(e){
			$(this).addClass("selected");
			$('#mainNavigation li').removeClass("selected");
			Countdown.reset();
		});

		$("#navToggler").on("click", function(){toggleNavigationView(); })
	}

	function collapseMainNav(){
		if($(".navWrapper").hasClass("collapsed")){return}
		else {$(".navWrapper").addClass("collapsed").removeClass("expanded");}
	}

	function expandMainNav(){
		if($(".navWrapper").hasClass("expanded")){return}
		else {$(".navWrapper").addClass("expanded").removeClass("collapsed");}
	}

	function toggleNavigationView(){

		if($(".navWrapper").hasClass("collapsed")){
			expandMainNav()
		} else if($(".navWrapper").hasClass("expanded")){
			collapseMainNav()
		} else{$(".navWrapper").addClass("expanded")}
		return false;
	}

	function buildHomeSliders(){
		var workStartSlide = 2;
		var serviceStartSlide = 2;
		var workSlider 		= new Swipe(document.getElementById('workSlider'),		{slideWidth:270, monoSlide:false, startSlide:workStartSlide,  callback: function(e, pos) { updateWorkDescription(pos) } });
		var serviceSlider 	= new Swipe(document.getElementById('serviceSlider'), 	{slideWidth:106, monoSlide:false, startSlide:serviceStartSlide});
		var clientSlider 	= new Swipe(document.getElementById('clientSlider'), 	{ratio:2, startSlide:5});

		bullets = $('#homeSliderBullets li');
		workThumbnails = $("#workSlider img");	

		new MBP.fastButton(document.getElementById('shadright'), function(e){ serviceSlider.next();});
		new MBP.fastButton(document.getElementById('shadleft'), function(e){ serviceSlider.prev();});

		function updateWorkDescription(pos){
 			var i = bullets.length;
	        while (i--) { $(bullets[i]).removeClass('on');}
	        $(bullets[pos]).addClass('on');
	        $(".description").text($(workThumbnails[pos]).attr('alt'));
		};

		updateWorkDescription(workStartSlide);
	}

	return {
		init:init,
		initMainNav:initMainNav,
		toggleNavigationView:toggleNavigationView,
		buildHomeSliders:buildHomeSliders,
		collapseMainNav:collapseMainNav,
		expandMainNav:expandMainNav
	}

}($)

$(function($){ 
	//Zepto ready
	MBP.scaleFix();
	MBP.preventGhostClick();
	RoadhouseMob.init();
	applyLegacyIosStyles();
	new mis({onTransitionEnd:onPageTransitionFinished, onTransitionStart:onPageTransStart});

	function onPageTransitionFinished()
	{
		Countdown.start();
	}

	function onPageTransStart(){
		var homePage = $('#homePage');
		if (typeof(homePage) != 'undefined' && homePage != null && homePage.hasClass("animIn") ){ RoadhouseMob.buildHomeSliders(); }
	}
});

