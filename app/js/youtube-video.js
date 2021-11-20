// 1. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var howItWorksPlayer,
howItWorksPlayerIsReady = false;
function onYouTubeIframeAPIReady() {
  howItWorksPlayer = new YT.Player('how-it-works-video-iframe-api', {
    height: '390',
    width: '640',
    videoId: 'Y451Vn6UAMY',
    events: {
    	'onReady': onPlayerReady
    },
    playerVars: {
    	rel: 0
    }
  });
}

// 3. The API will call this function when the video player is ready.
var videoRemodalIsOpen = false;

function onPlayerReady(event) {
  howItWorksPlayerIsReady = true;
  if(videoRemodalIsOpen) {
    howItWorksPlayer.playVideo();
  }
}

$(document).on('opened', '.video-remodal', function () {
  videoRemodalIsOpen = true;
  howItWorksPlayer.playVideo();
});

$(document).on('closed', '.video-remodal', function () {
  videoRemodalIsOpen = false;
  howItWorksPlayer.pauseVideo();
});
