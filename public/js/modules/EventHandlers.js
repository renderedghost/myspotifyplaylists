import { DataFetcher } from './DataFetcher.js';
import { UIManager } from './UIManager.js';

export const EventHandlers = (() => {
    const searchInput = document.getElementById('search');
    const resetButton = document.getElementById('reset-button');
    const closeOverlay = document.getElementById('close-overlay');
    const overlayBackground = document.getElementById('overlay-background');
    const openWebButton = document.getElementById('open-web');
    const copyUrlButton = document.getElementById('copy-url');

    const onSearchInputKeyDown = async (event) => {
        if (event.key === 'Enter') {
            UIManager.toggleLoadingMessage(true);
            try {
                const playlists = await DataFetcher.fetchPlaylists(event.target.value);
                UIManager.displayPlaylists(playlists);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            } finally {
                UIManager.toggleLoadingMessage(false);
            }
        }
    };

    const onResetButtonClick = async () => {
        searchInput.value = '';
        UIManager.updateResetButton('');
        UIManager.toggleLoadingMessage(true);
        try {
            const playlists = await DataFetcher.fetchPlaylists();
            UIManager.displayPlaylists(playlists);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            UIManager.toggleLoadingMessage(false);
        }
    };

    const onCloseOverlayClick = () => {
        const overlay = document.getElementById('overlay-background');
        overlay.classList.add('hidden');
    };

    const onOverlayBackgroundClick = (event) => {
        if (event.target === event.currentTarget) {
            overlayBackground.classList.add('hidden');
        }
    };

    const onOpenWebButtonClick = () => {
        const playlistId = openWebButton.getAttribute('data-playlist-id');
        const webUrl = `https://open.spotify.com/playlist/${playlistId}`;
        window.open(webUrl, '_blank');
    };

    const onCopyUrlButtonClick = () => {
        const player = document.getElementById('spotify-player');
        const textarea = document.createElement('textarea');
        textarea.value = player.src;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Playlist URL copied to clipboard');
    };

    // Initialize all event listeners
    const initEventListeners = () => {
        searchInput.addEventListener('keydown', onSearchInputKeyDown);
        resetButton.addEventListener('click', onResetButtonClick);
        closeOverlay.addEventListener('click', onCloseOverlayClick);
        overlayBackground.addEventListener('click', onOverlayBackgroundClick);
        openWebButton.addEventListener('click', onOpenWebButtonClick);
        copyUrlButton.addEventListener('click', onCopyUrlButtonClick);
        // Additional event listeners can be added here as needed
    };

    return {
        initEventListeners
    };
})();
