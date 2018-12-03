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
    });
}

function create(model, content) {
    const createQuery = `INSERT INTO ${model} (${Object.keys(content).join(", ")}) VALUES (${Object.values(content).map(() => "?").join(", ")});`;

    return client.execute(createQuery, Object.values(content), { prepare: true } ).then(result => {
        return {id: content.id}
    });
}

function replace(model, id, content) {
    const updateQuery = `UPDATE ${model} SET ${Object.keys(content).map(k => `${k} = ?`).join(", ")} WHERE id = ${id};`;

    return client.execute(updateQuery, Object.values(content), { prepare: true }).then(result => {
        console.log(result)
        //TODO : parse result into json
        return {};
    });
}

function remove(model, id) {
    const deleteQuery = `DELETE FROM ${model} WHERE id = ${id};`;
    return client.execute(deleteQuery).then(result => {
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

