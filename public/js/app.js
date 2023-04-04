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
		<p class="playlist-title">${playlist.name}</p>
		<p class="playlist-tracks">${playlist.tracks.total} songs</p>
		<p class="playlist-followers">${playlist.followers?.total || 0} followers</p>
		<p class="playlist-description">${playlist.description || ''}</p>
		`;

		playlistElement.onclick = () => window.open(playlist.external_urls.spotify, '_blank');
		playlistsContainer.appendChild(playlistElement);
	});
};

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