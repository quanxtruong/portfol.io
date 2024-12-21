const express = require('express');
const app = express();
const PORT = 3000;

// Define a simple API route
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
