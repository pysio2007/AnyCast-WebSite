WHOIS查询API文档

基础URL：https://api.example.com

支持的查询类型：

1. IP地址查询
   路径：/ip/{IP地址}
   示例：/ip/1.1.1.1

2. ASN查询
   路径：/asn/{ASN编号}
   说明：ASN编号可以带有或不带有"AS"前缀
   示例：/asn/13335 或 /asn/AS13335

3. 域名查询
   路径：/domain/{域名}
   示例：/domain/example.com

4. DN42查询
   路径：/dn42/{查询对象}
   示例：/dn42/example.dn42

响应格式：
所有API响应均为JSON格式，包含以下字段：
- success: 布尔值，表示查询是否成功
- data: 查询结果数据
- error: 当查询失败时的错误信息

特殊说明：

1. IP地址查询
   使用RIPE数据库的RDAP服务
   返回IP地址的详细注册信息

2. ASN查询
   使用RIPE数据库的RDAP服务
   返回自治系统编号的详细信息

3. 域名查询
   优先使用RDAP服务
   如果RDAP服务不可用，将回退到通用WHOIS服务
   返回格式化的域名注册信息，包括：
   - 域名
   - 状态
   - 注册商
   - 创建日期
   - 更新日期
   - 过期日期
   - 域名服务器

4. DN42查询
   使用DN42 Registry API
   优先进行DNS查询
   如果DNS查询失败，将尝试WHOIS查询

错误处理：
- 400：无效的API路径或查询类型
- 500：服务器内部错误
- 其他状态码：根据上游API返回

CORS支持：
该API支持跨域请求，允许来自任何源的GET和OPTIONS请求。

使用示例：

1. 查询IP信息：
   GET /ip/1.1.1.1

2. 查询ASN信息：
   GET /asn/13335

3. 查询域名信息：
   GET /domain/example.com

4. 查询DN42信息：
   GET /dn42/example.dn42
