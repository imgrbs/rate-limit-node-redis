# Rate Limit Implementation

This is a POC Version of rate limit system.
- no unit tests
- no refactor
- uses ./ab for testing

```
./ab -n 20 -c 5 http://localhost:8080/hello/test
```

## Design Technique
- Uses Token Bucket Algorithm
- Optimistic Lock
- Atomic Operations

## System Requirements
- node 12.16.1


## Todo
- expired record in redis
- checking with username
- validate subnet
- No Unit Test XD
- Refactor XD
