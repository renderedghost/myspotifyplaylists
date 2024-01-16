// UIManager.js
export const UIManager = (() => {
    const playlistsContainer = document.getElementById('playlists-container');
    const loadingMessage = document.getElementById('loading-message');
    const resetButton = document.getElementById('reset-button');

    const toggleLoadingMessage = (show) => {
        loadingMessage.style.display = show ? 'block' : 'none';
    };

    const updateResetButton = (search) => {
        resetButton.style.display = search !== '' ? 'inline-block' : 'none';
    };

    const displayPlaylists = (playlists) => {
        while (playlistsContainer.firstChild) {
            playlistsContainer.removeChild(playlistsContainer.firstChild);
        }

        playlists.sort((a, b) => a.name.localeCompare(b.name));

        const counter = document.getElementById('playlist-counter');
        counter.textContent = `Showing ${playlists.length} playlists`;

        playlists.forEach((playlist) => {
            const playlistElement = document.createElement('div');
            playlistElement.className = 'playlist flex lay--column lay--gap-small-xx';
            playlistElement.innerHTML = `
            <img class="playlist-img" src="${playlist.images[0]?.url || ''}" alt="${playlist.name} cover art">
            <h2 class="text-name-playlist clamp-1">${playlist.name}</h2>
            <div class="flex lay--row lay--gap-small-x lay--align-center">
                <p class="text-desc-playlist secondary">${(playlist.tracks?.total || 0)} songs</p>
                <p class="text-desc-playlist secondary">&#124;</p>
                <p class="text-desc-playlist secondary">${(playlist.followers?.total || 0)} followers</p>
            </div>
            <p class="text-desc-playlist secondary clamp-2">${playlist.description || ''}</p>
            `;

            playlistsContainer.appendChild(playlistElement);

            // Additional logic for playlist interaction can be added here
        });
    };

    const updateOverlay = (playlist) => {
        // Logic to update overlay with playlist details
        // This needs to be implemented based on your specific requirements
    };

    return {
        toggleLoadingMessage,
        updateResetButton,
        displayPlaylists,
        updateOverlay
    };
})();
