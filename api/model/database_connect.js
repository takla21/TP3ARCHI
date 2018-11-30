
const cassandra = require('cassandra-driver');
//contactPoints? keyspace?
const client = new cassandra.Client({ contactPoints: [process.env.cassandra], keyspace: 'ks1' });
 


function get(model) {
    const query = `SELECT * FROM ${model} `;
    return client.execute(query).then(result => {
        console.log(result)
        //TODO : parse result into json array
        return [{
            _id : "facture_1",
        }];
    });
}

function create(model, content) {
    const createQuery = `
    INSERT INTO ${model} (${Object.keys(content).join(", ")})
    VALUES (${Object.values(content).join(", ")});
    `;

    return client.execute(createQuery).then(result => {
        console.log(result)
        //TODO : parse result into json
        return {
            _id : generateId()
        };
    });
}

function replace(model, id, content) {
    const updateQuery = `UPDATE ${model} 
    SET ${Objects.keys(content).map(k => `${k} = ${content[k]}`).join(", ")}
    WHERE key = ${id};`;

    return client.execute(updateQuery).then(result => {
        console.log(result)
        //TODO : parse result into json
        return {};
    });
}

function remove(model, id) {
    const deleteQuery = `DELETE FROM ${model} WHERE key = ${id};`;
    return client.execute(updateQuery).then(result => {
        console.log(result)
        //TODO : parse result into json
        return {};
    });
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
