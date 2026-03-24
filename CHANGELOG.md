# CHANGELOG

## 2026-03-20 地图修复

### 已处理
- 新增统一的 `world.json` 地图加载/注册函数，避免多处重复加载与注册时序不一致
- 修复 `MigrationMap`：仅在世界地图注册成功后才执行渲染，不再在注册失败时强行 `setOption(map: 'world')`
- 修复 `StorySection`：补上真实地图容器 `ref={chartRef}`，让故事地图有实际挂载点
- 调整 `StorySection` 初始化顺序：先确保地图注册，再初始化/更新图层
- 修复 `great_bustard` 的资源映射错误：图片字段不再误指向音频文件

### 当前状态
- `npm run build` 已通过
- 地图相关构建级错误未出现

### 待验证
- 浏览器实跑确认 `MigrationMap` 与 `StorySection` 地图均能正常显示
- Lore 刷新页面后确认视觉效果与交互是否符合预期
