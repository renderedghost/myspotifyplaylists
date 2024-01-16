export const DataFetcher = (() => {
    const userId = '111112791';

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
        let allFetchedPlaylists = [];

        try {
            const cacheKey = `playlists-${userId}`;
            const cachedPlaylists = localStorage.getItem(cacheKey);

            if (cachedPlaylists) {
                console.log('Using cached playlists');
                allFetchedPlaylists = JSON.parse(cachedPlaylists);
            } else {
                allFetchedPlaylists = await fetchAllPlaylists(userId);
                localStorage.setItem(cacheKey, JSON.stringify(allFetchedPlaylists));
            }

            const searchLowerCase = search.toLowerCase();

            const filteredPlaylists = allFetchedPlaylists.filter((playlist) =>
                playlist.name.toLowerCase().includes(searchLowerCase) ||
                (playlist.description && playlist.description.toLowerCase().includes(searchLowerCase))
            );
            return filteredPlaylists;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    return {
        fetchAllPlaylists,
        fetchPlaylists
    };
})();
