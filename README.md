# Barry's Playlist App

Barry's Playlist App is a Spotify playlist app that provides weekly curated playlists for every genre and mood, as well as deep dives on artist's back catalogues. With this app, you'll be able to discover new music and artists that you might not have found otherwise.

## Features

* Weekly curated playlists for every genre and mood
* Deep dives on artist's back catalogues

## Getting Started

1. Clone the repository to your local machine.

2. Create a new Spotify App at the Spotify Developer Dashboard.

3. Add http://localhost:3000/callback as a Redirect URI in your Spotify App settings.

4. Copy the Client ID and Client Secret from your Spotify App settings and add them, along with a cache duration to a `.env` file at the root of the project:
   
```
CLIENT_ID=<your-client-id>
CLIENT_SECRET=<your-client-secret>
CACHE_DURATION=<your cache duration in MS>
```

5. Install the required packages using `npm install`.

6. Start the development server using `npm start`.

7. Visit http://localhost:3000 in your web browser to use the app.

## Contributing

Contributions are always welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository.

## License

This project is licensed under the MIT License.