# Rate Limit Implementation

This is a POC Version of rate limit system.
- no unit tests
- no refactor
- uses postman collections for testing

## Design Technique
- Uses Token Bucket Algorithm
- Optimistic Lock
- Atomic Operations

## System Requirements
- node 12.16.1
- load test application with concurrency feature (eg. postman, jmeter)


## Todo
- expired record in redis
- checking with username
- validate subnet
- No Unit Test XD
- Refactor XD
