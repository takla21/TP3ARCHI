
//pas plus de 3 requêtes par 5 minutes.
const MAX_REQUEST = 3;
const REQUEST_TIMEOUT = 5 * 1000 * 60;

//interface

function createRequest() {
    const id = generateId()
    const result = addRequestToQueue(id);
    if(result) {
        startSpark(id)
        return Promise.resolve({id : id});
    } else {
        return Promise.reject({
            message : "Trop de requête",
            description : `Le nombre de requête de calcul des produits fréquents maximum est de ${MAX_REQUEST} par ${REQUEST_TIMEOUT/1000} secondes`,
            status : 429
        });
    }
}

function getProgress(id) {
    return Promise.resolve().then(() => {
        const sReq = requestQueue.find(sReq => sReq.id === id)
        return sReq && sReq.status;
    })
}

function getData(id) {
    return (requestQueue.find(sReq => sReq.id === id && status === "COMPLETE") || {}).data
}

module.exports = {
    createRequest : createRequest,
    getProgress : getProgress,
    getData : getData
}

//temporary function to generate random ID
const crypto = require("crypto")
function generateId() {
    return crypto.randomBytes(8).toString("hex");
}

//private function
let requestQueue = [];

function addRequestToQueue(id) {
    requestQueue = requestQueue.filter(sparkReq => {
        return sparkReq.status !== "COMPLETE" || Date.now() < sparkReq.timeoutDate
    })
    if(requestQueue.length < MAX_REQUEST) {
        requestQueue.push({
            status : "PROGRESS",
            id : id,
            timeoutDate : Infinity //do not timeout when in progress. possible error : sreq blocked in progress will never be removed, causing queue to be full. 
        })
        return true;
    } else {
        return false;
    }
}

function startSpark(id) {
    //TODO some magic with spark
    //when spark finish :
    Promise.resolve({}).then(data => {
        handleSparkFinish(null, id, data);
    }).catch(err => {
        handleSparkFinish(id, err);
    });
}

function handleSparkFinish(err, id, data) {
    sReq = requestQueue.find(sReq => sReq.id === id);
    if(sReq) {
        sReq.status = "COMPLETE",
        sReq.timeoutDate = Date.now() + REQUEST_TIMEOUT,
        sReq.data = data
    }
}