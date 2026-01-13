import axios from 'axios';

const BASE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';

export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number,
) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude,
        longitude,
        localityLanguage: 'en',
      },
    });

    const data = response.data;

    return {
      city: data.city || data.locality || null,
      state: data.principalSubdivision || null,
      country: data.countryName || null,
      countryCode: data.countryCode || null,
    };
  } catch (error) {
    console.error('Location fetch error:', error.message);

    throw new Error('Failed to fetch location from coordinates');
  }
}
