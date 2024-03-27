const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Nitin@2004',
    database: 'calendar_app',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use("/", async (req, res, next) => {
    next();
});

app.post('/submit-form', (req, res) => {
    const { date, event, color } = req.body;
    const sql = 'INSERT INTO addevents (date, event, color) VALUES (?, ?, ?)';
    connection.query(sql, [date, event, color], (err, result) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
            res.status(500).json({ error: 'Error inserting data into MySQL' });
            return;
        }
        console.log('Data inserted into MySQL');
        res.status(200).json({ message: 'Data inserted into MySQL' });
    });
});

app.get('/events', (req, res) => {
    const sql = 'SELECT * FROM addevents;';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data from MySQL:', err);
            res.status(500).send('Error retrieving data from MySQL');
        } else {
            console.log('Data retrieved from MySQL:', results);
            res.json(results);
        }
    });
});
app.put('/drop-event/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    console.log("🚀 ~ app.put ~ eventId:", eventId)
    const { date, event, color } = req.body;
    const sql = 'UPDATE addevents SET date = ?, event = ?, color = ? WHERE id = ?';
    connection.query(sql, [date, event, color, eventId], (err, result) => {
        if (err) {
            console.error('Error updating event in MySQL:', err);
            res.status(500).json({ error: 'Error updating event in MySQL' });
        } else {
            console.log('Event updated in MySQL');
            console.log(result);
            res.status(200).json({ message: 'Event updated in MySQL' });
        }
    });
});

app.delete('/delete-event/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    console.log("🚀 ~ app.delete ~ eventId:", eventId);

    const sql = 'DELETE FROM addevents WHERE id = ?';
    connection.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error('Error deleting event from MySQL:', err);
            res.status(500).json({ error: 'Error deleting event from MySQL' });
        } else {
            if (result.affectedRows > 0) {
                console.log('Event deleted from MySQL');
                res.status(200).json({ message: 'Event deleted from MySQL' });
            } else {
                console.log('Event with specified ID not found');
                res.status(404).json({ error: 'Event not found' });
            }
        }
    });
});

app.get('/fetch-event/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    const sql = 'SELECT * FROM addevents WHERE id = ?';
    connection.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error('Error fetching event from MySQL:', err);
            res.status(500).json({ error: 'Error fetching event from MySQL' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        const eventData = result[0];
        res.status(200).json(eventData);
    });
});

app.put('/update-event/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    const { date, event, color } = req.body;
    const sql = 'UPDATE addevents SET date = ?, event = ?, color = ? WHERE id = ?';
    connection.query(sql, [date, event, color, eventId], (err, result) => {
        if (err) {
            console.error('Error updating event in MySQL:', err);
            res.status(500).json({ error: 'Error updating event in MySQL' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        console.log('Event updated in MySQL');
        res.status(200).json({ message: 'Event updated in MySQL' });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});