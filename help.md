*   链接db 都是需要异步
*   aws 本地调试，会超时/需要重新更新
*   CyclicDB 内置的方法比较快，其他的js方法都是要全部拉取数据之后，筛选数据
*   post接口需要验证token，验证此数据至关重要。runtypes我们可以使用另一个库来方便地检查对象的字段，而不是检查每个字段及其值的存在。

```js
"nodemon": "^2.0.16", // node服务
"@cyclic.sh/dynamodb": "^0.0.33", // 链接aws数据库 另一种可能更好，后面切换https://www.npmjs.com/package/aws-sdk
"@faker-js/faker": "^7.6.0",  // 生成假数据/尽量真的数据
"env-cmd": "^10.1.0", // 区分环境用
"express": "^4.18.1", // api服务
"jsonwebtoken": "^9.0.0", // JWT 验证
"runtypes": "^6.6.0", // 检查对象的字段/类似ts中的type ，如果是外部json的类型，就需要他来验证了
"slugify": "^1.6.5", // 处理string 完整展示，支持别国语言
"uuid": "^9.0.0" // 随机uuid
```

生成加密方法  require("crypto").randomBytes(64).toString("hex")