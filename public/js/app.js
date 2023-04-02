const userId = '111112791';
const playlistsContainer = document.getElementById('playlists-container');
const searchInput = document.getElementById('search');

let playlists = [];

const fetchPlaylists = async () => {
  try {
    const response = await fetch(`/playlists/${userId}`);
    playlists = await response.json();

    const playlistDetailsPromises = playlists.items.map(async (playlist) => {
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

    playlists.items = await Promise.all(playlistDetailsPromises);
    displayPlaylists(playlists);
  } catch (error) {
    console.error(error);
  }
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
    <p class="playlist-followers">${playlist.followers.total} followers</p>
    <p class="playlist-description">${playlist.description || ''}</p>
    `;

    playlistElement.onclick = () => window.open(playlist.external_urls.spotify, '_blank');
    playlistsContainer.appendChild(playlistElement);
  });
};


const searchPlaylists = (query) => {
  const queryLowerCase = query.toLowerCase();
  const filteredPlaylists = {
    items: playlists.items.filter((playlist) =>
      playlist.name.toLowerCase().includes(queryLowerCase) || playlist.fullDescription.toLowerCase().includes(queryLowerCase)
    ),
  };
  displayPlaylists(filteredPlaylists);
};


const sortPlaylists = () => {
  playlists.items.sort((a, b) => a.name.localeCompare(b.name));
  displayPlaylists(playlists);
};

searchInput.addEventListener('input', (event) => {
  searchPlaylists(event.target.value);
});

fetchPlaylists();
