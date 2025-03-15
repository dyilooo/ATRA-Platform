export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
  
    try {
      const response = await fetch('https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8', {
        headers: {
          'x-apikey': apiKey
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }
  
      // If we get here, the API key is valid
      const data = await response.json(); // Parse the response data
      return res.status(200).json(data); // Send the data back to the client
    } catch (error) {
      console.error('Error checking API key:', error);
      return res.status(500).json({ error: 'Failed to check API key' });
    }
  }