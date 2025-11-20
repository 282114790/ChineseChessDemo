
# 璀璨象棋 · ChineseChessDemo

一个基于 **React + Three.js + Vite** 打造的 3D 中国象棋体验。项目支持鼠标拾取棋子、实时高亮可走位置、具备较高水平的 AI 对手，并在落子时播放提示音效，营造沉浸式对弈氛围。

> 运行效果示例  
> ![screenshot](docs/screenshot.jpg)  
> （如需替换截图，请在 `docs/` 目录放入实际图片并更新链接。）

---

## 功能亮点

- **3D 棋盘与棋子**：使用 `@react-three/fiber` 渲染自定义棋盘、九宫斜线、楚河汉界文字以及带贴图的立体棋子。
- **高水平 AI**：采用 Negamax + Alpha-Beta 剪枝，支持“大师/特级大师”两个深度，可自动执黑与玩家轮流走子。
- **易用交互**：鼠标点击即可选子、落子；合法落点、最近一步与选中路径均有不同颜色提示。
- **音效反馈**：每次走子触发 Web Audio API 音效，提升临场感。
- **玻璃拟态 HUD**：右侧控制面板展示执子方、AI 状态、最近着法，并可随时重置对局或调整 AI 等级。

---

## 技术栈

| 领域 | 技术 |
| ---- | ---- |
| 前端框架 | React 18、TypeScript |
| 渲染引擎 | Three.js、@react-three/fiber、@react-three/drei |
| 构建工具 | Vite 5 |
| AI/规则 | 自研 move generator、Negamax 搜索 |
| 其它 | Web Audio API（落子音效）、UUID（棋子 ID） |

---

## 环境要求

- Node.js **≥ 18**（建议 LTS）
- npm（随 Node 自带）

> 可通过 `node -v`、`npm -v` 检查版本。

---

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/<your-account>/ChineseChessDemo.git
cd ChineseChessDemo

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 浏览器访问 http://localhost:5173/

# 4. 构建与预览（可选）
npm run build
npm run preview
```

如果需要在局域网设备访问，可执行：

```bash
npm run dev -- --host 0.0.0.0
```

---

## 目录结构

```
ChineseChessDemo
├── src
│   ├── components       # 3D 棋盘、棋子、HUD 等可视组件
│   ├── game             # 象棋规则、AI、评估函数与工具方法
│   ├── hooks            # 复合状态管理（useChessGame）
│   ├── sound            # 音效
│   ├── styles           # 全局样式
│   └── main.tsx / App.tsx
├── public / docs        # 资源（可选）
├── vite.config.ts
├── package.json
└── README.md
```

---

## 交互说明

- **落子**：点击己方棋子后，会显示蓝色选中环与黄色可落点，再次点击目标格即可执行。
- **AI 对弈**：玩家执红，AI 自动执黑；AI 计算时 HUD 会显示“AI 深度思考中…”提示。
- **重置**：点击 “重新开始” 按钮可回到初始布局。
- **等级切换**：在 HUD 下拉框中切换“大师 / 特级大师”，对应搜索深度 4 / 5。

---

## AI 评估简析

- **搜索算法**：Negamax + Alpha-Beta 剪枝，按走子收益排序以加速剪枝。
- **估值函数**：基础子力表 + 位置信息。包括中央控制、前进奖励、兵卒过河加成、仕相守家奖励、车炮马机动性等。
- **终局判定**：在 `moveGenerator` 中检查将军、将帅冲突、无子可动等情况，并在 `useChessGame` 中更新 `GameState.status`。

如需调高 AI 水平，可在 `src/hooks/useChessGame.ts` 的 `AI_DEPTH` 中增减深度，或在 `src/game/ai.ts` 引入迭代加深、置换表等策略。

---

## 常见问题

1. **浏览器访问不到 `http://localhost:5173/`**  
   - 确保 `npm run dev` 仍在运行；若端口被占用，使用 `npm run dev -- --port 5174`。
   - 若需要外部设备访问，添加 `--host 0.0.0.0`。

2. **页面白屏或构建失败**  
   - 检查终端是否有 TypeScript / ESLint 报错。
   - 删除 `node_modules` 后重新 `npm install`。

3. **音效无声**  
   - 浏览器可能拦截自动播放，尝试先与页面交互（点击）或查看控制台是否存在 AudioContext 错误。

---

## 自定义与扩展

- **棋子材质 / 贴图**：在 `ChessPiece.tsx` 中可修改 `CanvasTexture` 绘制逻辑，换成图片或 PBR 贴图。
- **UI 主题**：`src/styles/global.css` 提供 HUD 与背景样式，可按需自定义。
- **多端支持**：若要接入触摸交互，可在 `InteractiveCell` 中添加 `onPointerDown` / `onTouchStart` 等逻辑。
- **更强 AI**：可尝试加入置换表、迭代加深、杀手着法或开局库等。

---

## 许可证

本项目默认采用 MIT License（如需其它协议请在根目录添加 `LICENSE` 并在此处说明）。

---

欢迎提交 Issue / PR，一起打磨更逼真的 3D 国粹体验！🎉



