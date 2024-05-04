const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const notFound = require('./middleware/not-found');
const morgan = require('morgan');
const usersR = require('./routes/usersRoute');
const plantsR = require('./routes/platnsRoute');
const familyR = require('./routes/familiesRoute');
const locationR = require('./routes/locationRoute');
const methodR = require('./routes/methodRoute');
const app = express();

app.use(morgan('dev'));

app.use(cors());

app.use(express.static('/public'));
app.use(express.json());

app.use('/api/users', usersR)
app.use('/api/plants', plantsR)
app.use('/api/families', familyR)
app.use('/api/locations', locationR)
app.use('/api/methods', methodR)

app.use(errorHandler);
app.use(notFound);

module.exports = app;