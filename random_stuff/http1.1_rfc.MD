# [HTTP 1.1 RFC](https://tools.ietf.org/html/rfc2616)

## Terminology
* connection
  A `transport layer virtual circuits` established between two programs for the purpose of communications.

* message
  The `basic unit` of HTTP communication, consist of a structured sequence of octets matching the HTTP syntax.

* resource
  The network object(?) or server that can be identified by a URI.

* entity
  The `whole information` transferred as the `payload` of a request or response. An entity consists of `meta information` in the form of entity-header fields and content in the form of an entity-body

* proxy
  An intermediary program which acts as `both a server and a client` for the purpose of making requests `on behalf of other clients`. Requests are `serviced internally or by passing them on`, with possible translation, to other servers. A "transparent proxy" is a proxy that does not modify the request or response beyond what is required for `proxy authentication`(?) and identification. A "non-transparent proxy" is a proxy that modifies
  the request or response in order to provide some added service to the user agent, such as group annotation services, media type transformation, `protocol reduction`(?), or anonymity filtering.s

* gateway
  A server which acts as an intermediary for some other server. Unlike a proxy, a gateway receives requests `as if it were the origin server` for the requested resource; the requesting client may not be aware that it is communicating with a  gateway.

* tunnel 
  An intermediary program which is acting as a `blind relay` between `two connections`. Once active, a tunnel is not considered a party to the HTTP communication, though the tunnel may have been initiated by an HTTP request. The tunnel ceases to exist when `both ends` of the relayed connections are closed.

## Overall Operation

The HTTP protocol is a request/response protocol. 

Most HTTP communication is initiated by a user agent and consists of a request to be applied to a resource on some origin server. In the simplest case, this may be accomplished via a single connection (v) between the user agent (UA) and the origin server (O).

```
   request chain ------------------------>
       UA -------------------v------------------- O
          <----------------------- response chain
```

A more complicated situation occurs when one or more `intermediaries` are present in the request/response chain. There are three common forms of intermediary:
1. proxy - A proxy is a `forwarding agent`, receiving requests for a URI in its `absolute form`, `rewriting` all or part of the message, and forwarding the reformatted request toward the server identified by the URI. 

2. gateway - A gateway is a `receiving agent`, acting as a layer above some other server(s) and, if necessary, `translating the requests` to the underlying server's protocol.

3. tunnel - A tunnel acts as a `relay point` between `two connections` `without changing` the messages; tunnels are used when the communication needs to pass through an intermediary (such as a firewall) even when the intermediary cannot understand the contents of the messages.

```
request chain -------------------------------------->
       UA -----v----- A -----v----- B -----v----- C -----v----- O
          <------------------------------------- response chain
```

The figure above shows three intermediaries (A, B, and C) between the user agent and origin server. A request or response message that travels the whole chain will pass through `four separate connections`.

This distinction(four seperate connections) is important because some HTTP communication options may apply only to the connection with the nearest, non-tunnel neighbor, only to the end-points of the chain, or to all connections along the chain. 

Any party to the communication which is `not acting as a tunnel` may employ an `internal cache` for handling requests. The effect of a cache is that the request/response chain is `shortened` if one of the participants along the chain has a cached response applicable to that request.

In HTTP/1.0, most implementations used a new connection for each
request/response exchange. In HTTP/1.1, a connection may be used for
`one or more request/response exchanges`, although connections may be
closed for a variety of reasons

## Protocol Parameters
* If a higher version request is received, the proxy/gateway MUST either downgrade the request version, or respond with an error, or switch to tunnel behavior.

* Content Encodings
  Content coding values indicate an encoding transformation that has been or can be `applied to an entity`. Content codings are primarily used to allow a document to be `compressed`

* Transfer Encodings
  Transfer-coding values are used to indicate an encoding transformation that has been, can be, or may need to be applied to an entity-body in order to ensure `"safe transport"` through the network. This differs from a content coding in that the transfer-coding is a property of the `message`, not of the original entity.
<!-- 
## Message
## Entity -->

## HTTP Headers
Headers can be grouped accordings to their context:
* General header: apply to both request/response `with no relation to the data eventually transmitted in the body`
* Request header: containing more info about resource to be fetched or about client itself
* Response header: containing more info about response or about the server itself
* Entity header: containing more info about the body of entity, like content-type

Headers can also be grouped according to how proxies handle them:
* End-to-end headers: These headers must be transmitted to the final recipient of the message; that is, the server for a request or the client for a response. Intermediate proxies `must retransmit end-to-end headers unmodified` and caches must store them.
* Hop-by-hop headers: These headers are meaningful only for a single transport-level connection and `must not be retransmitted` by proxies or cached
  such headers are:
  * Connection
  * Keep-Alive
  * Proxy-Authenticate
  * Proxy-Authorization
  * TE
  * Trailer
  * Transfer-Encoding
  * Upgrade
Note that only hop-by-hop headers may be set using the `Connection` general header.

<!-- ### specified headers -->

## References
https://notfalse.net/50/http-intermediary
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#hbh
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding
https://imququ.com/post/transfer-encoding-header-in-http.html

