cassandra = require("cassandra-driver");

modules.exports = function verifyAndParseFacture(body) {
    if(!Array.isArray(body.produits)) return ;
    
    const facture = {
        id : body.id || generateId(),
        produits : (body.produits || []).map(p => cassandra.types.typle(p.nom, p.prix))
    }
    return facture
}

function generateId() {
    return Math.random() * Math.pow(2, 32)
}