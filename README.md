# middleware-eth-rest [![Build Status](https://travis-ci.org/ChronoBank/middleware-eth-rest.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-eth-rest)

Middleware service for which expose rest api

### Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://github.com/ChronoBank/middleware)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for interaction with middleware through REST API.


#### Routes


The available routes are listed below:

| route | methods | params | description |
| ------ | ------ | ------ | ------ |
| /addr   | POST | ``` {address: <string>, erc20tokens: [<string>]} ``` | register new address on middleware. erc20tokens - is an array of erc20Tokens, which balance changes this address will listen to.
| /addr   | DELETE | ``` {address: <string>} ``` | remove an address from middleware
| /addr/{address}/token   | POST | ``` {erc20tokens: [<string>]} ``` | push passed erc20tokens to an exsiting one for the registered user.
| /addr/{address}/token   | POST | ``` {erc20tokens: [<string>]} ``` | pull passed erc20tokens from an exsiting one for the registered user.
| /addr/{address}/balance   | GET |  | retrieve balance of the registered address
| /tx/{address}/history/{startBlock}/{endBlock}   | GET |  | retrieve transactions for the regsitered address in a block range. endBlock - is optional (if not specified - the range will be = 100).
| /tx   | POST | ``` {tx: <string>} ``` | broadcast raw transaction
| /events   | GET | |returns list of all available events
| /events/{event_name}   | GET | |returns an event's collection


#### REST guery language

Every collection could be fetched with an additional query. The api use [query-to-mongo](https://www.npmjs.com/package/query-to-mongo) plugin as a backbone layer between GET request queries and mongo's. For instance, if we want to fetch all recods from collection 'issue', where issueNumber < 20, then we will make a call like that:
```
curl http://localhost:8080/events/issue?issueNumber<20
```


##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_URI=mongodb://localhost:27017/data
REST_PORT=8081
NETWORK=development
WEB3_URI=/tmp/development/geth.ipc
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| REST_PORT   | rest plugin port
| NETWORK   | network name (alias)- is used for connecting via ipc (see block processor section)
| WEB3_URI   | the path to ipc interface

License
----

MIT