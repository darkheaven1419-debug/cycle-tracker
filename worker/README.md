# cycle-tracker-data — 私有数据层 Worker

公开的 PWA（GitHub Pages）与**私有**数据仓库之间的鉴权 + CAS 代理。

- 浏览器只持有**每人一把低权限 app secret**，没有任何 GitHub 权限。
- GitHub PAT 只存在于 Worker secret 里，**不进浏览器、不写日志、不进 response**。
- 仓库名与两个文件路径是 `src/index.js` 里的**字面量**，请求的任何部分都到不了上游 URL —— 结构上不可能是开放代理。
- Worker **不解释业务数据**。合并逻辑（`mergeDiary` / `mergeGratitude` / `mergeEcho`）仍然只在浏览器里，`worker/` 不复制那份逻辑。

---

## 路由表

| Method | Path | 鉴权 | 说明 |
|---|---|---|---|
| `GET` | `/health` | 需要 | `200 {"ok":true,"actor":"andjela"\|"barry"}`；**不访问上游** |
| `GET` | `/state` | 需要 | `200 {"sha":<sha\|null>,"state":<object\|null>}` |
| `PUT` | `/state` | 需要 | body `{"baseSha":<sha\|null>,"state":{…}}` → `200 {"sha":<新sha>}` |
| `GET` | `/todo` | 需要 | `200 {"sha":<sha\|null>,"todo":<array\|null>}` |
| `PUT` | `/todo` | 需要 | body `{"baseSha":<sha\|null>,"todo":[…]}` → `200 {"sha":<新sha>}` |
| `OPTIONS` | 任意已注册路径 | 不需要 | `204` + CORS 头（预检） |

错误体恒为 `{"error":"<code>","message":"…"}`：

| code | status | 何时 |
|---|---|---|
| `bad_origin` | 403 | `Origin` 不是正式 GitHub Pages origin |
| `not_found` | 404 | 未注册路径 |
| （无 body） | 405 | 已注册路径 + 不支持的方法，附 `Allow` |
| `bad_key` | 401 | 缺 app secret / secret 不匹配 |
| `bad_json` | 400 | body 不是合法 JSON 对象 |
| `bad_payload` | 400 | `state` 不是对象 / `todo` 不是数组 / `baseSha` 非字符串 |
| `too_large` | 400 | body > 900 KB |
| `conflict` | 409 | `baseSha` 与远端 sha 不符，**附当前 `sha` 与当前内容** |
| `timeout` | 504 | 上游 8 秒未响应 |
| `upstream` | 502 | 上游其它失败（含 PAT 失效） |

### CAS 语义

`PUT` 是真正的 compare-and-swap：

1. Worker 读远端当前 sha
2. `baseSha === 远端 sha` → 写入
3. 不等 → `409` + **远端当前内容**
4. 客户端合并后重试

**明确禁止**的实现是「GET 当前 sha → 无视客户端的 `baseSha` → 直接 PUT」——那会静默覆盖对方在这中间的写入。`src/index.js` 里 `handleWrite()` 不会走这条路。

---

## 部署步骤

> 需要 Node 18+。下面的 `npx wrangler` 会在首次运行时下载 Wrangler。

### 1. 建私有数据仓库

```bash
gh repo create darkheaven1419-debug/cycle-tracker-data --private \
  --description "Private shared data for cycle-tracker"
```

只放两个文件，**不要**建 `shared-diary.json`（旧架构里它从未被任何 API 调用点引用）：

```
shared-state.json
shared-todolist.json
```

初始内容从当前公开仓库的**线上**版本复制，避免用工作区里的旧快照：

```bash
gh api repos/darkheaven1419-debug/cycle-tracker/contents/shared-state.json \
  --jq '.content' | base64 -d > /tmp/shared-state.json
gh api repos/darkheaven1419-debug/cycle-tracker/contents/shared-todolist.json \
  --jq '.content' | base64 -d > /tmp/shared-todolist.json
```

### 2. 建 fine-grained PAT

GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token：

- **Repository access**：Only select repositories → 只勾 `cycle-tracker-data`
- **Permissions**：`Contents` → **Read and write**（其余全部 No access）
- **Expiration**：设一个到期日，并记进日历

> 这是本方案里权限最高的一把钥匙。它**只**能进 `wrangler secret put`，绝不粘进浏览器、聊天、issue 或任何仓库文件。

### 3. 生成两把 app secret

每人一把，各自独立，随机。生成后立刻存进密码管理器 —— **Worker secret 一旦写入无法再读回**。

```bash
# 每把各跑一次，两次结果不同
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

约定：一把给 andjela，一把给 barry。不要复用，不要用同一个值。

### 4. 登录 Wrangler

```bash
npx wrangler login
```

### 5. 写入三个 secret

```bash
cd worker
npx wrangler secret put GH_PAT            # 粘贴第 2 步的 PAT
npx wrangler secret put APP_KEY_ANDJELA   # 粘贴第 3 步的第一把
npx wrangler secret put APP_KEY_BARRY     # 粘贴第 3 步的第二把
```

三个名字必须完全一致 —— `src/index.js` 通过 `env.GH_PAT` / `env.APP_KEY_ANDJELA` / `env.APP_KEY_BARRY` 读取。

### 6. 部署

```bash
npx wrangler deploy
```

输出里会给出 Worker URL，形如 `https://cycle-tracker-data.<子域>.workers.dev`。记下来，Phase 2 要写进前端。

---

## 部署后验证（Phase 1 gate）

把下面两个变量换成真实值后逐条跑。**`<secret>` 会进入你的 shell 历史，别用 `echo` 回显它。**

```bash
W=https://cycle-tracker-data.<子域>.workers.dev
S='<andjela 的 app secret>'
O=https://darkheaven1419-debug.github.io
```

```bash
# 1. 无 secret → 401
curl -s -o /dev/null -w '%{http_code}\n' -H "Origin: $O" "$W/health"

# 2. 错 secret → 401
curl -s -o /dev/null -w '%{http_code}\n' -H "Origin: $O" -H "Authorization: Bearer wrong" "$W/health"

# 3. 正确 secret → 200
curl -s -H "Origin: $O" -H "Authorization: Bearer $S" "$W/health"
# 期望 {"ok":true,"actor":"andjela"}

# 4. /state GET
curl -s -H "Origin: $O" -H "Authorization: Bearer $S" "$W/state" | head -c 200
# 期望 {"sha":"...","state":{...}}

# 5. /todo GET
curl -s -H "Origin: $O" -H "Authorization: Bearer $S" "$W/todo" | head -c 200
# 期望 {"sha":"...","todo":[...]}

# 6. 非法 route → 404
curl -s -o /dev/null -w '%{http_code}\n' -H "Origin: $O" -H "Authorization: Bearer $S" "$W/nope"

# 7. 非法 method → 405
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE -H "Origin: $O" -H "Authorization: Bearer $S" "$W/state"

# 8. OPTIONS → 204 + CORS
curl -s -o /dev/null -D - -X OPTIONS -H "Origin: $O" \
  -H 'Access-Control-Request-Method: PUT' "$W/state" | grep -i '^\(HTTP\|access-control\|vary\)'
# 期望 204，且 Access-Control-Allow-Origin 恰为 $O（不是 *）

# 9. 错误 origin → 403，且不带 Allow-Origin
curl -s -o /dev/null -D - -H "Origin: https://evil.example" \
  -H "Authorization: Bearer $S" "$W/health" | grep -i '^\(HTTP\|access-control\)'
# 期望 403，且没有 access-control-allow-origin

# 10. 响应里不应出现任何 PAT 片段
curl -s -H "Origin: $O" -H "Authorization: Bearer $S" "$W/state" | grep -c 'ghp_\|github_pat_'
# 期望 0
```

CAS 手工验证（可跳过，`tests/test-worker.js` 已覆盖）：

```bash
# 取 sha
SHA=$(curl -s -H "Origin: $O" -H "Authorization: Bearer $S" "$W/state" \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).sha')
# 用一个明显过期的 baseSha → 期望 409，且 body 里带回当前内容
curl -s -o /dev/null -w '%{http_code}\n' -X PUT \
  -H "Origin: $O" -H "Authorization: Bearer $S" -H 'Content-Type: application/json' \
  -d '{"baseSha":"deadbeefdeadbeefdeadbeefdeadbeefdeadbeef","state":{}}' "$W/state"
# 期望 409
```

---

## 本地契约测试

不需要部署、不需要网络、不需要真实凭据。它动态 `import()` Worker 本体，用一个带 CAS 语义的假 GitHub 顶替 `globalThis.fetch`。

```bash
node tests/test-worker.js
```

---

## 安全边界

| 资产 | 谁知道 | 存在哪 | 泄露后果 |
|---|---|---|---|
| GitHub PAT | 只有 Cloudflare | Worker secret（加密，不可读回） | 能改 `cycle-tracker-data` 全部内容 |
| app secret | 对应那个人 + Cloudflare | 该人的浏览器 `localStorage` | 只能读写那一个数据仓库的两个文件 |
| 仓库名 / 文件路径 | 所有人 | 公开仓库里的 Worker 源码 | 无（不含凭据） |

**故意不做的事**

- 不接受任何 repo / path / ref 参数
- 不返回上游响应体（它可能回显请求头）
- 不打印 secret（Worker 里没有任何 `console.log`）
- 不用 `Access-Control-Allow-Origin: *`
- 不把 merge 逻辑搬进来
- 不实现 Cloudflare Access（已决定暂不纳入路线）

**已知取舍**

- 无 `Origin` 头的请求（`curl`、服务端脚本）会通过 origin 检查 —— 浏览器跨域请求必定带 `Origin`，所以这不削弱浏览器侧防护；非浏览器客户端仍需要 app secret。
- `/health` 会回显 `actor`。它只是「哪把 app secret」，不是 secret 本身。
- 免费额度 100,000 请求/天（UTC 0 点重置）。当前用量估算约 4,320/天，占 4.3%。超限返回 Error 1027。
