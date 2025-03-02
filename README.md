# AnyCast-WebSite

[![Netlify Status](https://api.netlify.com/api/v1/badges/07a71781-e002-4a8b-ba2e-55b01e21109b/deploy-status)](https://app.netlify.com/sites/pysio-anycast/deploys)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

个人 BGP 站点，基于 Nuxt3 构建，使用 Tailwind CSS 和 DaisyUI 进行样式设计。提供多种网络工具和信息查询服务。

## 🌟 功能特性

### 🛠️ 网络工具箱
- **Looking Glass**: 查看网络路由信息和BGP状态
- **路由追踪**: 追踪网络数据包的传输路径
- **BGP分析器**: 分析BGP路由可见性和路径信息
- **WHOIS查询**: 查询域名和IP地址的注册信息
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

- **框架**: Nuxt3 + Vue3
- **语言**: TypeScript
- **样式**: Tailwind CSS + DaisyUI
- **部署**: Netlify
- **API集成**:
  - BGP.Tools API
  - Tor Metrics API
  - RIPE RIS API
  - DN42 Registry API

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
│   ├── lg.vue         # Looking Glass
│   ├── traceroute.vue # 路由追踪
│   ├── bgp.vue        # BGP分析器
│   ├── whois.vue      # WHOIS查询
│   ├── tor-check.vue  # Tor节点查询
│   └── ...
├── components/         # 可复用组件
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
