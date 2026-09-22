# Schedule

对应 `ModuleB/src/views/ScheduleView.vue`。

## 页面上必须有的

- 默认 Sessions，默认 Day 1。每天 4 场。
- 列表四项：Title、Speaker、Time、Room。Room 前有色点。
- 地点名五处都写 `Room 1` `Room 2` `Room 3` `Room 4` `Hall`，不要自己翻译。
- 点进详情有 Back。详情里有 8 位出席码，等宽、绿色虚线框。
- Speakers：头像、姓名、该讲者的场次。768px 起两列。
- 没有 `speakers.json`。按 `speaker` 字段分组，16 场变成 5 个人。

## 出席码

出席码在 `schedule.json` 的 `code` 字段里。详情页和印章校验读同一个字段，不要自己哈希。输入时 `trim().toLowerCase()` 再比。

```js
export function codeOf(session) {
  return String(session.code).trim().toLowerCase()
}
```

## 头像文件名

练习包是 `speakers/alex-chen.jpg` 这种名字小写、空格变横线。正式素材以 `ls public/speakers` 为准，对不上就显示首字母，不要卡在文件名上。

## 加载失败

```js
errorMessage.value = ''
const data = await loadJSON('api/schedule.json', 'Could not load the schedule. Please try again.')
```

成功时不要把别人的错误清掉。`loadJSON` 本身只在失败时写入 `error-message`。
