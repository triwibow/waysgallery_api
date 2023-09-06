require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

const routerV1 = require('./src/routes/routeV1');

app.use('/api/v1/', routerV1);

app.listen(port, () => console.log(`Listening on port ${port}`));