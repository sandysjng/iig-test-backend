const express = require('express'),
    router = express.Router();

router.use('/api/user', require('./users'));

router.use((_, res) => {
    res.status(404).json({ error: 'Not found' })
});

module.exports = router