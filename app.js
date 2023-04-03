const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const axios = require('axios');
<<<<<<< HEAD
const client_id = 'f628372c7d1747958feacff02d0d5194';
const client_secret = 'f7f472b1900b4d368e603b93d0c41db9';
=======
const retry = require('async-retry');

const client_id = '34485ef4edc945dbbebd753dd87ec5ed';
const client_secret = 'e8270cd5e2af4c8e8ea423158f9e04b9';
>>>>>>> ec831aa8106834f24aa3fa945f9031718d101270

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

getAccessToken();

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/playlists/:userId', async (req, res) => {
  try {
    const limit = 50;
    let offset = 0;
    let allPlaylists = [];

    const search = req.query.search ? req.query.search.toLowerCase() : '';

    const filteredPlaylists = allPlaylists.filter((playlist) => {
      return (
        playlist.name.toLowerCase().includes(search) ||
        playlist.description.toLowerCase().includes(search)
      );
    });

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

    console.log('Returning all playlists:', allPlaylists);
    res.json({ items: filteredPlaylists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching playlists', details: error.message });
  }
});


app.get('/playlists/:userId/:playlistId', async (req, res) => {
  try {
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

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching playlist details');
  }
});
