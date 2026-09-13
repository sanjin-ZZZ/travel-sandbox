# 旅行数据规则 · schemaVersion 1

先复制 `assets/example-trip.json` 到新旅行目录，再替换内容。模板不接受 HTML 字符串作为布局；所有描述使用普通文字。`scripts/validate-trip.mjs` 是生成前执行的字段校验器。

## 根对象

| 字段 | 含义 |
|---|---|
| schemaVersion | 固定为1 |
| id | 本次旅行唯一、稳定编号，小写字母开头，字母/数字/连字符，最长60。新旅行新编号；同一旅行修订不改编号 |
| title / headline / subtitle | 名称、电脑标题和短描述；不写身份信息，手机隐藏大标题 |
| startDate / endDate | 含年份的YYYY-MM-DD，支持1—31天 |
| travelers / currency | 1—99人；此版币种固定CNY |
| cities | 城市/目的地区域名称列表，1—12个，不得使用保留项“全部”“跨城 / 其他” |
| meta | 0—4条简短出行摘要，不能放证件、订单号 |
| places / days / foods / hotels / regions / practical | 见下 |

## 地点 places

每个地点字段均需填写：`id,name,city,type,icon,desc,stay,caption,status,mapUrl,sourceUrl,checkedAt,verification,locationNote`。

- `type` 为景点/餐饮/咖啡/酒店/交通。`icon` 为 hotel/lake/grass/spring/waterfall/village/cafe/restaurant/airport/market/coast/pagoda-gold/pagoda-silver/garden；图形是类型象征，不是真实建筑。新目的地从同一图形库选择。
- `name` 最长24字符；长名称应在 desc 中补全，地图用可辨认简称。
- `city` 引用根城市名称；`desc` 说明体验、取舍和适合谁；`stay` 是停留建议；`caption` 为地图短说明；`status` 区分主安排、候选、替换等。
- `mapUrl`、`sourceUrl` 是HTTP(S)链接，无资料时明确填空字符串，不用 example.com 或虚构商家网址。地图使用准确门店/入口链接，或标明“仅搜索，分店待核实”。不要求某一地图供应商。
- `checkedAt` 为本次实际查阅核实的日期，未查阅填空；`verification` 为 verified/lead/unknown。verified 必须提供来源和日期，不代表所有动态信息都保证有效。描述里写清核实范围；来源可能只证实存在，不证实票价、营业或口碑。
- `locationNote` 写真实位置的精度/限制。景区公交站不是入口，院落不是咖啡店门口，机场不是租车还车点。菜品灵感无具体门店时，不捏造店址；可作为城市饮食候选，明确地图仅为城市/搜索范围。

## 日程 days

字段：`id,date,city,title,intro,warn,region,items`。每个日期连续覆盖起止日，跨月用完整日期；日期按钮与星期由程序生成。`region` 是当天默认沙盘区域ID。

items 字段：`id,time,name,desc,tag,placeId`。每个活动ID全程唯一。time 可用“上午/09:00”等明确已知时段，tag 可为空；placeId 指向地点，无地点的休息/交通提醒用 null。不要用新的自动日程覆盖已确认安排。

## 餐饮 foods、酒店 hotels、交通 practical

- foods：`placeId,type,kind`，type 是早餐/正餐/小吃/咖啡，kind 是候选说明。同一地点只列一次，其名称、地图和来源统一引用 places。
- hotels：`placeId,checkIn,checkOut,risk`，入住退房在旅行范围内，晚数自动计算，risk 写房型/价格/退改等待核实事项。不可把平台“起价”当用户实际房价。
- practical：`id,title,summary,detail`。用于出发/返程、取还车、预约、天气、特殊限制等；手机摘要卡点开正文与补充备注。订票日期不是出发日期，起飞不是抵达机场时间。

## 示意沙盘 regions

必填字段：`id,name,title,en,note,nodes,routes`；可选 `terrain,unlocated,areas,panels`。一般每城一张图；大范围或极密集城市可按真实片区拆图。`day.region` 指定默认城市/片区，不由标题或地点名称猜测。

- nodes：`placeId,x,y`，可选布尔值 `detail`。1000×670画布，x110—890、y110—560；每图最多40点，非detail大模型最多12点。坐标是示意布局，不是经纬度。`detail: true` 用较小模型，点选能力不变。详情与缩放验收见 [需求适配](adaptive-map.md)。
- terrain：`hills` 或 `lowland`，选择合适的示意轮廓；不承诺复刻真实地貌。
- unlocated：地点ID列表，最多30项。未选门店、位置未核实的地点保留在可点击索引，不虚构标点；同一图中不能既标点又待定位。
- areas：可选 `[{label,x,y,w,h}]`，仅作为片区布局资料，不依赖它生成真实边界或道路。
- 每个places条目至少出现在一张图的nodes或unlocated中。保留核实的大致方位；标签重叠通过布局与主次处理，不靠隐藏地点。
- routes：`{dayId,stops,legs}`，当天默认区域需有该日路线。stops按已确认顺序引用该图上的点，可重复住处；没选的备选不计入主线。
- legs逐段对应stops：`from,to,path,label,x,y,optional,returning`。path是单段二次曲线 `M … Q …`；optional是虚线，returning是绿色返回。曲线是顺序示意，不是道路。仅一个确认停留点时stops含该点、legs为空。
- 跨城总览为可选的兼容结构：`panels:[城市regionId,…]`、`nodes:[]`，routes只存完整stops、legs为空；复用城市坐标，禁止嵌套总览。当前城市按钮不列panels总览，普通旅行使用城市图作为day.region，不把总览当作默认入口。

## 分享与记录

trip.json 和生成的HTML包含完整行程，会成为发布内容。仅填写可以公开的旅行信息；私人订单、备注和账单由用户在使用时添加，不能预装在模板内。用户不愿公开具体日期/酒店时，停止公开部署，讨论访问限制，不擅自开放。

金额以整数分保存；人数来自 travelers，人均不是AA结算。跨币种旅程需用户确认人民币记账口径，不自动汇率换算。不同旅行的备份不可互相导入；更新同一旅行保留地点/活动ID，否则历史勾选可能不再对应原项目。

