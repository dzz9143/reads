// define the context object
class MyPromise {
  constructor(executor) {
    this.executor = executor;
    this.queue = [];
    this.currentState = null;
    this.value = null;
    this.isFulfilledOrRejected = false;
    this.states = {
      pending: new PendingState(this),
      fulfilled: new FulfilledState(this),
      rejected: new RejectedState(this),
    };
    this.changeState('pending');
  }

  // define the state transition
  changeState(nextState) {
    this.currentState = this.states[nextState];
    this.currentState.activate();
  }

  // fulfill the state
  fulfill(value) {
    if (this.isFulfilledOrRejected) {
      return;
    }
    this.isFulfilledOrRejected = true;
    this.value = value;
    this.changeState('fulfilled');
  }

  // reject the state
  reject(reason) {
    if (this.isFulfilledOrRejected) {
      return;
    }
    this.isFulfilledOrRejected = true;
    this.value = reason;
    this.changeState('rejected');
  }

  // then simply proxy to state object
  then() {
    return this.currentState.then(...arguments);
  }
}

// the general Promise Resolution Procedure. Please check section 2.3 at https://promisesaplus.com/
function resolveProcedure(promise, x) {
  if (x === promise) {
    promise.reject(new TypeError('x === promise'));
  }

  if (x instanceof MyPromise) {
    x.then((value) => {
      promise.fulfill(value);
    }, (reason) => {
      promise.reject(reason);
    });
  } else {
    if (typeof x === 'object' || typeof x === 'function') {
      if (x === null) {
        return promise.fulfill(x);
      }

      let done = false;
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(x, (y) => {
            if (done) return;
            done = true;
            resolveProcedure(promise, y); // recursive resolve
          }, (reason) => {
            if (done) return;
            done = true;
            promise.reject(reason);
          });
        } else {
          promise.fulfill(x);
        }
      } catch (err) {
        if (done) return;
        done = true;
        promise.reject(err);
      }
    } else {
      promise.fulfill(x);
    }
  }
}


// define the state object
class BaseState {
  constructor(promiseContext) {
    this.promise = promiseContext;  // keep a reference to the context object, in this example it's the promise instance
  }
}

class PendingState extends BaseState {
  activate() {
    // in pending state, we should run the executor synchronously
    this.promise.executor && this.promise.executor((x) => {
      resolveProcedure(this.promise, x);
    }, (reason) => {
      this.promise.reject(reason);
    });
  }

  then(onFulfilled, onRejected) {
    // in pending state, callbacks should be queued
    const newPromise = new MyPromise((resolve, reject) => {
      // queue the callbacks, wait for the promise to be resolved or rejected
      this.promise.queue.push({
        resolvePromise: (value) => {
          try {
            if (onFulfilled && typeof onFulfilled === 'function') {
              const y = onFulfilled(value);
              resolve(y);
            } else {
              resolve(value);
            }
          } catch (err) {
            reject(err);
          }
        },
        rejectPromise: (reason) => {
          try {
            if (onRejected && typeof onRejected === 'function') {
              const y = onRejected(reason);
              resolve(y);
            } else {
              reject(reason);
            }
          } catch (err) {
            reject(err);
          }
        },
      });
    });

    return newPromise;
  }
}

class FulfilledState extends BaseState {
  activate() {
    // when switched to fulfilled state, we should clear the queue, run all callbacks asap
    setTimeout(() => {
      this.promise.queue.forEach((item) => {
        item.resolvePromise(this.promise.value);
      });
    }, 0);
  }

  then(onFulfilled) {
    const newPromise = new MyPromise((resolve, reject) => {
      // don't need to queue up
      setTimeout(() => {
        try {
          const value = this.promise.value;
          if (onFulfilled && typeof onFulfilled === 'function') {
            const y = onFulfilled(value);
            resolve(y);
          } else {
            resolve(value);
          }
        } catch (err) {
          reject(err);
        }
      }, 0);
    });

    return newPromise;
  }
}

class RejectedState extends BaseState {
  activate() {
    setTimeout(() => {
      this.promise.queue.forEach((item) => {
        item.rejectPromise(this.promise.value);
      });
    }, 0);
  }

  then(onFulfilled, onRejected) {
    const newPromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const reason = this.promise.value;
          if (onRejected && typeof onRejected === 'function') {
            const y = onRejected(reason);
            resolve(y);
          } else {
            reject(reason);
          }
        } catch (err) {
          reject(err);
        }
      }, 0);
    });

    return newPromise;
  }
}

// export adapter interface for test
module.exports = {
  resolved: (value) => {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  },

  rejected: (reason) => {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  },

  deferred: function () {
    var resolve, reject;

    return {
      promise: new MyPromise((rslv, rjct) => {
        resolve = rslv;
        reject = rjct;
      }),
      resolve: resolve,
      reject: reject
    };
  }
};