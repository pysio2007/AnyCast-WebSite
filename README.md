# AnyCast-WebSite

[![Netlify Status](https://api.netlify.com/api/v1/badges/07a71781-e002-4a8b-ba2e-55b01e21109b/deploy-status)](https://app.netlify.com/sites/pysio-anycast/deploys)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

个人 BGP 站点，基于 Nuxt 4 构建，使用 [shadcn-vue](https://www.shadcn-vue.com/) + Tailwind CSS v4 进行样式设计。提供多种网络工具和信息查询服务，页面数据在访问时实时从公开数据源（RIPEstat、PeeringDB 等）获取。

## 🌟 功能特性

### 🛠️ 网络工具箱
- **BGP 路由查询**: 基于 RIPE RIS 全球路由采集点的公共 Looking Glass（前缀 / IP / ASN）
- **全球 Ping / 路由追踪 / 全球路由追踪**: 基于 Globalping 开放探针网络
- **WHOIS查询**: 基于 RDAP 查询域名、IP 与 ASN 注册信息
- **Tor节点查询**: 检查IP是否为Tor网络节点并显示详细信息

### 🌐 网络服务
- **Anycast**: 基于 BGP 的全球加速服务
- **DN42**: DN42网络接入和信息
- **Tor**: Tor网络出口节点服务
- **BGP**: BGP路由和AS信息展示

### 📱 界面设计
- 现代化的响应式设计
- 支持亮色/暗色主题
- 优雅的动画效果
- 直观的数据可视化

### 🔧 技术特性
- 实时数据更新
- 全球CDN加速
- API健康监控
- 安全的HTTPS访问

## 🚀 技术栈

- **框架**: Nuxt 4 + Vue 3
- **语言**: TypeScript
- **样式**: Tailwind CSS v4 + shadcn-vue（Reka UI）+ Lucide 图标（LIR 页面保留原 DaisyUI 设计）
- **部署**: Netlify
- **数据源**:
  - RIPEstat Data API（前缀、邻居、可见性）
  - PeeringDB API（IX 互联）
  - Globalping API（Ping、Traceroute、MTR）
  - RDAP（rdap.org）
  - Tor Onionoo API

## 💻 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📦 项目结构

```
AnyCast-WebSite/
├── pages/              # 页面组件
│   ├── tools.vue       # 工具箱主页
│   ├── bgp.vue        # BGP 路由查询（RIPE RIS Looking Glass）
│   ├── ping.vue       # 全球 Ping
│   ├── traceroute.vue # 路由追踪（MTR）
│   ├── whois.vue      # WHOIS查询
│   ├── tor-check.vue  # Tor节点查询
│   └── ...
├── components/         # 站点组件（SiteHeader、PageHeader 等）
│   └── ui/             # shadcn-vue 组件
├── composables/        # 公开数据 API 封装（useRipeStat、usePeeringDb、useGlobalping）
├── lib/                # 站点常量与导航（site.ts）、cn 工具
├── public/            # 静态资源
└── utils/             # 工具函数
```

## 🔄 自动部署

项目配置了 Netlify 自动部署流程：
- 推送到 `main` 分支自动触发部署
- 自动化的构建和测试
- 全球 CDN 分发

## 📄 许可证

本项目采用 [GNU Affero General Public License v3.0](LICENSE) 开源协议。
根据 AGPL-3.0 协议的要求，任何对本软件的修改和使用都需要开源并保持同样的协议。

## 👨‍💻 作者

**Pysio**

- GitHub: [@pysio2007](https://github.com/pysio2007)
- Blog: [pysio.online](https://www.pysio.online)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。
