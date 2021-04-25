const cors = require('cors'),
    express = require('express'),
    mongoose = require('mongoose');

const app = express()

app.use(express.json())
app.use(cors());

mongoose.connect('mongodb+srv://admin:admin@iig-test.3qnwx.mongodb.net/iig-test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
mongoose.connection.on('error', err => {
    console.error('MongoDB connecting error', err)
})

require('./config/passport');

app.use(require('./routes'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('running on port %s', port)
})
