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

### specified headers
* X-Forwarded-For
   - 用来代表 HTTP 请求端的 IP，如果 HTTP 请求链路上有多个 Proxy，那么这些 IP 会被依次加入到这个请求中。比如 X-Forwarded-For: client-ip, proxy-ip-01, proxy-ip-02, ...
   - 当在客户端与服务端之前有其他中间人的时候（比如负载均衡器或者 Proxy等），服务端的 access log 只会包含负载均衡服务器和代理的 IP 地址，为了获得客户端的源 IP 地址需要使用这个请求头
   - 最后一个直连 server 的 proxy 不需要添加自己的 IP，因为 server 可以通过获取 socket 的相关信息获取对端的 IP
   - 需要注意的是 HTTP 是应用层的协议，HTTP 协议中并没有 IP 的概念
   - 因为请求头可以被伪造，对于安全要求比较高的场景，不能依靠从请求头中获取的 IP
   - 可以通过「反向代理」（比如 nginx）去强制添加真实的对端 IP 地址到这个请求头中。但是这种做法也有一些问题，因为你只能获得连接到这个反向代理对端 client 的 IP。这个对端的 client 可能正好是请求源，也可能只是一个 proxy
   - 对于安全无关的场景，可以尝试使用这个头中的 IP 地址，但是需要验证 IP 格式
   - 这个请求头主要用来做调试，统计分析或者用来生产基于地理位置的内容
* Transfer-Encoding
   - 因为 HTTP/1.1 默认是长连接，所以需要有一个方式去决定一个 HTTP 响应的长度，所以这里有两种方式去决定一个响应的长度
   - Content-Length 可以决定这个长度，但是实际应用中实体的长度并没有那么好获得
   - 分块编码（chunked）是对于一次传输的编码，在这种情况下 Content-Length 会被忽略
   - 分块编码中，报文实体需要改为一系列分块来传输，每个分块包含十六进制的长度以及数据。最后一个分块长度值为 0，对应的数据分块没有内容
   - 这里注意 Content-Encoding 是针对整个实体而言的，这是一个 End-to-End Header，而 Transfer-Encoding 是针对一次出传输的消息体而言的，是一个 Hop-by-Hop Header
* Host
   - Host 头主要用来做 application-level routing 的。因为一个 server 可以在一个 IP 地址上同时绑定「多个 Hostname」，那么 server 如何去区分来自于不同 Hostname 的请求呢，就需要通过这个请求头
   - 客户端「必须」带上 Host 这个请求头
   - 当 proxy 收到了一个 absolute-form 的请求对象，proxy 必须忽略 Host 的值并生成基于这个请求对象的一个新的 Host 头
   - 当 proxy 不得不使用 Host 参数的时候需要额外小心，必须确定 IP 和 Host 是正常的对应关系

## References
https://notfalse.net/50/http-intermediary
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#hbh
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding
https://imququ.com/post/transfer-encoding-header-in-http.html

