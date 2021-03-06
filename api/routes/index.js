const express = require('express');
const router = express.Router();

const path = require('path');

const BD = require(path.join(DOCUMENT_ROOT, "model", "database_connect"));
const spark = require(path.join(DOCUMENT_ROOT, "model", "spark_connect"));
const hypermedia = require(path.join(DOCUMENT_ROOT, "model", "hypermedia"));

const verifyAndParseFacture = require(path.join(DOCUMENT_ROOT, "model", "facture_model"))

//API entry point
router.get("", function(req, res, next) {
    res.json({
        description : "",
        __hypermedia : [
            {
                uri : "/facture",
                method : "GET",
                description : "voir la listes des factures"
            },
            {
                uri : "/facture",
                method : "POST",
                description : "Ajouter une facture"
            },
            {
                uri : "/requete-produit-frequent",
                method : "POST",
                description : "Déposer une requête de calcul des produits fréquents"
            }
        ]
    })
});

router.get('/facture', function(req, res, next) {
    BD.get("cycling.facture").then(factures => {
        const hypermediaFacture = (factures || []).map(f => {
            f.__hypermedia = hypermedia.createFactureHypermedia(f.id);
            return f;
        });
        res.json({
            message : "Liste des factures",
            result : hypermediaFacture,
            resultIsHypermediaList : true, //So the client know the structure of the result. Refactorisation : extending and classify with multiple string instead.
            __hypermedia : []
        });
    }).catch(err => {
        next(err);
    })
});

router.post('/facture', function(req, res, next) {
    const data = verifyAndParseFacture(req.body);
    BD.create("cycling.facture", data).then(fact => {
        res.json({
            message : `Facture #${fact.id} ajouter`,
            result : fact,
            __hypermedia : hypermedia.createFactureHypermedia(fact.id)
        });
    }).catch(err => {
        next(err);
    })
});

router.put('/facture/:id', function(req, res, next) {
    const data = verifyAndParseFacture(req.body, true);
    BD.replace("cycling.facture", req.params.id, data).then(result => {
        res.json({
            message : `Facture #${req.params.id} modifier`,
            result : result,
            __hypermedia : hypermedia.createFactureHypermedia(req.params.id)
        })
    }).catch(err => {
        next(err);
    })
});

router.delete('/facture/:id', function(req, res, next) {
    BD.remove("cycling.facture", req.params.id).then(result => {
        res.json({
            message : `Facture #${req.params.id} supprimer`,
            result : result,
            __hypermedia : hypermedia.createFactureHypermedia(req.params.id)
        })
    }).catch(err => {
        next(err);
    })
});

router.post("/requete-produit-frequent", function(req, res, next) {
    spark.createRequest().then(result => {
        res.json({
            __hypermedia : [
                {
                    uri : `/produit-frequent/requete-status/${result.id}`,
                    method : "GET",
                    description : "Acceder au résultat de la recherche des produits fréquents"
                }
            ]
        })
    }).catch(err => {
        next(err);
    })
})

router.get("/produit-frequent/requete-status/:reqid", function(req, res, next) {
    spark.getProgress(req.params.reqid).then(result => {
        if(result) {
            console.log(result)
            const responseObj = {
                result : {
                    status : result
                }
            }

            if(result === "COMPLETE") {
                responseObj.__hypermedia = [{
                    uri : `/produit-frequent/requete-data/${req.params.reqid}`,
                    method : "GET",
                    description : `récupérer les données de la requête de produit fréquent #${req.params.reqid}`
                }]
            }
            res.status(200);
            res.json(responseObj)
        } else {
            res.sendStatus(404);
        }
    })
})

router.get("/produit-frequent/requete-data/:reqid", function(req, res, next) {
    spark.getData(req.params.reqid).then(result => {
        if(result) {
            res.status(200);
            res.json({
                data : result
            })
        } else {
            res.sendStatus(404);
        }
    })
})

module.exports = router;

