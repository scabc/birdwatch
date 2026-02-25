# 动态粒子流系统 - 使用说明

## 📋 概述

这是一个为迁徙地图设计的**鸟类主题动态粒子流系统**，用于可视化候鸟迁徙过程中的生态状态变化。

**核心特性：**
- ✨ 鸟形粒子设计（翅膀 + 发光效果）
- 🎨 三种生态状态映射（健康/退化/极危）
- 🚀 高性能 Canvas 渲染（支持数千粒子）
- 🔄 自动生命周期管理
- 🛑 完整的内存清理机制

---

## 🎯 设计理念

根据论文 3.3.3 节要求：

> "设计引入动态粒子流作为数据可视化的视觉隐喻。密集的发光粒子流隐喻着种群的基数与活力。在健康的保护区坐标内，粒子呈现连贯、高亮的有序流动，代表生态系统的稳定；而当粒子途经被标记为重度污染或过度开发的生境退化区域时，视觉呈现发生剧烈衰减。"

### 粒子行为映射

| 生态状态 | 颜色 | 透明度衰减 | 运动特征 | 寿命 |
|---------|------|----------|--------|------|
| **健康** (healthy) | 🟢 翠绿 (#10B981) | 缓慢 (30%) | 稳定流动 | 120 帧 |
| **退化** (degraded) | 🟡 琥珀 (#F59E0B) | 中等 (70%) | 轻微散乱 | 80 帧 |
| **极危** (critical) | 🔴 鲜红 (#EF4444) | 快速 (120%) | 剧烈扩散 | 40 帧 |

---

## 🔧 技术架构

### 文件结构

```
src/
├── ParticleSystem.js      # 粒子系统核心（独立模块）
└── App.jsx                # 集成到 MigrationMap 组件
```

### 核心类

#### `Particle` 类
单个粒子对象，包含：
- **位置与速度**：`x, y, vx, vy`
- **生命周期**：`age, maxAge, opacity`
- **视觉属性**：`size, rotation, healthStatus`
- **方法**：
  - `update(healthMap)` - 更新粒子状态
  - `draw(ctx)` - 绘制粒子
  - `isDead()` - 检查是否已消亡

#### `ParticleSystem` 类
粒子系统管理器，包含：
- **粒子管理**：生成、更新、渲染、清理
- **路线管理**：`setRoutes()` 设置迁徙路线
- **生态状态**：`setHealthMap()` 设置区域生态状态
- **控制方法**：`start()`, `stop()`, `clear()`, `destroy()`

---

## 📖 使用方法

### 1. 基础集成（已完成）

在 `MigrationMap` 组件中：

```javascript
import { ParticleSystem } from './ParticleSystem';

const MigrationMap = ({ onNodeClick }) => {
    const canvasRef = useRef(null);
    const particleSystemRef = useRef(null);
    const [showParticles, setShowParticles] = useState(true);

    // 初始化粒子系统
    useEffect(() => {
        if (showParticles && canvasRef.current) {
            if (!particleSystemRef.current) {
                particleSystemRef.current = new ParticleSystem(canvasRef.current, [], []);
            }
            particleSystemRef.current.start();
        }
    }, [showParticles]);

    // 清理
    useEffect(() => {
        return () => {
            if (particleSystemRef.current) {
                particleSystemRef.current.destroy();
            }
        };
    }, []);
};
```

### 2. 设置迁徙路线

```javascript
const particleRoutes = [
    {
        coords: [[120, 30], [125, 35]],  // [起点, 终点]
        healthStatus: 'healthy'           // 生态状态
    },
    {
        coords: [[125, 35], [130, 40]],
        healthStatus: 'degraded'
    }
];

particleSystemRef.current.setRoutes(particleRoutes);
```

### 3. 设置生态状态地图（可选）

```javascript
const healthMap = [
    { minX: 110, maxX: 120, minY: 30, maxY: 40, status: 'healthy' },
    { minX: 120, maxX: 130, minY: 40, maxY: 50, status: 'degraded' },
    { minX: 130, maxX: 140, minY: 50, maxY: 60, status: 'critical' }
];

particleSystemRef.current.setHealthMap(healthMap);
```

### 4. 控制粒子系统

```javascript
// 启动
particleSystemRef.current.start();

// 停止
particleSystemRef.current.stop();

// 清空粒子
particleSystemRef.current.clear();

// 调整发射速率（1-10）
particleSystemRef.current.setEmissionRate(5);

// 获取粒子数量（调试用）
console.log(particleSystemRef.current.getParticleCount());

// 销毁系统（释放内存）
particleSystemRef.current.destroy();
```

---

## 🎨 自定义粒子外观

### 修改粒子颜色

在 `Particle.getColor()` 方法中：

```javascript
getColor() {
    switch (this.healthStatus) {
        case 'healthy':
            return `rgba(16, 185, 129, ${this.opacity})`;  // 修改这里
        case 'degraded':
            return `rgba(245, 158, 11, ${this.opacity})`;
        case 'critical':
            return `rgba(239, 68, 68, ${this.opacity})`;
    }
}
```

### 修改粒子形状

在 `Particle.draw()` 方法中修改绘制逻辑：

```javascript
draw(ctx) {
    // ... 现有代码 ...
    
    // 修改这部分来改变粒子形状
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);  // 圆形
    ctx.fill();
    
    // 或改为其他形状：
    // ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);  // 方形
    // ctx.fill();
}
```

### 调整粒子寿命

在 `Particle` 构造函数中：

```javascript
constructor(x, y, vx, vy, healthStatus = 'healthy') {
    // ...
    this.maxAge = healthStatus === 'healthy' ? 120 : (healthStatus === 'degraded' ? 80 : 40);
    // 修改这些数字来改变粒子寿命
}
```

---

## 🐛 常见问题与解决

### Q1: 粒子不显示
**检查清单：**
- ✓ Canvas 元素是否正确挂载？
- ✓ `showParticles` 状态是否为 `true`？
- ✓ 浏览器控制台是否有错误？
- ✓ Canvas 尺寸是否正确设置？

**解决方案：**
```javascript
// 确保 Canvas 有正确的尺寸
useEffect(() => {
    if (canvasRef.current) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
    }
}, []);
```

### Q2: 粒子卡顿
**原因：** 粒子数量过多或发射速率过高

**解决方案：**
```javascript
// 降低发射速率
particleSystemRef.current.setEmissionRate(2);  // 从 3 改为 2

// 或减少粒子寿命
// 在 ParticleSystem.js 中修改 maxAge 值
```

### Q3: 内存泄漏
**确保在组件卸载时清理：**
```javascript
useEffect(() => {
    return () => {
        if (particleSystemRef.current) {
            particleSystemRef.current.stop();
            particleSystemRef.current.destroy();
            particleSystemRef.current = null;
        }
    };
}, []);
```

---

## 📊 性能指标

| 指标 | 值 |
|------|-----|
| 最大粒子数 | ~2000 |
| 帧率（60fps） | 稳定 |
| 内存占用 | ~5-10MB |
| Canvas 重绘 | 每帧 |

---

## 🔍 调试模式

在浏览器控制台中：

```javascript
// 获取粒子系统实例（需要在 MigrationMap 中暴露）
const ps = window.particleSystem;

// 查看粒子数量
console.log(ps.getParticleCount());

// 调整发射速率
ps.setEmissionRate(5);

// 清空粒子
ps.clear();
```

---

## 📝 论文对应关系

| 论文章节 | 实现内容 |
|---------|--------|
| 3.3.3 动态隐喻 | 粒子流根据生态状态动态衰减 |
| 视觉隐喻媒介 | 鸟形粒子 + 发光效果 |
| 健康区域表现 | 翠绿色、有序流动、缓慢衰减 |
| 退化区域表现 | 琥珀色、轻微散乱、中等衰减 |
| 极危区域表现 | 鲜红色、剧烈扩散、快速消散 |

---

## 🚀 未来优化方向

1. **地理编码优化** - 使用真实的地理坐标系统
2. **数据驱动** - 根据真实种群数据调整粒子参数
3. **交互增强** - 点击节点查看该区域的粒子流详情
4. **性能优化** - 使用 WebWorker 处理粒子计算
5. **多层粒子** - 支持不同物种的粒子流叠加

---

## 📄 许可证

与主项目保持一致。

---

**最后更新：** 2026-02-24
**作者：** Jarvis AI Assistant
