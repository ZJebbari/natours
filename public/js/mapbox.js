/* eslint-disable */
export const displayMap = async (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  // Initialize the map
  const map = new mapboxgl.Map({
    container: 'map', // HTML container id
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy', // Map style
    scrollZoom: false,
  });

  // Define the map bounds
  const bounds = new mapboxgl.LngLatBounds();

  // Function to fetch place name using coordinates
  const getPlaceName = async (coordinates) => {
    const [lng, lat] = coordinates;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.features[0]?.place_name || 'Unknown location';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Unknown location';
    }
  };

  // Loop through each location
  for (const loc of locations) {
    // Get the place name if description is missing
    const placeName = loc.description || (await getPlaceName(loc.coordinates));

    // Create a marker element
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker to the map
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup to the marker
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day || ''}: ${placeName}</p>`)
      .addTo(map);

    // Extend map bounds to include the location
    bounds.extend(loc.coordinates);
  }

  // Fit the map to the bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
