"use strict"


let request = require('request')
let util = require('util')
//let RX = require('Rx')
let oauthToken = process.env.OAUTH_TOKEN

if (!oauthToken) {
console.error("Please specify your CF oauth token in the env variable OAUTH_TOKEN.")
        process.exit(1)
}
let parseResult = function(error, response, body){

        if (response.statusCode != 200) {

          console.log(`error '${error}', status code '${response.statusCode}', response '${body}'`)
        } else {
          let parsedResponse = JSON.parse(body)
          let fnTest = function(resource){
                  if (!resource.entity.actor_name) {
                    //console.log(`some weird entry ${util.inspect(resource.entity)}`)
                            return 'none?'
                  }
            return resource.entity.actor_name
          }
          let byName = function(names, name){
            names[name] = (+names[name] || 0) + 1
            return names
          }
          let list = parsedResponse.resources.map(fnTest).reduce(byName,{})
          console.log(`parsedResponse: ${util.inspect(list)}`)
          console.log(`next results: ${parsedResponse.next_url}`)
        }
}
request({ url: 'https://api.cf.sap-cf.com/v2/events',
  strictSSL: false,
  headers: {'Authorization' : oauthToken },
  qs: {'results-per-page' : 100}
},
        parseResult)
