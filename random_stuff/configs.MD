# Config

## [12Factor config](https://12factor.net/config)
* config is everything that is likely to vary between deploys(staging, production, developer environments, etc.)
* 配置不应该被 hard coded 在代码中，尤其是 credentials 不应该放在代码中并 commit 到 repo 中
* 配置也可以放在一个独立的文件中，但是随着项目发展，配置可能分布在项目不同的地方，配置文件也会随着环境的增加而越来越多，格式也可能各不相同
* 12factor 要求配置放在「环境变量」中

## [12Factor backend services](https://12factor.net/backing-services)
* A backing service is any service the app 「consumes over the network」 as part of its normal operation
  * datastores
  * messaging/queueing system
  * caching system
* The code for a twelve-factor app makes no distinction between 「local」 and 「third」 party services
* To the app, both are `attached resources`, accessed via a `URL` or other `locator/credentials` stored in the `config`
* Resources can be attached to and detached from deploys `at will`. For example, if the app’s database is misbehaving due to a hardware issue, the app’s administrator might spin up a new database server restored from a recent backup. The current production database could be detached, and the new database attached – all without any code changes

## [Viper](https://github.com/spf13/viper)
Viper uses the following precedence order. Each item takes precedence over the item below it:
 - explicit call to Set
 - flag
 - env
 - config
 - key/value store
 - default
Viper configuration keys are `case insensitive`.

