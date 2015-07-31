"use strict"

let request = require('request')
let util = require('util')
//let RX = require('Rx')
let oauthToken = process.env.OAUTH_TOKEN

let totalActors = {}
let totalActionTypes = {}


if (!oauthToken) {
    console.error("Please specify your CF oauth token in the env variable OAUTH_TOKEN.")
    process.exit(1)
}

var addActors = function (actors) {
    for (let actor in actors) {
        totalActors[actor] = (+totalActors[actor] || 0) + actors[actor]
    }
}

var addActionTypes = function (actionTypes) {
    for (let actionType in actionTypes) {
        totalActionTypes[actionType] = (+totalActionTypes[actionType] || 0) + actionTypes[actionType]
    }
}

var printResults = function () {
    console.log(`list of actor names: ${util.inspect(totalActors)}`)
    console.log(`list of action types: ${util.inspect(totalActionTypes)}`)
}

let parseResult = function (error, response, body) {

    if (response.statusCode != 200) {

        console.log(`error '${error}', status code '${response.statusCode}', response '${body}'`)
    } else {
        let parsedResponse = JSON.parse(body)

        let getActorName = function (resource) {
            if (!resource.entity.actor_name) {
                return 'no author'
            }
            return resource.entity.actor_name
        }

        let getActionType = function (resource) {
            if (!resource.entity.type) {
                return 'no type'
            }
            return resource.entity.type
        }

        let byKey = function (result, key) {
            result[key] = (+result[key] || 0) + 1
            return result
        }
        console.log(parsedResponse)
        console.log(`complete output: ${util.inspect(parsedResponse.resources)}`)

        addActors(parsedResponse.resources.map(getActorName).reduce(byKey, {}))
        addActionTypes(parsedResponse.resources.map(getActionType).reduce(byKey, {}))

//        if (parsedResponse.next_url) {
//            console.log(`following link: ${parsedResponse.next_url}`)
//            queryEventAPIWithURL(parsedResponse.next_url)
//        } else {
//            printResults()
//        }
    }
}

function queryEventAPIWithURL(path) {
    let host = 'https://api.cf.neo.ondemand.com'
    request({
            url: host + path,
            strictSSL: false,
            headers: {'Authorization': oauthToken},
            qs: {'results-per-page': 100}
        },
        parseResult)
}

queryEventAPIWithURL('/v2/events');

