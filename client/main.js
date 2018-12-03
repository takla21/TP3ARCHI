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

/*
exploreHypermedias(hypermedias) {
    askChoice
    if choice >= 0
        explore(hypermedia[choice])
        exploreHypermedias(hypermedias)
}

explore(hypermedia) {
    request data
    parse data
    if data is list
        for each data
            show data d
            if hypermedia, 
                exploreHypermedias(hypermedias)
    else 
        show data
    fi
    if hypermedias, 
        exploreHypermedias(hypermedias)
    fi
}

explore()
get hypermedias
exploreHypermedias(hypermedias)
*/

function safeParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

//start
explore().then(res => {
    console.log("\nFin du programme.".bold)
}).catch(err => {
    console.log("\nErreur non récupérable : ".red.bold)
    console.log(safeParse(err));
});

function exploreHypermedias(hypermedias, cancelStr) {
    let currentChoice = askChoice(hypermedias, cancelStr);
    if(currentChoice >= 0) {
        return explore(hypermedias[currentChoice]).then(res => {
            return exploreHypermedias(hypermedias, cancelStr); 
        })
    } else {
        return Promise.resolve();
    }
}

function explore(hypermedia) {
    return makeRequest(hypermedia)
        .then(parseRequest)
        .then(showData)
        .then(res => {
            if(res.__hypermedia && res.__hypermedia.length) {
                return exploreHypermedias(res.__hypermedia, "Retour en arrière")
            } else {
                return res;
            }
        }).catch(err => {
            //error in exploration. but catching it here cause it does not stop complete exploration.
            console.log(`\nune erreur est survenue : `.red);
            console.log(safeParse(err));
    })
}

function askChoice(hypermedias, cancelStr) {
    console.log("\nVoici les options disponibles.");
    const index = readlineSync.keyInSelect(hypermedias.map(h => h.description), "Que voulez vous faire?", {cancel : cancelStr || "Retour en arrière"});
    console.log(`vous avez choisis le choix numéro #${index+1}` + (index >= 0 ? ` : ${hypermedias[index].description}` : ` : ${cancelStr || "Retour en arrière"}`) + "\n");
    return index;
}

function showData(res) {
    if(res.result) {
        if(res.resultIsHypermediaList) {
            console.log("\nla requête à envoyé une liste de résultat.")
            return res.result.reduce((promise, data, index) => {
                return promise.then(() => {
                    console.log(`élément #${index + 1} :`)
                    console.log(JSON.stringify(data, null, 4));
                    if(data.__hypermedia && data.__hypermedia.length) {
                        return exploreHypermedias(data.__hypermedia, "élément suivant")
                    } else {
                        return data;
                    }
                })
            }, Promise.resolve()).then(() => res);
        } else {
            console.log("\nResultat de la requête :")
            console.log(JSON.stringify(res.result, null, 4))
        }
    } else {
        console.log("aucune donnée à afficher")
    }
    return res;
}

function makeRequest(hypermedia) {
    hypermedia = hypermedia || {}
    const fulluri = `http://${uri}${hypermedia.uri || ""}`;
    const fullmethod = hypermedia.method || "GET";
    
    const body = (fullmethod === "POST" || fullmethod === "PUT") ? askBody(hypermedia) : {}
    console.log(fullmethod, fulluri)
    return request({
        uri : fulluri,
        method : fullmethod,
        body : body,
        json : true
    })
}

function askBody(hypermedia) {
    //return  {"produits" : [{"nom": "p1", "prix": 9.01}, {"nom": "test", "prix": 9.99}]}
    const data = readlineSync.question('Quel donnée voulez vous envoyé?');
    return safeParse(data);
}

function parseRequest(res) {
    if(res.error) {
        console.log("Une erreur est survenue avec la requête.")
        console.log(res.error);
        throw res.error || res;
    } else {
        const body = safeParse(res.body);
        console.log("la requête à été retourné avec un status #" + ("" + res.statusCode).bold)
        if(res.statusCode < 200 || res.statusCode >= 300) {
            console.log("message d'erreur : ".red)
            console.log(body)
        }
        return body
    }
} 

process.on('SIGINT', function() {
    console.log("Arrêt du programme.".bold)
    process.exit();
});