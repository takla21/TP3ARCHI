cassandra = require("cassandra-driver");

module.exports = function verifyAndParseFacture(body) {
    if(!Array.isArray(body.produits)) return ;
    
    const facture = {
        id : body.id || generateId(),
        produits : (body.produits || []).map(p => new cassandra.types.Tuple(p.nom, p.prix))
    }
    return facture
}

function generateId() {
    return Math.random() * Math.pow(2, 32)
}