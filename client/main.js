#!/usr/bin/env node

require("colors")
const util = require("util");
const request = util.promisify(require("request"));

const {uri} = require('./arg-parser.js')([
    {name : ["-u", "--uri"], required : true},
    {
        name : ["-h", "--help"],
        func : () => {
            console.log(`
    -u --uri : l'adresse de départ de l'api
`);
            process.exit();
        },
        numOfParam : 0
    },
]);

const readlineSync = require("readline-sync");

explore().then(res => {
    console.log("\nFin du programme.".bold)
}).catch(err => {
    console.log(err);
});


function explore(hypermedia) {
    hypermedia = hypermedia || {}
    const fulluri = `http://${uri}${hypermedia.uri || ""}`;
    const fullmethod = hypermedia.method || "GET";
    console.log(fullmethod, fulluri)
    return request({
        uri : fulluri,
        method : fullmethod,
    }).then(parseRequest).then(res => {
        if(res.result) {
            console.log("\nresultat de la requête :")
            console.log(JSON.stringify(res.result, null, 4))
        }

        if(res.__hypermedia && res.__hypermedia.length) {
            const chosenIndex = askChoice(res.__hypermedia);
            return explore(res.__hypermedia[chosenIndex])
        } else {
            return res;
        }
    })
}

function askChoice(hypermedias) {
    console.log("\nVoici les options disponibles.\n");
    
    const index = readlineSync.keyInSelect(hypermedias.map(h => h.description), "Que voulez vous faire?");
    console.log(`vous avez choisis le choix numéro #${index+1} : ${hypermedias[index].description}`);
    return index;
}

function parseRequest(res) {
    if(res.error) {
        throw res.error;
    } else if(res.statusCode >= 200 && res.statusCode < 300 && 
            res.body && typeof res.body === "string") {
        return JSON.parse(res.body);
    } else {
        return res.body;
    }
} 