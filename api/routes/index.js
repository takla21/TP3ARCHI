const express = require('express');
const router = express.Router();

const path = require('path');

const settings = require(path.join(DOCUMENT_ROOT, 'lib', 'settings'));

router.get('/facture', function(req, res, next) {
    const factures = [{}]; //hardcoded
    res.json(factures)
});

router.put('/facture', function(req, res, next) {
    
});

router.post('/facture', function(req, res, next) {
    
});

router.delete('/facture', function(req, res, next) {
    
});

module.exports = router;

