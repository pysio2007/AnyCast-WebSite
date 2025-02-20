# Bird-lg-go API 文档

本文档描述了用于执行 BIRD/traceroute/whois 查询的前端 API。

API 接口: `https://lg.pysio.online/api/` (注意：末尾的斜杠不能省略!)

请求以 POST 方式发送，使用 JSON 格式的请求体。

## 请求字段说明

| 字段名 | 类型 | 说明 |
| ---- | ---- | -------- |
| `servers` | 字符串数组 | 要查询的服务器列表 |
| `type` | 字符串 | 可选值：`summary`, `bird`, `traceroute`, `whois` 或 `server_list` |
| `args` | 字符串 | 传递的参数，具体见下文 |

各类型参数说明：

- `summary`: `args` 不使用，建议设置为空字符串
- `bird`: `args` 为传递给 bird 的命令，例如 `show route for 8.8.8.8`
- `traceroute`: `args` 为追踪目标，例如 `8.8.8.8` 或 `google.com`
- `whois`: `args` 为 whois 查询目标，例如 `8.8.8.8` 或 `google.com`
- `server_list`: `args` 不使用，且 `servers` 也不使用

## 使用示例

### curl 示例

查询 BGP 路由:
```bash
curl -X POST https://lg.pysio.online/api/ \
  -H "Content-Type: application/json" \
  -d '{
    "servers": ["gigsgigscloud"],
    "type": "bird",
    "args": "show route for 8.8.8.8"
  }'
```

获取服务器列表:
```bash
curl -X POST https://lg.pysio.online/api/ \
  -H "Content-Type: application/json" \
  -d '{
    "servers": [],
    "type": "server_list",
    "args": ""
  }'
```

路由追踪:
```bash
curl -X POST https://lg.pysio.online/api/ \
  -H "Content-Type: application/json" \
  -d '{
    "servers": ["gigsgigscloud"],
    "type": "traceroute",
    "args": "8.8.8.8"
  }'
```

### PowerShell 示例

查询 BGP 路由:
```powershell
$uri = "https://lg.pysio.online/api/"
$body = @{
    servers = @("gigsgigscloud")
    type = "bird"
    args = "show route for 8.8.8.8"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json"
$response.result | ForEach-Object {
    Write-Host "Server: $($_.server)"
    Write-Host "Data: $($_.data)"
}
```

获取服务器列表:
```powershell
$uri = "https://lg.pysio.online/api/"
$body = @{
    servers = @()
    type = "server_list"
    args = ""
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json"
$response.result | ForEach-Object {
    Write-Host "Available server: $($_.server)"
}
```

获取 BGP 汇总信息:
```powershell
$uri = "https://lg.pysio.online/api/"
$body = @{
    servers = @("gigsgigscloud")
    type = "summary"
    args = ""
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json"
$response.result | ForEach-Object {
    Write-Host "Server: $($_.server)"
    $_.data | ForEach-Object {
        Write-Host "Peer: $($_.name), State: $($_.state), Info: $($_.info)"
    }
}
```

## 响应格式

### summary 类型响应字段

| 字段名 | 类型 | 说明 |
| ---- | ---- | -------- |
| `error` | 字符串 | 错误信息，正常时为空 |
| `result` | apiSummaryResultPair 数组 | 查询结果，见下文 |

#### apiSummaryResultPair 字段

| 字段名 | 类型 | 说明 |
| ---- | ---- | -------- |
| `server` | 字符串 | 服务器名称 |
| `data` | SummaryRowData 数组 | 服务器汇总信息 |

#### SummaryRowData 字段

对应 `birdc show protocols` 的输出格式：

| 字段名 | 类型 |
| ---- | ---- |
| `name` | 字符串 |
| `proto` | 字符串 |
| `table` | 字符串 |
| `state` | 字符串 |
| `since` | 字符串 |
| `info` | 字符串 |

### bird/traceroute/whois/server_list 类型响应字段

| 字段名 | 类型 | 说明 |
| ---- | ---- | -------- |
| `error` | 字符串 | 错误信息，正常时为空 |
| `result` | apiGenericResultPair 数组 | 查询结果，见下文 |

#### apiGenericResultPair 字段

| 字段名 | 类型 | 说明 |
| ---- | ---- | -------- |
| `server` | 字符串 | 服务器名称（whois 类型时为空） |
| `data` | 字符串 | 服务器返回结果（server_list 类型时为空） |
