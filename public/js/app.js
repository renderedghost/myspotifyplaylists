const userId = '111112791';
const playlistsContainer = document.getElementById('playlists-container');
const searchInput = document.getElementById('search');
const loadingMessage = document.getElementById('loading-message');
const resetButton = document.getElementById('reset-button');
const openWebButton = document.getElementById('open-web');
const openAppButton = document.getElementById('open-app');
const copyUrlButton = document.getElementById('copy-url');

let playlists = [];

const toggleLoadingMessage = (show) => {
  loadingMessage.style.display = show ? 'block' : 'none';
};

const updateResetButton = (search) => {
  resetButton.style.display = search !== '' ? 'inline-block' : 'none';
};

const fetchPlaylists = async (search = '', offset = 0) => {
  toggleLoadingMessage(true);

  try {
    const cacheKey = `playlists-${userId}-${search}-${offset}`;
    const cachedPlaylists = localStorage.getItem(cacheKey);

    if (cachedPlaylists) {
      console.log('Using cached playlists');
      displayPlaylists(JSON.parse(cachedPlaylists));
    } else {
      const response = await fetch(`/playlists/${userId}?search=${search}&offset=${offset}`);
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error fetching playlists:', errorDetails);
        throw new Error('Error fetching playlists');
      }

      const fetchedPlaylists = await response.json();
      console.log('Received playlists:', fetchedPlaylists);


      const batchSize = 20;
      const batchedPlaylistDetailsPromises = [];

      for (let i = 0; i < fetchedPlaylists.items.length; i += batchSize) {
        const batch = fetchedPlaylists.items.slice(i, i + batchSize);
        const batchPromises = batch.map(async (playlist) => {
          try {
            const detailsResponse = await fetch(`/playlists/${userId}/${playlist.id}`);
            const playlistDetails = await detailsResponse.json();
            return {
              ...playlist,
              fullDescription: playlistDetails.description || '',
              followers: playlistDetails.followers || { total: 0 },
            };
          } catch (error) {
            console.error(error);
            return {
              ...playlist,
              fullDescription: playlist.description || '',
              followers: { total: 0 },
            };
          }
        });

        batchedPlaylistDetailsPromises.push(...batchPromises);
      }

      fetchedPlaylists.items = await Promise.all(batchedPlaylistDetailsPromises);
      console.log('Processed playlists:', fetchedPlaylists);

      // Store the fetched playlists in localStorage
      localStorage.setItem(cacheKey, JSON.stringify(fetchedPlaylists));

      displayPlaylists(fetchedPlaylists);
    }
  } catch (error) {
    console.error(error);
  }

  updateResetButton(search);
  toggleLoadingMessage(false);
};


const displayPlaylists = (playlists) => {
  while (playlistsContainer.firstChild) {
    playlistsContainer.removeChild(playlistsContainer.firstChild);
  }

  playlists.items.sort((a, b) => a.name.localeCompare(b.name));

  const counter = document.getElementById('playlist-counter');
  counter.textContent = `Showing ${playlists.items.length} playlists`;

  playlists.items.forEach((playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.className = 'playlist';
    playlistElement.innerHTML = `
    <img class="playlist-img" src="${playlist.images[0]?.url || ''}" alt="${playlist.name} cover art">
    <p class="label primary title clamp-1">${playlist.name}</p>
    <div class="row slim">
      <p class="label secondary">${(playlist.tracks?.total || 0)} songs</p>
      <p class="label secondary">&#124;</p>
      <p class="label secondary">${(playlist.followers?.total || 0)} followers</p>
    </div>
    <p class="label mid clamp-2">${playlist.description || ''}</p>
    `;

    playlistsContainer.appendChild(playlistElement);

    const coverArt = playlistElement.querySelector('.playlist-img');
    coverArt.addEventListener('click', (event) => {
      event.stopPropagation();
      const overlay = document.getElementById('overlay-background');
      const player = document.getElementById('spotify-player');
      const overlayTitle = document.getElementById('overlay-playlist-title');
      const overlayTracks = document.getElementById('overlay-playlist-tracks');
      const overlayFollowers = document.getElementById('overlay-playlist-followers');
      const overlayDescription = document.getElementById('overlay-playlist-description');

      player.src = `https://open.spotify.com/embed/playlist/${playlist.id}`;
      overlayTitle.textContent = playlist.name;
      overlayTracks.textContent = `${playlist.tracks.total} songs`;
      overlayFollowers.textContent = `${playlist.followers.total} followers`;
      overlayDescription.textContent = playlist.description || '';
      openWebButton.setAttribute('data-playlist-id', playlist.id);
      overlay.classList.remove('hidden');
    });
  });
};

const closeOverlay = document.getElementById('close-overlay');
closeOverlay.addEventListener('click', () => {
  const overlay = document.getElementById('overlay-background');
  overlay.classList.add('hidden');
});

const overlay = document.getElementById('overlay-background');
overlay.addEventListener('click', (event) => {
  event.stopPropagation();
});

const overlayBackground = document.getElementById('overlay-background');
overlayBackground.addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    overlayBackground.classList.add('hidden');
  }
});

const searchPlaylists = (query) => {
  playlistsContainer.innerHTML = '';
  searchQuery = query;
  fetchPlaylists(query);
};

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchPlaylists(event.target.value);
  }
});

resetButton.addEventListener('click', () => {
  searchInput.value = '';
  resetButton.style.display = 'none';
  fetchPlaylists();
});

let isLoading = false;
let searchQuery = '';

window.addEventListener('scroll', async () => {
  if (isLoading || (window.innerHeight + window.scrollY) < document.body.offsetHeight - 500) {
    return;
  }

  isLoading = true;
  const currentPlaylistsCount = playlistsContainer.childElementCount;
  await fetchPlaylists(searchQuery, currentPlaylistsCount);
  isLoading = false;
});

openWebButton.addEventListener('click', () => {
  const playlistId = openWebButton.getAttribute('data-playlist-id');
  const webUrl = `https://open.spotify.com/playlist/${playlistId}`;
  window.open(webUrl, '_blank');
});


copyUrlButton.addEventListener('click', () => {
  const player = document.getElementById('spotify-player');
  const textarea = document.createElement('textarea');
  textarea.value = player.src;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('Playlist URL copied to clipboard');
});

fetchPlaylists();

