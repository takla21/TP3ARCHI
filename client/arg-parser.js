module.exports = confList => {
    
    const accumulator = {};
    confList = confList.map(conf => {
        conf.configName = conf.name.find(n => n.slice(0, 2) === "--").slice(2);
        return conf;
    })
    
    for(let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        
        const config = confList.find(conf => conf.name.includes(arg))
        if(config) {
            config.included = true;
            if(config.func) {
                config.func.apply(null, process.argv.slice(i + 1, i + 1 + (config.numOfParam || 1)));
            }
            
            if(config.numOfParam === 0) {
                accumulator[config.configName] = true;
            } else if (config.numOfParam === 1 || !config.numOfParam){
                accumulator[config.configName] = process.argv[i+1];
            } else {
                accumulator[config.configName] = process.argv.slice(i + 1, i + 1 + (config.numOfParam || 1))
            }
            
            i += (config.numOfParam || 1)
            
        } else {
            throw new Error(`${arg} is not a valid argument`);
        }
    }

    const missingArg = confList.find(conf => conf.required && !conf.included)
    if(missingArg) throw `the argument "--${missingArg.configName}" is required`;
    
    return accumulator;
}