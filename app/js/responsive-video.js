$(document).ready(function() {
	function setVideo() {
		var videoPadding = 40,
		// width to height
		ratio = 560/315,
		maxWidth = ($(window).height()-videoPadding)*ratio,
		maxWidth = (maxWidth > 1018 ? 1018 : maxWidth),
		height = maxWidth / ratio;
		$('.video-remodal').css({
			'height': height,
			'max-width': maxWidth
		});
	};
	setVideo();
	$(window).resize(setVideo);
});