const userId = '111112791';
const playlistsContainer = document.getElementById('playlists-container');
const searchInput = document.getElementById('search');
const sortBtn = document.getElementById('sort');

let playlists = [];

const fetchPlaylists = async () => {
  try {
    const response = await fetch(`/playlists/${userId}`);
    playlists = await response.json();
    displayPlaylists(playlists);
  } catch (error) {
    console.error(error);
  }
};

const displayPlaylists = (playlists) => {
  // Sort playlists by title in ascending order
  playlists.items.sort((a, b) => a.name.localeCompare(b.name));

  const counter = document.getElementById('playlist-counter');
  counter.textContent = `Showing ${playlists.items.length} playlists`;

  playlistsContainer.innerHTML = '';
  playlists.items.forEach(async (playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.className = 'playlist';
    playlistElement.innerHTML = `
    <img class="playlist-img" src="${playlist.images[0].url}" alt="${playlist.name} cover art">
    <p class="playlist-title">${playlist.name}</p>
    <p class="playlist-description">${playlist.description}</p>
    <p class="playlist-tracks">${playlist.tracks.total} songs</p>
    `;

  // Make an API request to get the playlist details
    try {
      const response = await fetch(`/playlists/${userId}/${playlist.id}`);
      const playlistDetails = await response.json();
      playlistElement.innerHTML += `
      <p class="playlist-followers">${playlistDetails.followers.total} followers</p>
      `;
    } catch (error) {
      console.error(error);
    }

    playlistElement.onclick = () => window.open(playlist.external_urls.spotify, '_blank');
    playlistsContainer.appendChild(playlistElement);
  });

};


const searchPlaylists = (query) => {
  const filteredPlaylists = {
    items: playlists.items.filter((playlist) =>
      playlist.name.toLowerCase().includes(query.toLowerCase())
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
