# WebRTCConnection (.js)

Version 1.0.0

Simple, no bullshit WebRTC datachannel. offer, answer, complete, and send.


## Instantiating WebRTCConnection

```js
class WebRTCConnection {
    /**
     * Simple, no bullshit WebRTC datachannel. offer, answer, complete, and send.
     * @param {Function} doOnOpen
     * @param {Function} doOnClose
     * @param {Function} doOnStandby when the connection fails but may reopen again
     * @param {Function} doOnMessage
     * @param {int} timeout milliseconds
     */
    constructor(doOnOpen, doOnClose, doOnStandby, doOnMessage, timeout = 1000*60*60*24)
```

```js
connection = new WebRTCConnection(doOnOpen, doOnClose, doOnStandby, doOnMessage, timeout = 1000*60*60*24);
```

## Class Methods

```js
/**
 * create a WebRTC offer sdp
 * @return {Promise} {String} sdp
 */
WebRTCConnection.offer();
```

```js
/**
 * create a WebRTC offer sdp
 * @return {Promise} {String} sdp
 */
WebRTCConnection.answer(sdp);
```

```js
/**
 * complete a connection
 * @param {String} sdp
 * @return {Promise} void on successfully established connection
 */
WebRTCConnection.complete(sdp);
```


## Alice and Bob Build a Connection

example of how to build a connection. first, both need to instantiate their connection. example, bob writes into his javascript console:

```js
bobs_connection = new WebRTCConnection(
      ()=>console.log("bob:open"),
      ()=>console.log("bob:close"),
      ()=>console.log("bob:standby"),
      (message)=>{
          console.log("bob receives:");
          console.log(message)
      },
  );
```


alice writes:
```js
alices_connection = new WebRTCConnection(
      ()=>console.log("alice:open"),
      ()=>console.log("alice:close"),
      ()=>console.log("alice:standby"),
      (message)=>{
          console.log("alice receives:");
          console.log(message)
      },
  );
```

### 1. Create an Offer.
This is a offer to join a connection.

Bob does
```js
bobs_connection.offer().then(console.log);
```

this should print Bob an SDP string that he needs to convey to alice somehow

### 2. Create an Answer.

Upon receiving Bob's offer SDP, Alice needs to

```js
alices_connection.answer("Bob's SDP here").then(console.log);
```

to generate an answer SDP. She needs to return her SDP to Bob somehow.

### 3. Complete the Link.

Bob, upon receiving Alice's SDP, needs to call "complete" with it

```js
bobs_connection.complete("Alice's SDP here");
```

congratulations! both sides can now chat

```js
alices_connection.send("hey bob!");
```

## SelfTest
to quickly test whether everything works, try to run WebRTCConnectionTest.js you should get 3 errors that do not break execution (intended).