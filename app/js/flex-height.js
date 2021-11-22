$(document).ready(function() {
	function fixHeight(elements, minWidth, maxWidth) {
		// Set basic values
		var elements = $(elements),
		viewport = $(window),
		minWidth = minWidth || 0,
		maxWidth = maxWidth || Infinity;

		setInit();

		function setInit() {
			// Reset elements heights
			elements.height('auto');
			// Check viewport conditions
			var viewportWidth = viewport.width();
			if(viewportWidth >= minWidth && viewportWidth <= maxWidth) {
				// Set elements heights
				setHeight();
			};
		};

		function setHeight() {
			var heights = [];
			elements.each(function(i, el) {
				heights[i] = $(el).outerHeight();
			});
			elements.outerHeight(Math.max.apply(null, heights));
		};

		viewport.resize(function() {
			setInit();
		});
	};

	// Services page
	if($('.services-page-content').length) {
		fixHeight($('.pre-campaign-table-item, .remarketing-table-item'), 751);
		fixHeight($('.copywriting-table-item, .consulting-table-item'), 751);
		fixHeight($('.pay-per-click-table-item, .service-col:first-of-type'), 537);
	};

	// More services i offer section
	if($('.what-i-offer').length) {
		fixHeight($('.what-i-offer__item-content'), 320);
	};
});
