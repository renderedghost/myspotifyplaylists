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

let allFetchedPlaylists = [];

const fetchAllPlaylists = async (userId, offset = 0, fetchedPlaylists = []) => {
  try {
    const response = await fetch(`/playlists/${userId}?offset=${offset}`);
    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Error fetching playlists:', errorDetails);
      return [];
    }

    const newPlaylists = await response.json();
    console.log('Received playlists:', newPlaylists);

    fetchedPlaylists = fetchedPlaylists.concat(newPlaylists.items);

    if (newPlaylists.items.length === 50) {
      return await fetchAllPlaylists(userId, offset + 50, fetchedPlaylists);
    }

    return fetchedPlaylists;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
};

const fetchPlaylists = async (search = '') => {
  toggleLoadingMessage(true);

  try {
    if (allFetchedPlaylists.length === 0) {
      const cacheKey = `playlists-${userId}`;
      const cachedPlaylists = localStorage.getItem(cacheKey);

      if (cachedPlaylists) {
        console.log('Using cached playlists');
        allFetchedPlaylists = JSON.parse(cachedPlaylists);
      } else {
        allFetchedPlaylists = await fetchAllPlaylists(userId);
        localStorage.setItem(cacheKey, JSON.stringify(allFetchedPlaylists));
      }
    }

    const searchLowerCase = search.toLowerCase();

    const filteredPlaylists = allFetchedPlaylists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchLowerCase) ||
      (playlist.description && playlist.description.toLowerCase().includes(searchLowerCase))
    );
    displayPlaylists(filteredPlaylists);
    updateResetButton(search);
  } catch (error) {
    console.error(error);
  } finally {
    toggleLoadingMessage(false);
  }
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

const tooltipElements = document.querySelectorAll('.tooltip');
const tooltipContainer = document.getElementById('tooltip');

tooltipElements.forEach((element) => {
  element.addEventListener('mouseover', (event) => {
    tooltipContainer.textContent = event.target.getAttribute('data-tooltip');
    tooltipContainer.classList.add('visible');
  });

  element.addEventListener('mousemove', (event) => {
    tooltipContainer.style.left = event.pageX + 10 + 'px';
    tooltipContainer.style.top = event.pageY + 10 + 'px';
  });

  element.addEventListener('mouseout', () => {
    tooltipContainer.classList.remove('visible');
  });
});

const genreLinks = document.querySelectorAll('.genre-link');

genreLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const genre = event.target.getAttribute('data-genre');
    const searchInput = document.getElementById('search');
    searchInput.value = genre;
    searchPlaylists(genre);
  });
});

fetchPlaylists();

