# 🏀 篮球比赛专业记分板 (Basketball Scoreboard Pro)

一套功能全面、操作便捷、深度适配**横屏、大屏投屏、球场 LED 屏与技术台操作**的现代化电子篮球记分板与技术统计 Web 应用程序。

基于 **React 19 + TypeScript + Tailwind CSS + Vite** 构建，零第三方音频外部依赖（内置 Web Audio API 原生音效合成），即开即用。

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8)

---

## ✨ 核心特性

- 🎯 **超大比分看板与大屏横屏专属优化**
  - **超醒目比分呈现**：重点放大两队得分数字（高达 `11rem` 级别），采用高对比度发光 LED 风格，即使在球馆远距离、投影仪或大屏电视上也能一目了然。
  - **横屏自适应布局**：采用 `5 : 2 : 5` 黄金比例排布（主队 5 栏 + 中央紧凑时钟 2 栏 + 客队 5 栏），充分利用宽屏横向空间。
  - **分差与领先后缀**：实时计算双方分差，高亮标注领先方（如 `+6分`）或战平状态。
  - **大屏纯净投屏模式 (Stage Mode)**：支持一键切换至纯净大屏展示，隐藏技术台辅助流水与指南，全屏尽显核心比分与计时。
- ⏱️ **平衡双时钟高精度计时**
  - **比赛倒计时 (Game Clock)**：字体紧凑协调，支持节末最后 1 分钟毫秒级精度显示，提供一键 `+10s` / `-10s` / `+1s` / `-1s` 微调与手动设定。
  - **进攻时限 (Shot Clock)**：支持标准 **24 秒** 与前场进攻篮板 **14 秒** 一键重置，低于 5 秒时开启急促闪烁警示。
- 🛑 **犯规、暂停与 BONUS 处罚机制**
  - 单节全队犯规实时统计，达到犯规限制（如 5 次）时自动点亮 **BONUS** 与 **2次罚球** 警示。
  - 点阵式剩余暂停显示，一键叫暂停并自动鸣哨暂停比赛时钟。
- 👥 **球员阵容管理与技术统计 (Box Score)**
  - 支持双方阵容名单管理（球衣号码、球员姓名、在场/替补状态）。
  - 精确记录个人 2分球、3分球、罚球命中数、总得分与个人累计犯规（5犯满犯离场警示）。
- 📝 **Play-by-Play 实时流水与一键撤销**
  - 完整记录比赛每一项得分、犯规、暂停与小节切换事件。
  - 支持 **一键撤销 (Undo / Ctrl+Z)**，误按任何记分或犯规操作均可无损秒级回滚。
- 🔊 **纯原生球馆音效 (Web Audio API)**
  - 内置真实球馆蜂鸣器（Stadium Horn）、裁判清脆哨声（Whistle）、24秒违例蜂鸣与进球提示音，无需加载任何外部音频文件。
- 🏆 **终场战报与数据导出**
  - 自动生成分节得分走势表、评选全场得分王 MVP。
  - 支持一键复制格式化文字战报与一键打印/导出 PDF 比赛总结报告。

---

## ⌨️ 记分员键盘快捷键

为了方便技术台工作人员盲操，系统内置了全套全局键盘快捷键：

| 快捷键 | 功能说明 |
| :--- | :--- |
| **`Space (空格键)`** | 比赛时钟 & 进攻时钟 **启动 / 暂停** |
| **`R`** | 快速重置 **24 秒** 进攻时钟 |
| **`E`** | 快速重置 **14 秒** 进攻时钟 (前场篮板) |
| **`Ctrl + Z` / `Cmd + Z`** | **撤销 (Undo)** 上一次记分/犯规操作 |

---

## 🚀 本地快速开始

### 前置要求
- [Node.js](https://nodejs.org/) (推荐 v18.0 或更高版本)
- npm / yarn / pnpm

### 安装步骤

1. **克隆仓库到本地**：
   ```bash
   git clone https://github.com/您的用户名/basketball-scoreboard.git
   cd basketball-scoreboard
   ```

2. **安装依赖项**：
   ```bash
   npm install
   ```

3. **启动本地开发服务器**：
   ```bash
   npm run dev
   ```
   启动后在浏览器中访问 `http://localhost:3000` 即可开始使用。

4. **构建生产版本**：
   ```bash
   npm run build
   ```
   构建产物将输出至 `dist/` 文件夹中。

---

## ⚙️ 规则与赛事预设

在界面右上角点击 **设置 (⚙️)** 图标，可以一键应用多种常用赛事规则预设：

- **FIBA 国际篮联标准**：10分钟/节，5次单节全队犯规 BONUS，24s / 14s 进攻时限。
- **NBA / CBA 标准**：12分钟/节，5次单节全队犯规 BONUS，24s / 14s 进攻时限。
- **三人篮球 3x3**：10分钟单节，12s 进攻时限，7次犯规加罚。
- **校园 / 青少年比赛**：8分钟/节，可按需微调暂停次数与加时赛时长。

---

## 🛠️ 技术栈

- **框架**：[React 19](https://react.dev/)
- **语言**：[TypeScript](https://www.typescriptlang.org/)
- **构建工具**：[Vite 6](https://vitejs.dev/)
- **样式引擎**：[Tailwind CSS v4](https://tailwindcss.com/)
- **图标库**：[Lucide React](https://lucide.dev/)
- **动画与特效**：[Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **音频引擎**：Web Audio API (原生合成，零静态资源加载)

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源协议。
