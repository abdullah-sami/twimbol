import AsyncStorage from '@react-native-async-storage/async-storage';




// Base API Configuration
export const TWIMBOL_API_CONFIG = {
  // BASE_URL: "http://192.168.0.175:80",
  BASE_URL: "https://rafidabdullahsamiweb.pythonanywhere.com",
};


// Helper function to get headers with Authorization token

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('access');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};



// Helper function to refresh the access token
const refreshAccessToken = async () => {
  const refresh = await AsyncStorage.getItem('refresh');
  if (!refresh) {
    throw new Error('Refresh token not found. Please log in again.');
  }

  const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    await AsyncStorage.clear();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  await AsyncStorage.setItem('access', data.access);
  return data.access;
};

// Function to handle API requests with token refresh logic
const fetchWithTokenRefresh = async (url: string, options: RequestInit) => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    try {
      const newAccessToken = await refreshAccessToken();
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(url, { ...options, headers });
    } catch (error) {
      throw new Error('Failed to refresh token or retry request.');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${errorText}`);
  }

  return response;
};


// Login API
export const fetchLogin = async ({ username, password }: { username: string; password: string }) => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/user/login/`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};






// Register API
export const fetchRegister = async ({ username, email, password }: { username: string; email:string, password: string }) => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/user/api/register/`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username:username,
      email:email,
      password:password,
    }),
  });

  if (!response.ok) {
    console.log(response.statusText)
    throw new Error(`Failed to Register: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};







// Search API
export const fetchSearchResults = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${TWIMBOL_API_CONFIG.BASE_URL}/api/search?query=${encodeURIComponent(query)}`
    : `${TWIMBOL_API_CONFIG.BASE_URL}/api/search?query=asib`;

  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch search results: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};







// Posts API
export const fetchPostResults = async () => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/api/posts`;
  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};






export const fetchReelResults = async () => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/api/reels`;
  const headers = await getHeaders();

  const response = await fetchWithTokenRefresh(endpoint, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  return data.results;
};









// Reel Item API
export const fetchReelItem = async (post_id: string) => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/api/reels/${post_id}`;

  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reel: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};





// Notifications API
export const fetchNotifications = async () => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/api/notifications`;
  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }

  

  const data = await response.json();
  return data;
};






// User Profile API

export const fetchUserProfile = async () => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/user/api/profile`;
  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const data = await response.json();
  return data[0].user;


};









// Creator Application API

export const fetchCreatorApplication = async (user_id) => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/user/api/creator-application/`;
  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,

    body: JSON.stringify({
      user:user_id,
    }),


  });

  if (!response.ok) {
    throw new Error(`Failed to process application: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}


export const fetchCreatorApplicationStatus = async (user_id) => {
  const endpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/user/api/creator-application/by-user/${user_id}/`;
  const headers = await getHeaders();

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch application: ${response.statusText}`);
  }

  const data = await response.json();
  return data[0];
};






