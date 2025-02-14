// Video Player and Cropper Elements
const videoPlayer = document.getElementById('videoPlayer');

const videoPlayPause = document.getElementById('video-play-pause')
const progress = document.querySelector('.custom-progress');
const progressBar = document.querySelector('.custom-progress-bar');
const customProgressBarDotIcon = document.querySelector('.progress-handle');

//  show timer and volumen
const showDuration = document.querySelector('.show-duration')
const volumeRange = document.getElementById('volumeRange');


const playbackSpeed = document.getElementById('playbackSpeed')
const cropper = document.getElementById('cropper');
const aspectRatio = document.getElementById('aspectRatio');

const startCropperButton = document.getElementById('startCropper');
const removeCropperButton = document.getElementById('removeCropper');


const generatePreviewButton = document.getElementById('generatePreview');
const previewCanvas = document.createElement('canvas'); // Canvas for real-time preview
const previewContext = previewCanvas.getContext('2d');
const previewPlaceholder = document.getElementById('previewPlaceholder');


var isCropperEnabled = false
var isVideoPlayed = false
let minWidthConstraint = 50
// video play/pause and loader
videoPlayPause.addEventListener('click', () => {
    isVideoPlayed = true
    console.log('videoPlayer.onplaying', videoPlayer.onplaying)
    if (!videoPlayer.paused) {
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
    showPreview()
})
videoPlayer.addEventListener("pause", (event) => {
    videoPlayPause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
</svg>`
});
videoPlayer.addEventListener('timeupdate', () => {
    console.log('video is playing')

    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;

    progressBar.style.width = `${percentage}%`;
    customProgressBarDotIcon.style.left = `${percentage - 2}%`
    progressBar.setAttribute('aria-valuenow', percentage)
    showDuration.querySelector('.current-duration').textContent = formatDuration(videoPlayer.currentTime)
    showDuration.querySelector('.end-duration').textContent = formatDuration(videoPlayer.duration)

});
// on page load update the timer
window.addEventListener('load', function () {
    showDuration.querySelector('.current-duration').textContent = formatDuration(videoPlayer.currentTime)
    showDuration.querySelector('.end-duration').textContent = formatDuration(videoPlayer.duration)

    videoPlayer.volume = 0
    volumeRange.value = videoPlayer.volume * 100;

    removeCropperButton.style.opacity = 0.5
    generatePreviewButton.style.opacity = 0.5
})

// video volume control
volumeRange.addEventListener('input', (event) => {
    videoPlayer.volume = event.target.value / 100; // Convert to range [0,1]

})
// video controls

// Seek video on click of the progress bar
progress.addEventListener('click', (e) => {
    console.log('clicked on video')
    const rect = progress.getBoundingClientRect();
    console.log('rect is', rect)
    const clickPosition = e.clientX - rect.left;
    let percentage = 0
    if (rect)
        percentage = (clickPosition / rect.width) * 100;
    console.log('percentage is ', percentage)

    videoPlayer.currentTime = (percentage / 100) * videoPlayer.duration;
    progressBar.style.width = `${percentage}%`;
    customProgressBarDotIcon.style.left = `${percentage - 1}%`
    progressBar.setAttribute('aria-valuenow', percentage)
});
// 1. playback speed
playbackSpeed.addEventListener('change', function (e) {
    videoPlayer.playbackRate = e.target.value;
})


// Dragging Variables
let isDragging = false;
let startX;

// Recorded Data
let recordedData = [];

// Start Cropper Button
startCropperButton.addEventListener('click', () => {
    isCropperEnabled = true
    const [widthRatio, heightRatio] = aspectRatio.value.split(':').map(Number);
    console.log(widthRatio, heightRatio)
    cropper.style.display = 'block';
    cropper.style.height = `${videoPlayer.offsetHeight}px`; // Set height to 100% of video
    cropper.style.width = `${(widthRatio * videoPlayer.offsetWidth) / (2 * heightRatio)}px`; // Default width (50% of video width)
    cropper.style.left = '0px'; // Align to left initially
    cropper.style.top = '0px'; // Align to top initially

    // Set up canvas dimensions for real-time preview

    showPreview()



    startCropperButton.style.opacity = 0.5
    removeCropperButton.style.opacity = 1
    generatePreviewButton.style.opacity = 1
});

// Remove Cropper Button
removeCropperButton.addEventListener('click', () => {
    cropper.style.display = 'none';
    previewPlaceholder.innerHTML =
        `  <div class="text-center preview-card-wrapper">
                            <!-- Preview Card -->
                            <div class="preview-card">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                                    class="bi bi-play-btn" viewBox="0 0 16 16">
                                    <path
                                        d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                                    <path
                                        d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                                </svg>
                            </div>
                            <!-- Message -->
                            <p class="preview-text">
                                <span>Preview not available </span><br>
                                Please click on "Start Cropper" and then play video
                            </p>
                        </div>`;
    startCropperButton.style.opacity = 1
    removeCropperButton.style.opacity = 0.5
    generatePreviewButton.style.opacity = 0.5

});

// Aspect Ratio Change
aspectRatio.addEventListener('change', () => {
    // if cropper not enabled don't show on the video
    if (!isCropperEnabled)
        return
    const [widthRatio, heightRatio] = aspectRatio.value.split(':').map(Number);
    console.log('videoPlayer.offsetWidth is ', videoPlayer.offsetWidth)
    const newWidth = (videoPlayer.offsetWidth * widthRatio) / (2 * heightRatio);
    console.log('newWidth is', newWidth)
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
let isResizing = false;
let startWidth;
document.querySelectorAll(".resize-handle").forEach(handle => {
    handle.addEventListener("mousedown", function (e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = cropper.offsetWidth;
        let isLeft = this.classList.contains("resize-left");

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", () => {
            isResizing = false;
            document.removeEventListener("mousemove", resize);
        });

        function resize(e) {
            if (!isResizing) return;
            let diff = e.clientX - startX;
            console.log('diff is ', diff);

            let newWidth = isLeft ? startWidth - diff : startWidth + diff;
            console.log('isLeft is ', isLeft);
            console.log('newWidth is ', newWidth)

            if (newWidth > minWidthConstraint) { // Minimum width constraint
                cropper.style.width = Math.min(newWidth - cropper.offsetLeft, videoPlayer.offsetWidth - cropper.offsetLeft) + "px";
                if (isLeft) {
                    console.log('cropper.offsetLeft ', cropper.offsetLeft)
                    console.log('diff ', diff)
                    cropper.style.left = Math.max(0, cropper.offsetLeft - diff) + "px";
                }
            }
            showPreview()
        }
    }
    );
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let newX = e.clientX - startX;

    // Ensure cropper stays within the video container horizontally
    newX = Math.max(0, Math.min(newX, videoPlayer.offsetWidth - parseInt(cropper.style.width)));
    if (!isResizing) cropper.style.left = `${newX}px`;
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
        // console.log('x and y is', x, ' : ', y)
        // console.log('width is ', width)
        // console.log('height is ', height)

        // Draw the cropped portion of the video onto the canvas
        previewContext.drawImage(
            videoPlayer,
            x * (videoPlayer.videoWidth / videoPlayer.offsetWidth),
            y * (videoPlayer.videoHeight / videoPlayer.offsetHeight),
            width * (videoPlayer.videoWidth / videoPlayer.offsetWidth),
            height * (videoPlayer.videoHeight / videoPlayer.offsetHeight),
            0, 0, width, height
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


// helper functions

function formatDuration(totalSeconds) {
    console.log('totalSeconds ', totalSeconds)
    const hours = Math.floor(totalSeconds / 3600) || '00';
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = (totalSeconds % 60).toFixed(0);

    return `${hours}:${minutes}:${seconds}`;
}

function showPreview() {
    if (isVideoPlayed && isCropperEnabled) {
        // Append the canvas to the preview section
        previewPlaceholder.innerHTML = ''; // Clear placeholder text
        previewPlaceholder.appendChild(previewCanvas);

        previewCanvas.width = cropper.offsetWidth;
        previewCanvas.height = cropper.offsetHeight;
    }

}