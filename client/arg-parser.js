module.exports = confList => {
    
    const accumulator = {};
    
    for(let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        
        const config = confList.find(conf => conf.name.includes(arg))
        if(config) {
            if(config.func) {
                config.func.apply(null, process.argv.slice(i + 1, i + 1 + (config.numOfParam || 1)));
            }
            
            const configName = config.name.find(n => n[0] === "-" && n[1] === "-").slice(2);
            if(config.numOfParam === 0) {
                accumulator[configName] = true;
            } else if (config.numOfParam === 1 || !config.numOfParam){
                accumulator[configName] = process.argv[i+1];
            } else {
                accumulator[configName] = process.argv.slice(i + 1, i + 1 + (config.numOfParam || 1))
            }
            
            i += (config.numOfParam || 1)
            
        } else {
            throw new Error(`${arg} is not a valid argument`);
        }
    }
    
    return accumulator;
}