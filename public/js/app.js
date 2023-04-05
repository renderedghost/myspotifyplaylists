const userId = '111112791';
const playlistsContainer = document.getElementById('playlists-container');
const searchInput = document.getElementById('search');
const loadingMessage = document.getElementById('loading-message');
const resetButton = document.getElementById('reset-button');

let playlists = [];

const fetchPlaylists = async (search = '', offset = 0) => {
  loadingMessage.style.display = 'block'; // Show the loading message
  try {
    const response = await fetch(`/playlists/${userId}?search=${search}&offset=${offset}`);
    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Error fetching playlists:', errorDetails);
      throw new Error('Error fetching playlists');
    }
    
    playlists = await response.json();

    console.log('Received playlists:', playlists);

    const batchSize = 10;
    const batchedPlaylistDetailsPromises = [];

    for (let i = 0; i < playlists.items.length; i += batchSize) {
      const batch = playlists.items.slice(i, i + batchSize);
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

    playlists.items = await Promise.all(batchedPlaylistDetailsPromises);
    console.log('Processed playlists:', playlists);
    displayPlaylists(playlists);
  } catch (error) {
    console.error(error);
  }
  
  if (search !== '') {
    resetButton.style.display = 'inline-block';
  } else {
    resetButton.style.display = 'none';
  }

  loadingMessage.style.display = 'none'; // Hide the loading message
};


const displayPlaylists = (playlists) => {
  playlistsContainer.innerHTML = '';

  // Sort playlists by title in ascending order
  playlists.items.sort((a, b) => a.name.localeCompare(b.name));

  const counter = document.getElementById('playlist-counter');
  counter.textContent = `Showing ${playlists.items.length} playlists`;

  playlists.items.forEach((playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.className = 'playlist';
    playlistElement.innerHTML = `
    <img class="playlist-img" src="${playlist.images[0].url}" alt="${playlist.name} cover art">
    <p class="label primary title">${playlist.name}</p>
    <p class="label secondary">${playlist.tracks.total} songs</p>
    <p class="label secondary">${playlist.followers.total} followers</p>
    <p class="label secondary clamp">${playlist.description || ''}</p>
    `;

    playlistsContainer.appendChild(playlistElement);

    const coverArt = playlistElement.querySelector('.playlist-img');
    coverArt.addEventListener('click', (event) => {
      event.stopPropagation();
      const overlay = document.getElementById('overlay');
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

      overlay.classList.remove('hidden');
    });
  });
};

const closeOverlay = document.getElementById('close-overlay');
closeOverlay.addEventListener('click', () => {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
});


const searchPlaylists = (query) => {
  playlistsContainer.innerHTML = '';
  fetchPlaylists(query);
};

const sortPlaylists = () => {
  playlists.items.sort((a, b) => a.name.localeCompare(b.name));
  displayPlaylists(playlists);
};

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchPlaylists(event.target.value);
  }
});

console.log('resetButton:', resetButton);
console.log('searchInput:', searchInput);

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

fetchPlaylists();