# Module A 参考仓库

14 个目录对应比赛里的 14 个仓库。`template-repo-*` 是建仓时可选的模板，这里没有改过。每个任务目录都是从对应模板复制出来，再叠上这道题的参考实现。

比赛当天的 media 会另给 starter。这里的 HTML 是按题目重建的，用来把答案跑起来。当天用题目给的文件覆盖，只改允许改的那个文件。

仓库名按小节标题的两位数字：`B08`、`C06`、`C08`、`C09`，不带 `-E/-M/-H`。

| 目录 | 建仓模板 | 看这个文件 | 分 |
| --- | --- | --- | --- |
| `Starter01` | Vanilla | `index.html` | 必做 |
| `Starter02` | Laravel | `routes/web.php`、`resources/views/info.blade.php` | 必做 |
| `Starter03` | Laravel | `routes/web.php`、`resources/views/table.blade.php`、`database/migrations/` | 必做 |
| `A07` | Vanilla | `css/style.css` 标记以下 | 1.0 |
| `A25` | Vanilla | `index.html` | 0.5 |
| `A23` | Vanilla | `style.css` 标记以下 | 0.5 |
| `A12` | Vanilla | `style.css` | 1.0 |
| `C06` | Vanilla | `result/result.sql` | 1.0 |
| `C08` | Express | `server.js`（不 `require` express） | 1.0 |
| `C09` | Express | `server.js`（不 `require` express） | 1.0 |
| `B08` | Vanilla | `js/script.js` 标记以下 | 0.5 |
| `B19` | Vanilla | `script.js` 标记以下 | 1.5 |
| `B30` | Vanilla | `index.html` | 0.5 |
| `B40` | Vanilla | `index.html` | 0.5 |

Vue 模板这次不用。

## 本地怎么看

静态页直接打开 `index.html`。这些目录里删掉了模板的 `index.php`，因为模板的 Apache 会先找 `index.php`，不删的话部署后首页仍是模板演示，不是题目。

`Starter02`、`Starter03`：

```bash
cp .env.example .env
docker compose up --build
```

模板把宿主机 80 端口占住，本地一次只起一个。`Starter03` 的表名是 `starter03_records`，迁移会写入和 `database/data/records.csv` 一样的 8 行。比赛当天媒体文件格式以现场为准，用 phpMyAdmin 导入，表名继续用自己的前缀。

`C08`、`C09` 不需要 `npm install`：

```bash
PORT=8080 node server.js
```

容器里入口仍是模板的 `node server.js`，默认端口 80。`package.json` 里还留着 express，那是模板自带的；答案文件不能 `require` 它。

`C06` 的交卷文件是 `result/result.sql`。`media/schema.sql` 是按题目假设出来的练习库，方便本地对答案。现场先看 media 里的真实列名，取消字段可能是 `status`、`is_cancelled` 或 `cancelled_at`。

已经核对过：C08、C09 的接口检查通过；C06 对练习库得到 Aurora 720、Cascade 600、Glacier 600、March End 550。Chrome 里把 A12 的 `--n` 改成 8 后，半径约 349.6px，`.a3d` 的 overflow 仍是 visible。A07 的高光动画是 1.4s，图片占位直角。B08 点心形后计数和 sessionStorage 会更新。B19 拼块的 `background-position` 是负值，拖到缺口上会显示 Success。

接口和 SQL 可以再跑一遍：

```bash
node _verify/c08.js
node _verify/c09.js
python3 _verify/build_and_sql.py
```

## 写的时候别踩的点

- A12：`.a3d` 上不能写 `overflow: hidden`。半径从 `--n` 算，不要写死 `30deg`、`12` 或半径。`perspective` 在父元素上。
- A07：`.sk` 要 `overflow: hidden`。`sk--image` 单独 `border-radius: 0`。
- B19：`background-position` 是 `-${targetX}px -${HOLE_Y}px`。`targetX` 至少 100，最大 540。用 Pointer Events 和 `setPointerCapture`。
- B08：`sessionStorage`，不要重复声明标记上面的 `const`。
- C08：`total` 是过滤后的数量。没有结果时 `total_pages` 仍是 1。超出页码返回 200 和空数组。
- C09：校验顺序是房间、容量、开放时间、时间先后、冲突。首尾相接不算冲突，判定用严格小于。新 id 是现有最大 id + 1。
- C06：月份过滤在 `screenings` 上。`HAVING ... > 500`。并列时 `movie_title ASC`。
- Starter02：时间必须出现在页面源代码里，不能用浏览器的 `new Date()`。
