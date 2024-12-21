import React, { useEffect, useState } from 'react';
import './styles/App.css';


function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch data from the back-end
        fetch('/api/message')
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1 class="hello">React and Express</h1>
            <p>{message}</p>
        </div>
    );
}

export default App;
