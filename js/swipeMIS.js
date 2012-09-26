/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

window.Swipe = function(truc, options) {

  // return immediately if truc doesn't exist
  if (!truc) return null;

  var _this = this;
  this.myevent = document.createEvent("Event");

  // retreive options
  this.options = options || {};
  this.currentIndex = this.options.startSlide || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};
  this.delay = this.options.auto || 0;
  this.ratio = this.options.ratio || 1;
  this.monoSlide = this.options.monoSlide || false; // show 1 slide only or the whole slider
  this.use3D = this.isSupport3D();
  this.freeMode = false;
  this.slideWidth = this.options.slideWidth || undefined


  // reference dom truc
  this.container = truc;
  this.slidePane = this.container.children[0]; // the slide pane

  // static css
  this.container.style.overflow =  this.monoSlide ? 'hidden' : 'block';
  this.slidePane.style.listStyle = 'none';
  this.slidePane.style.margin = 0;

  // trigger slider initialization
  this.setup();

  // begin auto slideshow
  this.begin();

  // add event listeners
  if (this.slidePane.addEventListener) {
    this.slidePane.addEventListener('touchstart', this, false);
    this.slidePane.addEventListener('touchmove', this, false);
    this.slidePane.addEventListener('touchend', this, false);
    this.slidePane.addEventListener('webkitTransitionEnd', this, false);
    this.slidePane.addEventListener('msTransitionEnd', this, false);
    this.slidePane.addEventListener('oTransitionEnd', this, false);
    this.slidePane.addEventListener('transitionend', this, false);
    window.addEventListener('resize', this, false);
  }

};

Swipe.prototype = {

  setup: function() {

    // get and measure amt of slides
    this.slides = this.slidePane.children;
    this.length = this.slides.length;

    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = this.slideWidth != undefined ? this.slideWidth : ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth;

    // return immediately if measurement fails
    if (!this.width) return null;
    // hide slider element but keep positioning during setup
    this.container.style.visibility = 'hidden';

    // dynamic css
    this.slidePane.style.width = (this.slides.length * this.width) + 'px';

    var index = this.slides.length;
    while (index--) {
      var el = this.slides[index];
      el.style.width = this.width + 'px';
      el.style.display = 'table-cell';
      el.style.verticalAlign = 'top';
    }

    // set start position and force translate to remove initial flickering
    this.slide(this.currentIndex, 0); 

    // show slider element
    this.container.style.visibility = 'visible';

    // Sent custom event when setup
    this.myevent.initEvent("slideReady", true, true);
    this.myevent.detail = { swiper: this }
    document.dispatchEvent(this.myevent);

  },

  slide: function(newIndex, duration) {

    //var style = this.slidePane.style;

    // fallback to default speed
    if (duration == undefined) { duration = this.speed; }

    // set duration speed (0 represents 1-to-1 scrolling)
    this.slidePane.style.webkitTransitionDuration = 
    this.slidePane.style.MozTransitionDuration = 
    this.slidePane.style.msTransitionDuration = 
    this.slidePane.style.OTransitionDuration = 
    this.slidePane.style.transitionDuration = 
    duration + 'ms';
    
    var xPos = newIndex * this.width
    
    // translate to given index position
    this.setTransform(-xPos, 0, 0);

    // set new index to allow for expression arguments
    this.currentIndex = newIndex;
  },

  getPos: function() {
    // return current index position
    return this.currentIndex*this.width;
  },

  getCurrentIndex: function(){
    return this.currentIndex;
  },

  prev: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    // if not at first slide
    if (this.currentIndex) this.slide(this.currentIndex-1, this.speed);
  },

  next: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.currentIndex < this.length - 1) this.slide(this.currentIndex+1, this.speed); // if not last slide
    else this.slide(0, this.speed); //if last slide return to start

  },

  begin: function() {

    var _this = this;

    this.interval = (this.delay)
      ? setTimeout(function() { 
        _this.next(_this.delay);
      }, this.delay)
      : 0;
  
  },
  
  stop: function() {
    this.delay = 0;
    clearTimeout(this.interval);
  },
  
  resume: function() {
    this.delay = this.options.auto || 0;
    this.begin();
  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd':
      case 'msTransitionEnd':
      case 'oTransitionEnd':
      case 'transitionend': this.transitionEnd(e); break;
      case 'resize': this.setup(); break;
    }
  },

  transitionEnd: function(e) {
    
    if (this.delay) this.begin();

    this.callback(e, this.currentIndex, this.slides[this.currentIndex]);

  },

  onTouchStart: function(e) {
    
    this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,

      // set initial timestamp of touch sequence
      time: Number( new Date() )

    };

    // used for testing first onTouchMove event
    this.isScrolling = undefined;
    
    // reset deltaX
    this.deltaX = 0;

    // set transition time to 0 for 1-to-1 touch movement
    this.slidePane.style.MozTransitionDuration = this.slidePane.style.webkitTransitionDuration = 0;
    
    //e.stopPropagation();
  },

  onTouchMove: function(e) {

    // ensure swiping with one touch and not pinching
    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

    this.deltaX = (e.touches[0].pageX - this.start.pageX)*this.ratio;

    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY) );
    }

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {
      
      // prevent native scrolling 
      e.preventDefault();

      // cancel slideshow
      clearTimeout(this.interval);

      // increase resistance if first or last slide
      this.deltaX = 
        this.deltaX / 
          ( (!this.currentIndex && this.deltaX > 0              // if first slide and sliding left
            || this.currentIndex == this.length - 1             // or if last slide and sliding right
            && this.deltaX < 0                                  // and if sliding at all
          ) ?                      
          ( Math.abs(this.deltaX) / this.width + 1 )            // determine resistance level
          : 1 );                                                // no resistance if false

      // translate immediately 1-to-1
      this.setTransform((this.deltaX - (this.currentIndex * this.width)), 0, 0)

     // e.stopPropagation();
    }

  },

  onTouchEnd: function(e) {

    // Check if swipe is valid
    var isValidSwipe = 
              Number(new Date()) - this.start.time < 250  && Math.abs(this.deltaX) > 20   // if swipe duration is less than 250ms and if swipe amt is greater than 20px
              || Math.abs(this.deltaX) > this.width/2                                     // or if swipe amt is greater than half the width

    var offSet = Math.round(Math.abs(this.deltaX/this.width));
    var indexOffset = isValidSwipe ? (                              // If we have a valid swipe detected
                      offSet > 0 ?                                  // let's check if the number of slides that can be contained within a swipe is bigger than 0
                        (this.deltaX < 0 ? offSet : -offSet) :      // if bigger than 0 let's add or substract the offset depending on swipe direction
                        (this.deltaX < 0 ? 1 : -1))                 // if the swipe is valid but too short to have a an offset > 0 we still set it to 1 or -1 ( we still want a slide to happen ) depending on swipe direction
                      : 0;                                          // finaly let's set it to 0 if swipe is not valid

    // Now we can determine the new index candidate by adding the indexOffset to the current index
    var newIndexCandidate = this.currentIndex + indexOffset;

    // Then we need to make sure the index candidate is within the boundaries of our slider
    var isWithinBounds = 
              !(newIndexCandidate >= this.length ? true : false)  
              && !(newIndexCandidate < 0 ? true : false);         
      
    // Finally let's determin our new index
    var newIndex = isWithinBounds ? newIndexCandidate : this.currentIndex
  
    // log("CurrentIndex: "+this.currentIndex+" - indexOffset: "+indexOffset +" - newIndexCandidate: "+newIndexCandidate+" // newIndex: "+newIndex);     
    
    // let's slide the mofo
    if (!this.isScrolling) { this.slide(newIndex, this.speed ); }
    
  },

  //Set Transform
  setTransform : function(x,y,z) {
    var es = this.slidePane.style;
    x=x||0;
    y=y||0;
    z=z||0;
    if (this.use3D) {
      es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = 'translate3d('+x+'px, '+y+'px, '+z+'px)'
    }
    else {
      es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = 'translate('+x+'px, '+y+'px)'
    }
  },

  // 3D Transforms Test 
  isSupport3D : function() {
    var div = document.createElement('div');
    div.id = 'test3d';
      
    var s3d=false;  
    if("webkitPerspective" in div.style) s3d=true;
    if("MozPerspective" in div.style) s3d=true;
    if("OPerspective" in div.style) s3d=true;
    if("MsPerspective" in div.style) s3d=true;
    if("perspective" in div.style) s3d=true;

    /* Test with Media query for Webkit to prevent FALSE positive*/ 
    if(s3d && ("webkitPerspective" in div.style) ) {
      
      var st = document.createElement('style');
      st.textContent = '@media (-webkit-transform-3d), (transform-3d), (-moz-transform-3d), (-o-transform-3d), (-ms-transform-3d) {#test3d{height:5px}}'
      document.getElementsByTagName('head')[0].appendChild(st);
      document.body.appendChild(div);
      
      s3d = div.offsetHeight === 5;;
      st.parentNode.removeChild(st);
      div.parentNode.removeChild(div);
    }
    return s3d;
  }

};
