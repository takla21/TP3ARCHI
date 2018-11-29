function createFactureHypermedia(id) {
    return [
        {
            uri : `/facture/${id}`,
            method : "PUT",
            description : `Modifier la facture #${id}`
        },
        {
            uri : `/facture/${id}`,
            method : "DELETE",
            description : `Supprimer la facture #${id}`
        }
    ]
}
module.exports = {
    createFactureHypermedia : createFactureHypermedia
}