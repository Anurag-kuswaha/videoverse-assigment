// Video Player and Cropper Elements
const videoPlayer = document.getElementById('videoPlayer');
const videoPlayPause = document.getElementById('video-play-pause')
const progressBar  = document.querySelector('.custom-progress-bar');
const customProgressBarDotIcon = document.querySelector('.progress-handle');


const playbackSpeed = document.getElementById('playbackSpeed')
const cropper = document.getElementById('cropper');
const aspectRatio = document.getElementById('aspectRatio');
const startCropperButton = document.getElementById('startCropper');
const removeCropperButton = document.getElementById('removeCropper');
const generatePreviewButton = document.getElementById('generatePreview');
const previewCanvas = document.createElement('canvas'); // Canvas for real-time preview
const previewContext = previewCanvas.getContext('2d');
const previewPlaceholder = document.getElementById('previewPlaceholder');

// video play/pause and loader
videoPlayPause.addEventListener('click', ()=>{
    console.log('videoPlayer.onplaying', videoPlayer.onplaying)
    if (!videoPlayer.paused){
        videoPlayer.pause()
        videoPlayPause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
</svg>`
    }
    else {
        videoPlayer.play()
        videoPlayPause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pause" viewBox="0 0 16 16">
                            <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>
                          </svg>`

    }
})
videoPlayer.addEventListener('timeupdate', () => {
    console.log('video is playing')

    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;

    progressBar.style.width = `${percentage}%`;
    customProgressBarDotIcon.style.left = `${percentage}%`
    progressBar.setAttribute('aria-valuenow', percentage)

});


// video controls

 // Seek video on click of the progress bar
 progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;

    videoPlayer.currentTime = (percentage / 100) * videoPlayer.duration;
    progressBar.style.width = `${percentage}%`;
    customProgressBarDotIcon.style.left = `${percentage}%`
    progressBar.setAttribute('aria-valuenow', percentage)
  });
// 1. playback speed
playbackSpeed.addEventListener( 'change', function(e){
    videoPlayer.playbackRate = e.target.value;
})



// Append the canvas to the preview section
previewPlaceholder.innerHTML = ''; // Clear placeholder text
previewPlaceholder.appendChild(previewCanvas);

// Dragging Variables
let isDragging = false;
let startX;

// Recorded Data
let recordedData = [];

// Start Cropper Button
startCropperButton.addEventListener('click', () => {
    const [widthRatio, heightRatio] = aspectRatio.value.split(':').map(Number);
    cropper.style.display = 'block';
    cropper.style.height = `${videoPlayer.offsetHeight}px`; // Set height to 100% of video
    cropper.style.width = `${ (widthRatio * videoPlayer.offsetWidth) / (2*heightRatio)}px`; // Default width (50% of video width)
    cropper.style.left = '0px'; // Align to left initially
    cropper.style.top = '0px'; // Align to top initially

    // Set up canvas dimensions for real-time preview
    previewCanvas.width = (widthRatio * videoPlayer.offsetWidth) / (2*heightRatio);
    previewCanvas.height = videoPlayer.offsetHeight;
});

// Remove Cropper Button
removeCropperButton.addEventListener('click', () => {
    cropper.style.display = 'none';
    previewPlaceholder.innerHTML =
        '<p>Preview not available</p><p>Please click on "Start Cropper" and then play video</p>';
});

// Aspect Ratio Change
aspectRatio.addEventListener('change', () => {
    const [widthRatio, heightRatio] = aspectRatio.value.split(':').map(Number);
    console.log('videoPlayer.offsetWidth is ', videoPlayer.offsetWidth)
    const newWidth = (videoPlayer.offsetWidth * widthRatio) / (2* heightRatio);
    console.log('newWidth is' , newWidth)
    console.log('videoPlayer.offsetHeight is', videoPlayer.offsetHeight)

   
    cropper.style.height = `${videoPlayer.offsetHeight}px`;
    cropper.style.width = `${Math.min(newWidth, videoPlayer.offsetWidth)}px`;

    // reseting position in case of overflow
    if (parseInt(cropper.style.left) + parseInt(cropper.style.width) > videoPlayer.offsetWidth) {
        cropper.style.left = `${videoPlayer.offsetWidth - parseInt(cropper.style.width)}px`;
    }

    // Update canvas dimensions for real-time preview
    console.log('newWidth is', newWidth)
    console.log('videoPlayer.offsetWidth is', videoPlayer.offsetWidth)
    previewCanvas.width = Math.min(newWidth, videoPlayer.offsetWidth);
});

// Dragging Functionality for Cropper
cropper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - cropper.offsetLeft;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let newX = e.clientX - startX;

    // Ensure cropper stays within the video container horizontally
    newX = Math.max(0, Math.min(newX, videoPlayer.offsetWidth - parseInt(cropper.style.width)));
    cropper.style.left = `${newX}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Real-Time Preview Generation
function updatePreview() {
    if (cropper.style.display === 'block') {
        const x = parseInt(cropper.style.left);
        const y = 0; // always 0
        const width = parseInt(cropper.style.width);
        const height = parseInt(cropper.style.height);
        console.log('x and y is', x, ' : ', y)
        console.log('width is ', width)
        console.log('height is ', height)

        // Draw the cropped portion of the video onto the canvas
        previewContext.drawImage(
            videoPlayer,
            x, y, width, height, // Source rectangle from video
            0, 0, width, height // Destination rectangle on canvas
        );
    }

    requestAnimationFrame(updatePreview); // Keep updating in real time
}
updatePreview();

// Generate Preview Button (Save Cropping Data)
generatePreviewButton.addEventListener('click', () => {
    recordCoordinates();
    downloadJSON();
});

// Record Coordinates and Playback Data
function recordCoordinates() {
    recordedData.push({
        timeStamp: videoPlayer.currentTime,
        coordinates: [
            parseInt(cropper.style.left),
            parseInt(cropper.style.top),
            parseInt(cropper.style.width),
            parseInt(cropper.style.height),
        ],
        volume: videoPlayer.volume,
        playbackRate: videoPlayer.playbackRate,
    });
}

// Download JSON Data
function downloadJSON() {
    const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(recordedData));
    const downloadAnchorNode =
        document.createElement('a');
    downloadAnchorNode.setAttribute(
        'href',
        dataStr,
    );
    downloadAnchorNode.setAttribute(
        'download',
        'recorded_data.json',
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
