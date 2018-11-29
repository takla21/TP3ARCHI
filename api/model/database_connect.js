
function get(model) {
    const factures = [{}]; //hardcoded
    return Promise.resolve(factures);
}

function create(model, content) {
    return Promise.resolve({
        _id : generateId()
    })
}

function replace(model, id, content) {
    return Promise.resolve({});
}

function remove(model, id) {
    return Promise.resolve({});
}

module.exports = {
    get : get,
    create : create,
    replace : replace,
    remove : remove
}

//temporary function to generate random ID
const crypto = require("crypto")
function generateId() {
    return crypto.randomBytes(8).toString("hex");
}
