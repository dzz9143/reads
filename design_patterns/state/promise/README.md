# Promise Implementation

Promise represents the final result of an aysnc operation, the state of a promise describe the different lifetime stages of the async operation.

In short, there are 3 states:
  1. pending
  2. fulfilled
  3. rejected

The detail of specification can be found here: https://promisesaplus.com/

## Implementation 
The implementation uses ES6 class keyword to create the `context` and `state` class. You can easily spot the code of state definition and transition.

The purpose of this code is to demonstrate the `State Pattern` and a simple `Promise Implementation`, it's not a production-ready code.

In the end, I will test my promise implementation to the `Compliance Test Suite` that is provided here: https://github.com/promises-aplus/promises-tests 

## Run the test suite

```bash
$ npm run test
```
