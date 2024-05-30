const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;
const windowSize = 10; // Configurable window size

let numbersStore = [];

// Helper function to fetch numbers with a timeout
const fetchNumber = async (type) => {
    const source = axios.CancelToken.source();
    setTimeout(() => {
        source.cancel();
    }, 500); // 500 ms timeout

    try {
        const response = await axios.get(`http://example.com/api/${type}`, {
            cancelToken: source.token,
        });
        return response.data.number;
    } catch (error) {
        return null;
    }
};

// Helper function to calculate average
const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const newNumber = await fetchNumber(numberid);
    if (newNumber !== null && !numbersStore.includes(newNumber)) {
        if (numbersStore.length >= windowSize) {
            numbersStore.shift(); // Remove the oldest number
        }
        numbersStore.push(newNumber); // Add the new number
    }

    const prevState = [...numbersStore];
    const currState = numbersStore;
    const average = numbersStore.length === windowSize ? calculateAverage(numbersStore) : null;

    res.json({
        windowPrevState: prevState,
        windowCurrState: currState,
        average: average,
    });
});

app.listen(port, () => {
    console.log(`Average Calculator Microservice listening at http://localhost:${port}`);
});
