require('dotenv').config();

const express = require('express');
const app = express();
const axios = require('axios');
const cache = require('memory-cache');

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const cache_duration = parseInt(process.env.CACHE_DURATION) || 10 * 60 * 1000;
let access_token;

const getAccessToken = async () => {
  try {
    const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
        grant_type: 'client_credentials',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
      },
    });
    access_token = response.data.access_token;
  } catch (error) {
    console.error(error);
  }
};

const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

getAccessToken();

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/playlists/:userId', async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.toLowerCase() : '';

    const cacheKey = `playlists-${req.params.userId}-${search}`;
    const cachedPlaylists = cache.get(cacheKey);

    if (cachedPlaylists) {
      res.json({ items: cachedPlaylists });
      return;
    }

    const limit = 50;
    let offset = 0;
    let allPlaylists = [];

    while (true) {
      const response = await retry(async () => {
        const res = await axios.get(`https://api.spotify.com/v1/users/${req.params.userId}/playlists`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            limit,
            offset,
          },
        });

        if (res.status === 429) {
          throw new Error('Rate limited');
        }

        return res;
      });

      console.log('Fetched playlists:', response.data.items);

      allPlaylists.push(...response.data.items);

      if (response.data.items.length < limit) {
        break;
      }

      offset += limit;
    }

    const filteredPlaylists = allPlaylists.filter((playlist) => {
      return (
        playlist.name.toLowerCase().includes(search) ||
        playlist.description.toLowerCase().includes(search)
        );
    });

    console.log('Returning all playlists:', allPlaylists);
    cache.put(cacheKey, filteredPlaylists, cache_duration); // Cache for cache_duration
    res.json({ items: filteredPlaylists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching playlists', details: error.message });
  }
});

app.get('/playlists/:userId/:playlistId', async (req, res) => {
  try {
    const cacheKey = `playlist-${req.params.playlistId}`;
    const cachedPlaylist = cache.get(cacheKey);

    if (cachedPlaylist) {
      res.json(cachedPlaylist);
      return;
    }

    const response = await retry(async () => {
      const res = await axios.get(`https://api.spotify.com/v1/playlists/${req.params.playlistId}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (res.status === 429) {
        throw new Error('Rate limited');
      }

      return res;
    });

    cache.put(cacheKey, response.data, cache_duration); // Cache for cache_duration
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching playlist details');
  }
});
