# 信息架构优化方案

## 当前问题

1. **标题层级混乱**
   - 缺少主 h1 标题
   - h2 和 h3 混用，没有清晰的层级关系
   - 影响屏幕阅读器和 SEO

2. **响应式设计不完整**
   - 某些部分在移动设备上可能有问题
   - 需要测试 375px, 768px, 1024px, 1440px 断点

3. **渐进式披露不足**
   - 物种详情弹窗已有，但可以优化
   - 数据中心的信息可以更好地分层

## 优化方案

### 第一步：修复标题层级

**主页面结构：**
```
<h1>BirdWatch - 西太平洋迁徙通道濒危候鸟信息可视化</h1>
  <section id="hero">
    <h2>万里归途</h2>
  </section>
  <section id="map">
    <h2>迁徙轨迹</h2>
    <h3>Flight Pathways</h3>
  </section>
  <section id="story">
    <h2>生命迁徙长卷</h2>
    <h3>Chapter titles</h3>
  </section>
  <section id="hub">
    <h2>见证者实验室</h2>
    <h3>Station titles</h3>
  </section>
  <section id="timeline">
    <h2>保护历程</h2>
    <h3>Event titles</h3>
  </section>
  <section id="species">
    <h2>物种库</h2>
    <h3>Species names</h3>
  </section>
```

### 第二步：优化响应式设计

- 检查所有 section 的 padding/margin
- 确保文本在小屏幕上可读
- 测试所有断点

### 第三步：改进渐进式披露

- 物种卡片：显示基本信息，点击展开详情
- 数据中心：默认显示趋势图，可切换其他图表
- 时间线：显示年份和标题，点击展开详情

## 实施优先级

1. **高** - 添加主 h1 标题
2. **高** - 修复各 section 的 h2 标题
3. **中** - 检查响应式设计
4. **中** - 优化渐进式披露

## 预期效果

- ✅ 屏幕阅读器可以正确导航
- ✅ SEO 更好
- ✅ 用户体验更清晰
- ✅ 移动设备适配更好
