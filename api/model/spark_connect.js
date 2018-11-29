
//pas plus de 3 requêtes par 5 minutes.
const MAX_REQUEST = 3;
const REQUEST_TIMEOUT = 5 * 1000 * 60;

//interface

function createRequest() {
    const id = generateId()
    addRequestToQueue(id);
    startSpark(id)
    return Promise.resolve({id : id});
}

function getProgress(id) {
    return Promise.resolve().then(() => {
        //TODO différence entre PROGRESS, FINISH && 404
        return requestQueue.some(sReq => sReq.id === id && status !== "COMPLETE");
    })
}

function getData(id) {
    //TODO : plus robuste
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
            timeoutDate : Infinity //do not timeout when in progress
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
        handleSparkFinish(id, data);
    });
}

function handleSparkFinish(id, data) {
    sReq = requestQueue.find(sReq => sReq.id === id);
    if(sReq) {
        sReq.status = "COMPLETE",
        sReq.timeoutDate = Date.now() + REQUEST_TIMEOUT,
        sReq.data = data
    }
}