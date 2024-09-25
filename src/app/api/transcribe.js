

const DEEPGRAM_API_KEY = "";

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: req.body, // Forward the body received from the client
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Error forwarding request to Deepgram:', error);
      res.status(500).json({ error: 'Failed to connect to Deepgram' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
