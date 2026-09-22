# Module A

做题顺序按单位时间拿分：A07、A25、C06、A12、C08、A23、C09、B08、B19，最后才是 B30、B40。

每题一个仓库。名字用 `A07`、`B08`、`C06` 这种两位数字，不要加 `-E`。写完一题就提交，说明写成一句人话。

静态题把素材盖进 Vanilla 模板后，删掉模板的 `index.php`，否则首页仍是模板演示。

C08、C09 选 Express 模板，但 `server.js` 用 Node 自带的 `http`，不能 `require('express')`。

片段都在 [考场粘贴](/paste)。这里只记限制：

| 题 | 只能改 |
| --- | --- |
| A07 | `css/style.css` 标记以下 |
| A12 | `style.css` |
| A23 | `style.css` 标记以下 |
| A25 | 单个 `index.html` |
| B08 | `js/script.js` 标记以下 |
| B19 | `script.js` 标记以下 |
| C06 | `result/result.sql` |
| C08 / C09 | `server.js` 里对应的路由 |
