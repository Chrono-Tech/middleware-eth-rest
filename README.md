# middleware-eth-rest [![Build Status](https://travis-ci.org/ChronoBank/middleware-eth-rest.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-eth-rest)

Middleware service for which expose rest api

###Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://github.com/ChronoBank/middleware)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for interaction with middleware through REST API.


#### Routes


The available routes are listed below:

| route | methods | params | description |
| ------ | ------ | ------ | ------ |
| /transactions   | GET |  | returns an transaction's collection
| /transactions/accounts   | GET | |returns list of registered accounts
| /transactions/account   | POST |address - user's address |register a new account
| /transactions/account   | DELETE |address - user's address | remove registered account
| /events   | GET | |returns list of all available events
| /events/{event_name}   | GET | |returns an event's collection
| /events/listener   | POST | event - event's name, filter - object, by which event's data will be filtered | register an event's listener with certain criteria (or filter) - when event is emitted, a callback will be fired with event's data and send it with POST request


#### REST guery language

Every collection could be fetched with an additional query. The api use [query-to-mongo-and-back](https://github.com/ega-forever/query-to-mongo-and-back) plugin as a backbone layer between GET request queries and mongo's. For instance, if we want to fetch all recods from collection 'issue', where issueNumber < 20, then we will make a call like that:
```
curl http://localhost:8080/events/issue?issueNumber<20
```

For more information about queries, please refer to [query-to-mongo-and-back](https://github.com/ega-forever/query-to-mongo-and-back).




##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_URI=mongodb://localhost:27017/data
IPFS_NODES=http://localhost:5001, http://localhost:5001
SCHEDULE_JOB=30 * * * * *
SCHEDULE_CHECK_TIME=0
RABBIT_URI=amqp://localhost:5672
NETWORK=development
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| IPFS_NODES   | should contain a comma separated uri connection strings for ipfs nodes
| SCHEDULE_JOB   | a configuration for ipfs pin plugin in a cron based format
| SCHEDULE_CHECK_TIME   | an option, which defines how old should be records, which have to be pinned
| RABBIT_URI   | rabbitmq URI connection string
| NETWORK   | network name (alias)- is used for connecting via ipc (see block processor section)

License
----

MIT