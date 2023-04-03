const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const axios = require('axios');
const client_id = 'f628372c7d1747958feacff02d0d5194';
const client_secret = 'f7f472b1900b4d368e603b93d0c41db9';

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
    const limit = 50; // Maximum limit allowed by Spotify API
    let offset = 0;
    let allPlaylists = [];

    while (true) {
      const response = await axios.get(`https://api.spotify.com/v1/users/${req.params.userId}/playlists`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          limit,
          offset,
        },
      });

      allPlaylists.push(...response.data.items);

      if (response.data.items.length < limit) {
        break;
      }

      offset += limit;
    }

    res.json({ items: allPlaylists });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching playlists');
  }
});

app.get('/playlists/:userId/:playlistId', async (req, res) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${req.params.playlistId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching playlist details');
  }
});
