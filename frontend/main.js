const urlInput = document.getElementById('url-input');
const fetchBtn = document.getElementById('fetch-btn');
const btnText = fetchBtn.querySelector('.btn-text');
const loader = fetchBtn.querySelector('.loader');
const preview = document.getElementById('video-preview');
const thumbnail = document.getElementById('video-thumbnail');
const title = document.getElementById('video-title');
const uploader = document.getElementById('video-uploader');
const duration = document.getElementById('video-duration');
const dlMp4 = document.getElementById('dl-mp4');
const dlMp3 = document.getElementById('dl-mp3');
const errorMsg = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Base URL for the backend API
const API_BASE = 'http://localhost:3001/api';

/**
 * Handles the "Extraire" button click to fetch video information.
 */
fetchBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Veuillez entrer une URL valide.');
        return;
    }

    // Reset and show loading state
    errorMsg.classList.add('hidden');
    preview.classList.add('hidden');
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE}/info?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Impossible de récupérer les informations de la vidéo.');
        }

        // Display video details
        thumbnail.src = data.thumbnail;
        title.textContent = data.title;
        uploader.textContent = data.uploader;
        duration.textContent = data.duration || '--:--';
        preview.classList.remove('hidden');

        // Configure download buttons
        dlMp4.onclick = () => startDownload(url, 'mp4');
        dlMp3.onclick = () => startDownload(url, 'mp3');

    } catch (err) {
        console.error('Fetch error:', err);
        showError(err.message);
    } finally {
        setLoading(false);
    }
});

/**
 * Toggles the loading state of the fetch button.
 */
function setLoading(loading) {
    if (loading) {
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        fetchBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
        fetchBtn.disabled = false;
    }
}

/**
 * Displays an error message to the user.
 */
function showError(msg) {
    errorText.textContent = msg;
    errorMsg.classList.remove('hidden');
}

/**
 * Redirects the user to the download endpoint.
 */
function startDownload(url, format) {
    const downloadUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&format=${format}`;

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
