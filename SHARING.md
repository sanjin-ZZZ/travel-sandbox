# 标准旅行沙盘 Skill

分享整个 `travel-sandbox` 文件夹或它的ZIP，不只分享SKILL.md；固定模板和生成工具也在包里。

## 给使用者

在支持本地Skill的AI工具中导入文件夹。Codex可把文件夹放到自己的 `~/.codex/skills/`，在新任务中使用：

> 使用 $travel-sandbox，帮我规划一次旅行并生成标准沙盘。先了解我的情况，搜集灵感后给我一个大纲讨论，确认后再生成。公开部署前问我。

已有计划的人可以说：

> 使用 $travel-sandbox，把以下已确认行程做成同款旅行沙盘。保留所有四个功能入口和手机布局，不重新设计界面。

AI需要具备联网查资料、本地文件与命令执行能力；部署还需要可用托管服务。Skill不是独立运行的App，也不会自带别人的登录账号。无Node环境时需先准备Node.js 18+；平时生成不必安装npm依赖。

## 先看功能底座

`assets/example-trip.json` 是三人、三城、跨月的虚构演示；不是旅行建议。让AI运行：

```sh
node scripts/generate.mjs assets/example-trip.json /absolute/path/new-demo
```

该命令生成旧SVG功能底座，不是最终插画成品。AI还需按 references/visual-system.md 制作统一城市插画，使用 assets/illustrated-reference 的渲染与排版材料完成适配。用电脑浏览器打开输出的index.html可以预览。要在iPhone上使用，按 `references/delivery.md` 完成HTTPS部署，然后添加主屏幕。直接把HTML发到iPhone不等于已完成手机交付。

## 包内内容

- SKILL.md：AI规划和交付流程。
- assets/template.html：固定、已编译的界面。
- assets/src：可维护源码；功能底座源码。
- assets/example-trip.json：数据格式示例。
- scripts/generate.mjs：检查数据并生成初稿；最终部署还包括城市插画资源。
- references：数据规则、产品验收、部署与手机指南。
- tests：自动化测试。

固定的是产品样式和功能，不是目的地、路线与偏好。此版账本为人民币单币种、无AA结算；记录仅当前设备，不自动同步，当前没有离线重开缓存。分享包不含作者的真实旅行、托管身份或个人记录。
