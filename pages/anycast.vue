<template>
  <div class="container mx-auto px-4 py-8">
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">AS213605 Networks</h1>

      <p class="mb-4">
        PYSIO-NetWork (
        <a href="https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=AS213605&type=aut-num"
          class="text-blue-500 hover:text-blue-600" target="_blank">AS213605</a>,
        <a href="https://wq.apnic.net/apnic-bin/whois.pl?searchtext=AS154185" class="text-blue-500 hover:text-blue-600"
          target="_blank">AS154185</a>
        ) 是一个独立运营的网络系统。
      </p>

      <div class="bg-green-50 border-l-4 border-green-400 p-4 my-4 dark:bg-green-900/20">
        <p class="text-green-700 dark:text-green-200">
          我们支持所有地区和所有人的Peer和下游链接，无门槛，仅限非商业用途。查看我们的<a href="/ix"
            class="text-green-600 hover:text-green-800 font-semibold dark:text-green-300 dark:hover:text-green-100">IX交换点</a>了解详细信息。如果您对
          DN42 网络感兴趣，请查看我们的 DN42 页面。
        </p>
      </div>

      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 dark:bg-blue-900/20">
        <p class="text-blue-700 dark:text-blue-200">
          我们现在支持下游连接！无论您位于哪个地区，欢迎查看我们的
          <a href="/downstream"
            class="text-blue-600 hover:text-blue-800 font-semibold dark:text-blue-300 dark:hover:text-blue-100">下游政策</a>。
        </p>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">网络信息</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition duration-300 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-network-wired text-blue-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-blue-800 dark:text-blue-200">ASN</h3>
            </div>
            <div class="space-y-2">
              <code
                class="block bg-white/80 p-3 rounded-lg font-mono text-lg font-semibold text-blue-900 dark:bg-gray-800 dark:text-blue-300">AS213605</code>
              <code
                class="block bg-white/80 p-3 rounded-lg font-mono text-lg font-semibold text-blue-900 dark:bg-gray-800 dark:text-blue-300">AS154185</code>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition duration-300 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-globe text-purple-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-purple-800 dark:text-purple-200">IPv6 地址块</h3>
            </div>
            <div class="space-y-2">
              <code
                class="block bg-white/80 p-3 rounded-lg font-mono text-sm font-semibold text-purple-900 dark:bg-gray-800 dark:text-purple-300">2a14:67c1:a020::/44</code>
              <code
                class="block bg-white/80 p-3 rounded-lg font-mono text-sm font-semibold text-purple-900 dark:bg-gray-800 dark:text-purple-300">2a14:67c1:b100::/40</code>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition duration-300 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border-indigo-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-network-wired text-indigo-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-indigo-800 dark:text-indigo-200">IPv4 地址块</h3>
            </div>
            <div class="space-y-2">
              <code
                class="block bg-white/80 p-3 rounded-lg font-mono text-sm font-semibold text-indigo-900 dark:bg-gray-800 dark:text-indigo-300">49.213.62.0/24</code>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition duration-300 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <i class="fas fa-exchange-alt text-green-500 text-lg"></i>
              </div>
              <h3 class="font-bold text-green-800 dark:text-green-200">交换点</h3>
            </div>
            <div class="space-y-2">
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                AKIX</div>
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                FogIXP</div>
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                LOCIX FRANKFURT</div>
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                INTERIX</div>
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                STUIX</div>
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                ONXI</div>
              <div
                class="bg-white/80 p-2 rounded text-sm font-medium text-green-900 dark:bg-gray-800 dark:text-green-300">
                TPIX-TW</div>
            </div>
          </div>

        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">Looking Glass</h2>
        <p class="mb-4">
          您可以通过我们的 Looking Glass 服务查看网络状态：
          <a href="https://anycast.ink/lg" class="text-blue-500 hover:text-blue-600" target="_blank">
            https://anycast.ink/lg
          </a>
        </p>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">节点列表</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- AKIX-Frankfurt -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-de w-5 mr-2"></span>
                AKIX-Frankfurt
              </h3>
              <span
                class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>10Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Digital Realty Frankfurt FRA1-16</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS210440 & AKIXP 主控</li>
            </ul>
          </div>

          <!-- HongKong Master -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                HongKong Master
              </h3>
              <span
                class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>30Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Equinix HK2</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-exchange-alt mr-2"></i>接入 AKIX</li>
            </ul>
          </div>

          <!-- New Jersey -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                Anycast-NewJersey
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$3.5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 0.5TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
            </ul>
          </div>

          <!-- Tokyo -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-jp w-5 mr-2"></span>
                Anycast-Tokyo
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
            </ul>
          </div>

          <!-- Amsterdam -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-nl w-5 mr-2"></span>
                Anycast-Amsterdam
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
            </ul>
          </div>

          <!-- Mumbai -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-in w-5 mr-2"></span>
                Anycast-Mumbai
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Vultr</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
            </ul>
          </div>

          <!-- Hong Kong -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                Anycast-HongKong
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">¥31/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>500Mbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>SkyWolf</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session (Premium)</li>
            </ul>
          </div>

          <!-- Florida -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                AnyCast-Florida
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$3.5/月</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>3Gbps, 100TB/月</li>
              <li><i class="fas fa-server mr-2"></i>Frantech</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
            </ul>
          </div>

          <!-- Tallinn -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-ee w-5 mr-2"></span>
                Anycast-Tallinn
              </h3>
              <span
                class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">€18.95/季</span>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>V.PS</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
            </ul>
          </div>

          <!-- BUYVM Luxembourg -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-lu w-5 mr-2"></span>
                Luxembourg
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded dark:bg-purple-900 dark:text-purple-200">边缘节点</span>
                <span
                  class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$15/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>10Gbps</li>
              <li><i class="fas fa-server mr-2"></i>BUYVM</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-chart-line mr-2"></i>边缘网络节点</li>
            </ul>
          </div>

          <!-- BUYVM New York -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                NewYork
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded dark:bg-purple-900 dark:text-purple-200">边缘节点</span>
                <span
                  class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$15/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>10Gbps</li>
              <li><i class="fas fa-server mr-2"></i>BUYVM</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-chart-line mr-2"></i>边缘网络节点</li>
            </ul>
          </div>

          <!-- IFog Switzerland -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-ch w-5 mr-2"></span>
                Schweiz
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">CHF
                  12.00/季</span>
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps, 1TB/月</li>
              <li><i class="fas fa-server mr-2"></i>IFog</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-exchange-alt mr-2"></i>接入 FogIXP</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- HK Downstreams -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                HK-Downstreams
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Equinix HK1</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- US Downstreams -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                US-Downstreams
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">$2/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>SkyWolf</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- STUIX-Taiwan -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-tw w-5 mr-2"></span>
                STUIX-Taipei
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Moedove</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- Hong Kong -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-hk w-5 mr-2"></span>
                HongKong
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Moedove</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- Singapore -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-sg w-5 mr-2"></span>
                Singapore
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Moedove</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- Germany -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-de w-5 mr-2"></span>
                Germany
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Moedove</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- USA -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-us w-5 mr-2"></span>
                USA
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">暂不公开/月</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>1Gbps</li>
              <li><i class="fas fa-server mr-2"></i>Moedove</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>

          <!-- ONIX -->
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold flex items-center">
                <span class="fi fi-ca w-5 mr-2"></span>
                ONIX-Ontario
              </h3>
              <div class="flex gap-2">
                <span
                  class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">下游服务</span>
                <span
                  class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">新增</span>
              </div>
            </div>
            <ul class="space-y-1 text-sm">
              <li><i class="fas fa-network-wired mr-2"></i>100Mbps</li>
              <li><i class="fas fa-server mr-2"></i>Ontario Internet Exchange</li>
              <li><i class="fas fa-globe mr-2"></i>IPv4 + IPv6</li>
              <li><i class="fas fa-route mr-2"></i>AS213605 BGP Session</li>
              <li><i class="fas fa-cloud-download-alt mr-2"></i>支持下游</li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
