const log = console.log;
const dir = console.dir;
log('\n'.repeat(32));

//Requires
const fs = require('fs-extra');
const got = require('got');
const { parsePerf, diffPerfs, validatePerfThreadData } = require('./utils.js');

//Configs
const configs = fs.readJSONSync('./config.json');
const maxDeltaMs = configs.maxDeltaMins * 60 * 1000;


//Functions
const collectServerSnapshot = async (serverName, serverHost) => {
    //Get player count
    const dynamicData = await got(`${serverHost}/dynamic.json`).json();
    if (typeof dynamicData.clients !== 'number') throw new Error(`invalid clients count`);

    //Get performance data
    const currPerfRaw = await got(`${serverHost}/perf/`).text();
    const currPerfData = parsePerf(currPerfRaw);
    if(
        !validatePerfThreadData(currPerfData.svSync) ||
        !validatePerfThreadData(currPerfData.svNetwork) ||
        !validatePerfThreadData(currPerfData.svMain)
    ){
        throw new Error(`invalid or incomplete /perf/ response`);
    }

    //Get cache
    const perfsFilePath = `perfs/${serverName}.json`;
    let snapsCache = [];
    try {
        snapsCache = await fs.readJSON(perfsFilePath);
    } catch (error) { }

    //Validate cache
    const invalidCacheEntries = snapsCache.every((s) => {
        return (
            typeof s.timestamp == 'number' &&
            typeof s.mainTickCounter == 'number' &&
            typeof s.clients == 'number' &&
            validatePerfThreadData(s.perfSrc.svSync) &&
            validatePerfThreadData(s.perfSrc.svNetwork) &&
            validatePerfThreadData(s.perfSrc.svMain) &&
            validatePerfThreadData(s.perf.svSync) &&
            validatePerfThreadData(s.perf.svNetwork) &&
            validatePerfThreadData(s.perf.svMain)
        )
    });
    if (invalidCacheEntries.length) throw new Error(`invalid data in cache`);

    //Process performance data
    const now = Date.now();
    const islinear = (
        snapsCache.length &&
        now - snapsCache[snapsCache.length - 1].timestamp <= maxDeltaMs &&
        snapsCache[snapsCache.length - 1].mainTickCounter < currPerfData.svMain.count
    )
    const currPerfDiff = diffPerfs(currPerfData, (islinear) ? snapsCache[snapsCache.length - 1].perfSrc : false);
    Object.keys(currPerfDiff).forEach((thread) => {
        const bucketsFrequencies = []
        currPerfDiff[thread].buckets.forEach((b, bIndex) => {
            const prevBucket = (bIndex) ? currPerfDiff[thread].buckets[bIndex - 1] : 0;
            const freq = (b - prevBucket) / currPerfDiff[thread].count;
            bucketsFrequencies.push(freq);
        });
        currPerfDiff[thread].buckets = bucketsFrequencies;
    })
    const currSnapshot = {
        islinear,
        timestamp: now,
        mainTickCounter: currPerfData.svMain.count,
        clients: dynamicData.clients,
        perfSrc: currPerfData,
        perf: currPerfDiff
    }
    //DEBUG
    // dir({
    //     islinear,
    //     len: snapsCache.length,
    //     mainTickCounter: currSnapshot.mainTickCounter,
    //     clients: currSnapshot.clients,
    //     _: "===================================================",
    //     perfSrc: currSnapshot.perfSrc.svMain,
    //     perf: currSnapshot.perf.svMain,
    // })
    snapsCache.push(currSnapshot);

    //Save data
    await fs.outputJSON(perfsFilePath, snapsCache);
    log(`[${serverName}] Collected snap #${snapsCache.length}`);
}


(async () => {
    log('> Thingy started!');

    const getServer = async (server) => {
        try {
            await collectServerSnapshot(server.name, server.host)
        } catch (error) {
            log(`[${server.name}] Failed with error: ${error.message}`);
            // dir(error)
        }
    }

    configs.servers.forEach(getServer);
    setInterval(async () => {
        log(`==================== ` + (new Date()).toLocaleString())
        configs.servers.forEach(getServer);
    }, configs.queryIntervalSecs * 1000);
})()
