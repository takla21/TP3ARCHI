#!/usr/bin/env node

const util = require("util");
const request = util.promisify(require("request"));
const fs = util.promisify
const path = require('path');

const {action, uri, body, filename, pipe, verbose} = require('./common/arg-parser.js')([
    {name : ["-a", "--action"]},
    {name : ["-u", "--uri"]},
    {name : ["-b", "--body"]},
    {name : ["-f", "--filename"]},
    {name : ["-pi", "--pipe"], numOfParam : 0},
    {name : ["-vv", "--verbose"], numOfParam : 0},
    {
        name : ["-h", "--help"],
        func : () => {
            console.log(`
`);
            process.exit();
        },
        numOfParam : 0
    },
]);

const file = filename && require(path.join(process.cwd(), filename)) || require(path.join(__dirname, "data", filename));

return request({
    uri : `http://${uri}/facture`,
    method : action || "GET",
    
    ...(action === "POST" || action === "PUT") && {json : file || JSON.parse(body)},
}).then(res => {
    writeFunc = obj => typeof obj !== "string" && !verbose && !pipe ? console.log(obj) : (pipe ? process.stdout.write : console.log)(JSON.stringify(obj, null, 4));
    if(res.error) {
        writeFunc(res.error);
    }
    if(res.statusCode >= 200 && res.statusCode < 300 && 
            res.body && typeof res.body === "string") {
        
        writeFunc(JSON.parse(res.body));
    } else {
        writeFunc(res.body)
    }
})