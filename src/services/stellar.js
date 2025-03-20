const fetchStellarData = async () => {
  try {
    const token = localStorage.getItem('stellar_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/stellar/servers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      
      // If token is expired, we should clear it
      if (response.status === 401) {
        localStorage.removeItem('stellar_token');
        throw new Error('Authentication required');
      }
      
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching Stellar data:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.details
    };
  }
};

export { fetchStellarData }; 