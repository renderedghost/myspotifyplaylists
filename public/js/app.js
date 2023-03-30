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
  const counter = document.getElementById('playlist-counter');
  counter.textContent = `${playlists.items.length} results`;

  playlistsContainer.innerHTML = '';
  playlists.items.forEach((playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.className = 'playlist';
    playlistElement.innerHTML = `
      <img class="playlist-img" src="${playlist.images[0].url}" alt="${playlist.name} cover art">
      <p class="playlist-title">${playlist.name}</p>
    `;
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
