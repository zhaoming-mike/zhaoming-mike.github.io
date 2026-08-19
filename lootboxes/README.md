# Pandora 开箱模拟器 — GitHub Pages 发布包

本目录是打包好的静态站点,可直接发布到 GitHub Pages。

## 发布方式(任选其一)

1. **推送到 gh-pages 分支**:把本目录所有文件作为仓库根目录,推到 `gh-pages` 分支,在仓库 Settings → Pages 选择该分支。
2. **放到 /docs**:把本目录内容放进仓库的 `docs/` 文件夹,Settings → Pages 选择 "Deploy from a branch" → `/docs`。
3. **GitHub Actions**:用 `actions/configure-pages` + `actions/upload-pages-artifact` 把本目录作为站点产物上传。

发布后访问地址形如:`https://<你的用户名>.github.io/<仓库名>/`

## 重要:路径说明

包内全部使用**相对路径**(`./assets/...`、`localize.js` 等),因此无论在根路径还是任意子路径下都能正常工作,无需额外配置 base。

## 关于本包

本目录是**纯静态内容**(仅 HTML/CSS/JS/图片),专用于 GitHub Pages 发布,不含任何本地启动脚本。

## 本地预览(用主项目目录)

本地调试请到**主项目目录**(本包的上层)运行:

```bash
node server.js          # 然后浏览器打开 http://localhost:8080/
# 或
start-web.bat           # Windows Terminal + PowerShell 单窗口启动
```

主项目目录的 `server.js` / `start-web.bat` / `start-web.ps1` 只是本地静态预览工具,不属于发布内容。

## 汉化配置

界面文字在 `ui-text.json` 中,`text` = 精确匹配、`contains` = 子串替换、`attributes` = 属性值。编辑后刷新即可。
