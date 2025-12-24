<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">AS213605 下游政策</h1>

      <div class="bg-green-50 border-l-4 border-green-400 p-4 my-4 dark:bg-green-900/20">
        <p class="text-green-700 dark:text-green-200 mb-0">
          <strong>我们支持所有地区和所有人的Peer和下游链接，无门槛，仅限非商业用途。</strong>
        </p>
      </div>

      <p class="mb-4">
        AS213605提供IPv4和IPv6下游连接服务，支持多种连接方式，欢迎所有非商业用途的网络运营商申请。
      </p>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">接入要求</h2>
        <div class="bg-gray-50 p-6 rounded-lg dark:bg-gray-800 mb-6">
          <ul class="space-y-4">
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">使用用途：</span>
                <span>仅限非商业用途，包括学习、研究、个人项目等。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">ASN要求：</span>
                <span>必须拥有有效的公共ASN。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">前缀要求：</span>
                <span>必须拥有有效的IPv4和/或IPv6前缀，并通过RPKI验证。</span>
              </div>
            </li>
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <span class="font-semibold">技术能力：</span>
                <span>必须具备基本的BGP配置能力。</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">连接详情</h2>
        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-network-wired text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">连接类型</h3>
            </div>
            <ul class="space-y-1">
              <li>• IPv4 BGP会话</li>
              <li>• IPv6 BGP会话</li>
              <li>• VXLAN隧道</li>
              <li>• GRE隧道</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-map-marker-alt text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">连接位置</h3>
            </div>
            <ul class="space-y-1">
              <li>• 全球</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-fingerprint text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">本地AS</h3>
            </div>
            <p>213605</p>
          </div>

          <div class="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-3">
              <i class="fas fa-globe text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-lg">连接IP</h3>
            </div>
            <div class="space-y-1 text-sm">
              <p>根据具体情况分配</p>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 p-6 rounded-lg shadow-sm dark:bg-blue-900/20 mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center">
            <i class="fas fa-info-circle text-blue-500 mr-2"></i>
            隧道连接说明
          </h3>
          <div class="space-y-3 text-sm">
            <div>
              <span class="font-semibold">VXLAN隧道：</span>
              <span>适用于跨地区连接，支持二层扩展，提供灵活的网络部署。</span>
            </div>
            <div>
              <span class="font-semibold">GRE隧道：</span>
              <span>传统三层隧道技术，兼容性好，适用于各种网络环境。</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              <i class="fas fa-lightbulb mr-1"></i>
              隧道连接需要提供端点IP地址和相关技术参数，我们将协助您完成配置。
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">路由策略</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-4">
              <i class="fas fa-arrow-right text-green-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-xl">导入策略</h3>
            </div>
            <ul class="space-y-2 pl-6 list-disc">
              <li>仅接受客户自己的前缀</li>
              <li>必须通过RPKI验证</li>
              <li>添加社区标记(213605:0:100)和(213605:0:1000)</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg shadow-sm dark:bg-gray-800">
            <div class="flex items-center mb-4">
              <i class="fas fa-arrow-left text-blue-500 mr-3 text-xl"></i>
              <h3 class="font-bold text-xl">导出策略</h3>
            </div>
            <ul class="space-y-2 pl-6 list-disc">
              <li>向客户导出我们的前缀</li>
              <li>向客户导出对等路由</li>
              <li>向客户导出上游路由</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">社区标记</h2>
        <p class="mb-4">我们使用以下社区标记来管理路由：</p>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <h3 class="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-lg font-semibold">基础社区表</h3>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  社区标记</th>
                <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  描述</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:100</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">客户路由(CUSTOMER)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:200</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">对等路由(PEER)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:300</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">传输/上游路由(TRANSIT)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:1000</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">下游路由(DOWNSTREAM)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:666</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">黑洞路由(BLACKHOLE)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:66:nnn</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">区域黑洞路由(REGIONAL BLACKHOLE, nnn为ISO 3166-1国家代码)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:9000</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">导出到路由服务器(Route Server)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:0:34927</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">不向上游导出(Do Not Export to Upstream)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <h3 class="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-lg font-semibold">RPKI和ASPA验证社区</h3>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  社区标记</th>
                <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  描述</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:10:1</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">RPKI有效(RPKI Valid)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:10:2</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">RPKI未知(RPKI Unknown)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:10:3</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">RPKI无效(RPKI Invalid)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:10:4</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ASPA有效(ASPA Valid)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:10:5</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ASPA未知(ASPA Unknown)</td>
              </tr>
              <tr class="bg-gray-50 dark:bg-gray-700/30">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">213605:10:6</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">ASPA无效(ASPA Invalid)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-8">
          <div>
            <h3 class="text-xl font-bold mb-3">路由分类</h3>
            <div class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <ul class="space-y-3">
                <li><span class="font-mono font-medium">213605:0:100</span> - 标记客户路由，为客户路由设置较高优先级(本地优先级为200)</li>
                <li><span class="font-mono font-medium">213605:0:200</span> - 标记来自对等体的路由</li>
                <li><span class="font-mono font-medium">213605:0:300</span> - 标记来自上游提供商的路由</li>
                <li><span class="font-mono font-medium">213605:0:1000</span> - 通用标记，用于识别所有下游路由，带有此标记的路由会被导出到对等和上游</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-bold mb-3">路由控制</h3>
            <div class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
              <ul class="space-y-3">
                <li><span class="font-mono font-medium">213605:0:666</span> - 标记应当被黑洞的路由，用于缓解DDoS攻击，带有此标记的路由会被丢弃</li>
                <li><span class="font-mono font-medium">213605:66:nnn</span> - 区域黑洞路由，nnn为ISO
                  3166-1国家代码(如840代表美国)，仅在特定区域内黑洞</li>
                <li><span class="font-mono font-medium">213605:0:9000</span> - 标记允许导出到路由服务器的路由</li>
                <li><span class="font-mono font-medium">213605:0:34927</span> - 标记不应该向我们的上游导出的路由</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-bold mb-3">上游控制社区</h3>
            <h4 class="text-lg font-semibold mb-2">基础控制社区</h4>
            <p class="mb-4">我们支持以下功能性社区，用于控制路由如何传递到各上游提供商：</p>

            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      上游提供商</th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      不导出</th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      1x AS路径预置</th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      2x AS路径预置</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">Hurricane Electric</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9130)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9131)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9132)</td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-700/30">
                    <td class="px-4 py-3 whitespace-nowrap text-sm">Liberty Global</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9560)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9561)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9562)</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">Cogent</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9470)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9471)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9472)</td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-700/30">
                    <td class="px-4 py-3 whitespace-nowrap text-sm">Lumen</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9650)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9651)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9652)</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">Zare</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9170)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9171)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9172)</td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-700/30">
                    <td class="px-4 py-3 whitespace-nowrap text-sm">Telia</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9610)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9611)</td>
                    <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">(213605, 3, 9612)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-2">独家导出社区</h4>
            <p class="mb-4">我们还提供"独家导出"社区，使您的路由只向指定的一个上游运营商导出，其他所有运营商都会收到不导出指令：</p>

            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      社区标记</th>
                    <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      功能描述</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">(213605, 5, 6939)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">只向Hurricane Electric导出</td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-700/30">
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">(213605, 5, 6830)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">只向Liberty Global导出</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">(213605, 5, 174)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">只向Cogent导出</td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-700/30">
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">(213605, 5, 3356)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">只向Lumen导出</td>
                  </tr>
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">(213605, 5, 35228)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">只向Zare导出</td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-700/30">
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">(213605, 5, 1299)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">只向Telia导出</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-bold mb-3">使用说明</h3>

            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-semibold mb-2">工作原理</h4>
                <p>当您使用上述社区标记路由时，我们的路由器会识别这些社区并按照您的要求控制路由向上游提供商的传播。</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold mb-2">不导出到特定上游</h4>
                <p class="mb-2">如果您希望某个前缀不被导出到特定上游，请在宣告该前缀时附加对应的"不导出"社区。例如，如果您不希望某个前缀被导出到Hurricane Electric：
                </p>
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono">(213605, 3, 9130)</div>

                <p class="mt-3 mb-2">如果您不希望某个前缀被导出到任何上游：</p>
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono">(213605, 0, 34927)</div>
              </div>

              <div>
                <h4 class="text-lg font-semibold mb-2">AS路径预置</h4>
                <p class="mb-2">如果您希望增加某个前缀到达特定上游的路径长度，可以使用预置社区：</p>
                <ul class="space-y-2">
                  <li><span class="font-medium">单次AS路径预置</span> (例如向Cogent做1次预置): <span class="font-mono">(213605, 3,
                      9471)</span></li>
                  <li><span class="font-medium">双次AS路径预置</span> (例如向Lumen做2次预置): <span class="font-mono">(213605, 3,
                      9652)</span></li>
                </ul>
              </div>

              <div>
                <h4 class="text-lg font-semibold mb-2">独家导出功能</h4>
                <p class="mb-2">如果您希望某个前缀只向指定的一个上游运营商导出，可以使用"独家导出"社区。例如：</p>
                <ul class="space-y-2">
                  <li>只向Hurricane Electric导出: <span class="font-mono">(213605, 5, 6939)</span></li>
                  <li>只向Cogent导出: <span class="font-mono">(213605, 5, 174)</span></li>
                </ul>
                <p class="mt-2">使用这些社区时，系统会自动为其他所有运营商添加不导出标记，确保路由只传递给指定的运营商。</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold mb-2">黑洞路由</h4>
                <p class="mb-2">如果您需要实现黑洞路由功能（例如缓解DDoS攻击），可以使用黑洞社区标记：</p>
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono">(213605, 0, 666)</div>
                <p class="mt-2">带有此标记的路由将会被丢弃，不会传递到目的地。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">申请流程</h2>
        <div class="bg-blue-50 p-6 rounded-lg shadow-sm dark:bg-blue-900/20">
          <ol class="space-y-4 list-decimal pl-6">
            <li class="pl-2">确认您的网络位于支持的地区（FogIXP、AKIXP、香港或美国）</li>
            <li class="pl-2">准备您的ASN和IPv6前缀信息</li>
            <li class="pl-2">选择合适的连接方式（直连/VXLAN/GRE隧道）</li>
            <li class="pl-2">通过邮件联系我们：
              <a href="mailto:team@pysio.online" class="text-blue-500 hover:text-blue-600 font-medium">
                team@pysio.online
              </a>
            </li>
          </ol>

          <div class="mt-6 bg-white p-5 rounded-md dark:bg-gray-800 border-l-4 border-blue-500">
            <h4 class="font-bold text-lg mb-3">提供以下信息：</h4>
            <ul class="space-y-2 pl-5 list-disc">
              <li>您的ASN</li>
              <li>您的IPv6前缀</li>
              <li>您的地理位置和连接信息</li>
              <li>首选连接方式（直连/VXLAN/GRE）</li>
              <li>如需隧道连接，请提供端点IP地址</li>
              <li>技术联系人信息</li>
            </ul>
          </div>
        </div>
      </section>

      <div class="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a href="/anycast" class="inline-flex items-center text-blue-500 hover:text-blue-600">
          <i class="fas fa-arrow-left mr-2"></i>
          返回AS213605网络
        </a>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

onMounted(() => {
  // 页面初始化
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
