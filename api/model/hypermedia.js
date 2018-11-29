function createFactureHypermedia(id) {
    return [
        {
            uri : `/facture/${id}`,
            method : "PUT",
            description : `modifier la facture #${id}`
        },
        {
            uri : `/facture/${id}`,
            method : "DELETE",
            description : `supprime la facture #${id}`
        }
    ]
}
module.exports = {
    createFactureHypermedia : createFactureHypermedia
}