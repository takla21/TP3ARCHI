const express = require('express');
const router = express.Router();

const path = require('path');

const settings = require(path.join(DOCUMENT_ROOT, 'lib', 'settings'));

/* redirect home page. */
router.get('/', function(req, res, next) {
    
});

module.exports = router;

