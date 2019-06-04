# Docker Swarm Network

Networks
  * overlay -> 用与「服务间」调用
  * ingress -> 「特殊」的 overlay 网络，自动创建，节点间「负载均衡」
  * docker_gwbridge ？
```
Request <----> Swarm Node <----> Service A <----> IPVS(VIP) <----> Service B
```

## 长链接问题
由于 Docker Swarm 的网络模型，服务 A 与 服务 B 连接的时候需要「经过 IPVS」，所以在这个链路上有两个不同的「超时时间」。

可能会出现，IPVS 到服务 B 已经超时了，但是服务 A 到 IPVS 还没有超时，所以当服务 A 继续进行读写操作的时候，会触发错误。

```
Service A <-- TCP --> IPVS <----> Service B
```

TCP 的默认超时
```
tcp_keepalive_timeout 7200s
tcp_keepalive_intvl 75s
tcp_keepalive_probes 9
```

IPVS 的默认超时
```
tcp 900s
tcpfin 120s
udp 300s
```


## 服务发现和负载均衡原理

### 基于 DNS
```
Service A <-- Service B Name --> DNS Server <-- Container IP --> Service B Container IPs
```

启用 DNS （DNS Server 内嵌于 Docker 引擎）
```bash
$ docker service create 
  --endpoint-mode dnsrr 
  --name <service_name> 
  --network <overlay_network> 
  --replicas <replicas_number> 
  <image_name>
```

存在的问题：
主要还是存在与 DNS 缓存可能无法及时更新
1. 某些应用程序将 DNS 名缓存 IP 地址映射
2. 非零 DNS ttl 值会导致 DNS 更新延迟

### 基于 VIP 的负载均衡
* 每个服务都有一个「虚拟IP」（注意只有一个），这个 IP 地址「映射」多个容器的 IP 地址。
* 与服务关联的这个 IP 地址「不会改变」，即使该服务关联的容器死亡并重新启动
* 克服 DNS 各种缓存机制带来的问题

```
Service A <-- Service B Name --> DNS Server <-- Virtual IP --> iptables + IPVS <-- Container IP --> Service B Container IPs
```

服务的虚拟 IP 使用 Linux 内核的 iptables 和 IPVS 负载均衡到服务 B 的多个容器，这其中：
1. iptables 实现「防火墙规则」
2. IPVS 实现「负载均衡」

### Routing Mesh 路由网格
使用 Routing Mesh，服务暴露的端口会暴露在 Swarm 集群中的「所有工作节点」。
Docker 是通过创建「ingress」overlay 网络来实现这一点的，所有节点默认使用内在的 sandbox 网络命名空间成为 ingress 网络的一部分

```
Hostname/IP:Port <----> NAT <----> Ingress <----> iptable + ipvs <----> services
```

## Questions
1. iptables ?
2. ipvs - ipvsadm ?

## References
1. https://anoyi.com/p/dba9342071d8
