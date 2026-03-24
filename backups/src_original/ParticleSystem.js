// ==========================================
// 动态粒子流系统 - 生态破坏可视化
// 核心目的：展示候鸟经过被破坏栖息地时受到的伤害
// ==========================================

class Particle {
    constructor(route, progress = 0, healthStatus = 'healthy') {
        this.route = route;
        this.progress = progress;
        this.healthStatus = healthStatus;
        this.age = 0;
        this.maxAge = healthStatus === 'healthy' ? 200 : (healthStatus === 'degraded' ? 120 : 60);
        this.size = 2;
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.speed = 0.005;  // 统一速度，让所有粒子同步
        
        // 扰动参数（用于表现伤害）
        this.disturbance = 0;
        this.disturbanceX = 0;
        this.disturbanceY = 0;
        
        this.updatePosition();
    }

    updatePosition() {
        if (!this.route || !this.route.coords || this.route.coords.length < 2) return;

        const totalSegments = this.route.coords.length - 1;
        const segmentIndex = Math.floor(this.progress * totalSegments);
        const segmentProgress = (this.progress * totalSegments) - segmentIndex;

        if (segmentIndex >= totalSegments) {
            this.x = this.route.coords[this.route.coords.length - 1][0];
            this.y = this.route.coords[this.route.coords.length - 1][1];
            return;
        }

        const [x1, y1] = this.route.coords[segmentIndex];
        const [x2, y2] = this.route.coords[segmentIndex + 1];

        // 基础位置（沿路线）
        this.x = x1 + (x2 - x1) * segmentProgress;
        this.y = y1 + (y2 - y1) * segmentProgress;

        // 根据生态状态添加扰动（表现伤害）
        if (this.healthStatus === 'degraded') {
            // 轻微扰动
            this.disturbance = Math.sin(this.age * 0.05) * 2;
            this.x += this.disturbance;
            this.y += this.disturbance * 0.5;
        } else if (this.healthStatus === 'critical') {
            // 剧烈扰动
            this.disturbance = (Math.random() - 0.5) * 8;
            this.disturbanceX = (Math.random() - 0.5) * 4;
            this.disturbanceY = (Math.random() - 0.5) * 4;
            this.x += this.disturbanceX;
            this.y += this.disturbanceY;
        }
    }

    update() {
        this.age++;
        
        // 沿路线移动
        this.progress += this.speed;

        // 根据生态状态调整透明度和大小
        if (this.healthStatus === 'healthy') {
            // 健康：缓慢衰减，保持完整
            this.opacity = 1 - (this.age / this.maxAge) * 0.2;
            this.size = 2;
        } else if (this.healthStatus === 'degraded') {
            // 退化：中等衰减，轻微缩小
            this.opacity = 1 - (this.age / this.maxAge) * 0.6;
            this.size = 2 - (this.age / this.maxAge) * 0.5;
        } else if (this.healthStatus === 'critical') {
            // 极危：快速衰减，明显缩小
            this.opacity = Math.max(0, 1 - (this.age / this.maxAge) * 1.0);
            this.size = Math.max(0.5, 2 - (this.age / this.maxAge) * 1.5);
        }

        this.updatePosition();
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        if (this.opacity <= 0 || this.progress > 1) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 绘制鸟形粒子
        ctx.fillStyle = this.getColor();
        
        // 中心圆
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // 左翅膀
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.8, 0, this.size * 0.4, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 右翅膀
        ctx.beginPath();
        ctx.ellipse(this.size * 0.8, 0, this.size * 0.4, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 发光效果（根据健康状态变化）
        ctx.strokeStyle = this.getGlowColor();
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = this.opacity * (this.healthStatus === 'healthy' ? 0.6 : 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    getColor() {
        switch (this.healthStatus) {
            case 'healthy':
                return `rgba(16, 185, 129, ${this.opacity})`;  // 翠绿
            case 'degraded':
                return `rgba(245, 158, 11, ${this.opacity})`;  // 琥珀
            case 'critical':
                return `rgba(239, 68, 68, ${this.opacity})`;   // 鲜红
            default:
                return `rgba(16, 185, 129, ${this.opacity})`;
        }
    }

    getGlowColor() {
        switch (this.healthStatus) {
            case 'healthy':
                return '#10B981';
            case 'degraded':
                return '#F59E0B';
            case 'critical':
                return '#EF4444';
            default:
                return '#10B981';
        }
    }

    isDead() {
        return this.age >= this.maxAge || this.progress > 1 || this.opacity <= 0;
    }
}

class ParticleSystem {
    constructor(canvas, routes = [], healthMap = []) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.routes = routes || [];
        this.healthMap = healthMap || [];
        this.emissionRate = 1;  // 每帧每条路线生成 1 个粒子（精细控制）
        this.isRunning = false;
        this.animationId = null;
        this.frameCount = 0;
    }

    setRoutes(routes) {
        this.routes = routes || [];
    }

    setHealthMap(healthMap) {
        this.healthMap = healthMap || [];
    }

    // 从路线生成粒子
    emitParticlesFromRoute(route) {
        if (!route || !route.coords || route.coords.length < 2) return;

        const healthStatus = route.healthStatus || 'healthy';

        // 每条路线每帧生成 1 个粒子，保持精细的流动感
        for (let i = 0; i < this.emissionRate; i++) {
            // 随机起始进度，使粒子分散在路线上
            const startProgress = Math.random() * 0.2;
            const particle = new Particle(route, startProgress, healthStatus);
            this.particles.push(particle);
        }
    }

    update() {
        // 从活跃路线生成新粒子
        this.routes.forEach(route => {
            this.emitParticlesFromRoute(route);
        });

        // 更新粒子状态
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }

        this.frameCount++;
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 按透明度排序（从不透明到透明）
        this.particles.sort((a, b) => b.opacity - a.opacity);

        // 绘制粒子
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
    }

    animate = () => {
        if (!this.isRunning) return;

        this.update();
        this.render();

        this.animationId = requestAnimationFrame(this.animate);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    clear() {
        this.particles = [];
    }

    getParticleCount() {
        return this.particles.length;
    }

    setEmissionRate(rate) {
        this.emissionRate = Math.max(1, Math.min(3, rate));
    }

    destroy() {
        this.stop();
        this.clear();
        this.canvas = null;
        this.ctx = null;
    }
}

export { ParticleSystem, Particle };

