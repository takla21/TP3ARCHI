const express = require('express');
const router = express.Router();

const path = require('path');

const BD = require(path.join(DOCUMENT_ROOT, "model", "database_connect"));
const spark = require(path.join(DOCUMENT_ROOT, "model", "spark_connect"));
const hypermedia = require(path.join(DOCUMENT_ROOT, "model", "hypermedia"));

//API entry point
router.get("", function(req, res, next) {
    res.json({
        __hypermedia : [
            {
                uri : "/facture",
                method : "GET",
                description : "voir la listes des factures"
            },
            {
                uri : "/facture",
                method : "POST",
                description : "ajouter une facture"
            },
            {
                uri : "/requete-produit-frequent",
                method : "POST",
                description : "Dépose une requête de calcul des produits fréquents"
            }
        ]
    })
});


router.get('/facture', function(req, res, next) {
    BD.get("facture").then(factures => {
        const hypermediaFacture = factures.map(f => {
            f.__hypermedia = hypermedia.createFactureHypermedia(f._id);
            return f;
        })
        res.json({
            result : hypermediaFacture,
            _h : []
        });
    })
});

router.post('/facture', function(req, res, next) {
    BD.create("facture", req.body).then(fact => {
        res.json({
            result : fact,
            __hypermedia : hypermedia.createFactureHypermedia(fact._id)
        });
    }).catch(err => {
        next(err);
    })
});

router.put('/facture/:id', function(req, res, next) {
    BD.replace("facture", req.params.id, req.body).then(result => {
        res.json({
            result : result,
            __hypermedia : hypermedia.createFactureHypermedia(req.params._id)
        })
    })
});

router.delete('/facture/:id', function(req, res, next) {
    BD.remove("facture", req.params.id).then(result => {
        res.json({
            result : result,
            __hypermedia : hypermedia.createFactureHypermedia(req.params._id)
        })
    })
});

router.post("/requete-produit-frequent", function(req, res, next) {
    //1. verify if creating process is in progress
    //2. if yes, return id of current process
    //3. if no, create id, send it, and start process.
    
    spark.createRequest().then(id => {
        res.json({
            __hypermedia : [
                {
                    uri : `/produit-frequent/${id}`,
                    method : "GET",
                    description : "acceder au résultat de la recherche des produits fréquent"
                }
            ]
        })
    })
})

router.get("/produit-frequent/requete-status/:reqid", function(req, res, next) {
    //retourne le progrès de la requête. donc :
    //if process is in progress
    //return : % of completion (if available). status : 200. 
    //id process finished
    //return : uri to get product. status : 200.
})

router.get("/produit-frequent/requete-data/:reqid", function(req, res, next) {
    //si la requête n'es pas prête : 404.
    //si la requête est prête : résultat.
})


//abort une requête
router.delete("/requete-produit-frequent/:reqid", function(req, res, next) {
   
})

//abort toute les requête
router.delete("/requete-produit-frequent", function(req, res, next) {

})

module.exports = router;

