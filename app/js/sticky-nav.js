$(document).ready(function() {

	function setSticky() {
      var viewportWidth = $(window).width();
      if(viewportWidth > 1364) {
      	if(!$('.desktop-sticky-nav').parent().hasClass('sticky-wrapper')) {
        	$('.desktop-sticky-nav').sticky();
        } else {
          $('.tablet-sticky-nav').sticky('update');
        }
        $('.tablet-sticky-nav').unstick();
        
      } else if(viewportWidth <= 1364 && viewportWidth > 730 ) {
        $('.desktop-sticky-nav').unstick();
        if(!$('.tablet-sticky-nav').parent().hasClass('sticky-wrapper')) {
        	$('.tablet-sticky-nav').sticky();
        } else {
          $('.tablet-sticky-nav').sticky('update'); 
        }
      } else {
        $('.desktop-sticky-nav').unstick();
        $('.tablet-sticky-nav').unstick();
      }
	};

	setSticky();
	$(window).resize(setSticky);
});