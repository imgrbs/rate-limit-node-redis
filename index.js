var restify = require('restify');
var axios = require('axios');
var redis = require("redis");
var { promisify } = require("util");

var client = redis.createClient();

const getRedisAsync = promisify(client.get).bind(client);

client.on("error", function (error) {
    console.error(error);
});

// =================================== //

var updateLimitInBucket = async (ip) => {
    const token = await getRedisAsync(`${ip}`)

    console.info(`token=${JSON.stringify(token)} get on start process`)

    if (!token) {
        const init = {
            lastUpdatedTime: new Date().getTime(),
            token: 10
        }

        const jsonValue = JSON.stringify(init)

        client.set(`${ip}`, jsonValue);

        console.info(`ip=${ip} init=${jsonValue} set redis`)

        return init
    }

    const jsonOldVersion = JSON.parse(token)

    const newValue = {
        lastUpdatedTime: new Date().getTime(),
        token: jsonOldVersion.token - 1
    }

    const jsonValue = JSON.stringify(newValue)

    const newVersion = await getRedisAsync(`${ip}`)

    const jsonNewVersion = JSON.parse(newVersion)

    console.info(`token=${newVersion} get on start process`)

    if (jsonNewVersion.token === 0) {
        return jsonNewVersion
    }

    if (jsonOldVersion.token !== jsonNewVersion.token) {
        return await updateLimitInBucket(ip)
    }

    client.set(ip, jsonValue);

    console.info(`ip=${ip} init=${jsonValue} set redis`)

    return newValue
}

function getIp(req) {
    if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'][0]) {
        return req.headers['x-forwarded-for'][0]
    }

    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress
    }

    throw new Error("Get IP Failed.")
}

var rateLimit = async (req) => {
    const ip = getIp(req)

    console.info(`ip=${ip} get ip`)

    const token = await updateLimitInBucket(ip)

    return token.token > 0
}

var rateLimitMiddleware = async (req, res, next) => {
    const result = await rateLimit(req, res, next)

    if (!result) {
        res.status(492)
        res.send("too many request")
        return
    }

    next()
}

// SERVER 1 =================================== //

function respond1(req, res, next) {

    res.send('hello ' + req.params.name);

    next();
}

var server1 = restify.createServer();
server1.get('/hello/:name', rateLimitMiddleware, respond1);

server1.listen(8080, function () {
    console.log('%s listening at %s', server1.name, server1.url);
});

// SERVER 2 =================================== //

// function respond2(req, res, next) {
//     console.log(req.connection.remoteAddress);
//     console.log(req.headers['x-forwarded-for']);

//     res.send('hello ' + req.params.name);
//     next();
// }


// var server2 = restify.createServer();
// server2.get('/hello/:name', rateLimitMiddleware, respond2);

// server2.listen(9090, function () {
//     console.log('%s listening at %s', server2.name, server2.url);
// });

// =================================== //
