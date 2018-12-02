
const cassandra = require('cassandra-driver');

const client = new cassandra.Client({ contactPoints: [process.env.CASSANDRA_IP]});

function get(model) {
    const query = `SELECT * FROM ${model} `;
    return client.execute(query).then(result => {
		var convertedResult = []
		var rows = result.rows
		for (var i = 0; i < rows.length; i++)
		{
			var produits = []
			for (var j =0; j < rows[i].produits.length; j++)
			{
				var p = rows[i].produits[j]
				produits.push({nom : p.get(0), prix: p.get(1)})
			}
			convertedResult.push({id: rows[i].id, produits : produits})
		}
        return convertedResult
    })
	.catch(e => console.log(e));
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
