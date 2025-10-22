<template>
  <div class="container mx-auto px-4 py-8">
    <PageSeo title="LIR Services - RIPE NCC and APNIC Member"
      description="As an official member of RIPE NCC and APNIC, we provide comprehensive LIR services including ASN allocation and IPv4/IPv6 address space management" />

    <Head>
      <Meta name="keywords" content="LIR Services, RIPE NCC, APNIC, ASN Allocation, IPv4 Address, IPv6 Address, Internet Number Allocation, Internet Resource Management, Address Space" />
    </Head>
    <article class="prose dark:prose-invert max-w-none">
      <h1 class="text-4xl font-bold mb-6">LIR Services</h1>

      <p class="mb-4">
        We are official members of RIPE NCC and APNIC, providing comprehensive LIR (Local Internet Registry) services,
        including ASN allocation and IPv4/IPv6 address space management.
      </p>

      <div class="flex flex-wrap gap-8 my-8 items-center justify-center">
        <img
          src="https://anycast.ink/cdn-cgi/image/f=webp,onerror=redirect,slow-connection-quality=50/https://anycast.ink/RIR/RIPE-NCC-Member.png"
          alt="RIPE NCC Member Logo" style="max-width: 240px; height: auto; object-fit: contain;" loading="lazy" />
        <img
          src="https://anycast.ink/cdn-cgi/image/f=webp,onerror=redirect,slow-connection-quality=50/https://anycast.ink/RIR/apnic-seeklogo.png"
          alt="APNIC Logo" style="max-width: 220px; height: auto; object-fit: contain;" loading="lazy" />
      </div>

      <div class="mt-4 mb-2 text-sm flex flex-wrap gap-x-8 gap-y-2">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-50 dark:bg-blue-900/15 mr-2"></div>
          <span>Requires review & KYC process</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-50 dark:bg-red-900/15 mr-2"></div>
          <span>Temporarily out of stock</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-yellow-50 dark:bg-yellow-900/15 mr-2"></div>
          <span>Low stock</span>
        </div>
      </div>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">RIPE NCC LIR Services</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>RIPE Service Type</th>
                <th>Price (Monthly CNY)</th>
                <th>Price (Monthly USD)</th>
                <th>Price (Annual CNY)</th>
                <th>Price (Annual USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="bg-blue-50 dark:bg-blue-900/15 !odd:bg-blue-50 !even:bg-blue-50">
                <td>RIPE ASN Registration + /44 IPv6</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>¥621/year</td>
                <td>$85/year</td>
              </tr>
              <tr>
                <td>IPv6 PA /44 ~ /48</td>
                <td>¥0/month</td>
                <td>$0/month</td>
                <td>¥0/year</td>
                <td>$0/year</td>
              </tr>
              <tr>
                <td>IPv6 Subnet Rental (/40)</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>¥73/year</td>
                <td>$10/year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">APNIC LIR Services</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>APNIC Service Type</th>
                <th>Price (Monthly CNY)</th>
                <th>Price (Monthly USD)</th>
                <th>Price (Annual CNY)</th>
                <th>Price (Annual USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>APNIC ASN Registration</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>First year ¥3000<br>Renewal ¥500/year</td>
                <td>First year $450<br>Renewal $100/year</td>
              </tr>
              <tr class="bg-red-50 dark:bg-red-900/15 !odd:bg-red-50 !even:bg-red-50">
                <td>APNIC IPv6 PA /44 ~ /48</td>
                <td>¥0/month</td>
                <td>$0/month</td>
                <td>¥0/year</td>
                <td>$0/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /43</td>
                <td>¥37/month</td>
                <td>$5/month</td>
                <td>¥365/year</td>
                <td>$50/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /42</td>
                <td>¥44/month</td>
                <td>$6/month</td>
                <td>¥438/year</td>
                <td>$60/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /41</td>
                <td>¥51/month</td>
                <td>$7/month</td>
                <td>¥511/year</td>
                <td>$70/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /40</td>
                <td>¥58/month</td>
                <td>$8/month</td>
                <td>¥584/year</td>
                <td>$80/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /39</td>
                <td>¥95/month</td>
                <td>$13/month</td>
                <td>¥949/year</td>
                <td>$130/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /38</td>
                <td>¥146/month</td>
                <td>$20/month</td>
                <td>¥1460/year</td>
                <td>$200/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /37</td>
                <td>¥204/month</td>
                <td>$28/month</td>
                <td>¥2044/year</td>
                <td>$280/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /36</td>
                <td>¥292/month</td>
                <td>$40/month</td>
                <td>¥2920/year</td>
                <td>$400/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /35</td>
                <td>¥438/month</td>
                <td>$60/month</td>
                <td>¥4380/year</td>
                <td>$600/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /34</td>
                <td>¥657/month</td>
                <td>$90/month</td>
                <td>¥6570/year</td>
                <td>$900/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PA /33</td>
                <td>¥1168/month</td>
                <td>$160/month</td>
                <td>¥11680/year</td>
                <td>$1600/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PI /48</td>
                <td>¥37/month</td>
                <td>$5/month</td>
                <td>¥365/year</td>
                <td>$50/year</td>
              </tr>
              <tr>
                <td>APNIC IPv6 PI /32</td>
                <td>¥1606/month</td>
                <td>$220/month</td>
                <td>¥16060/year</td>
                <td>$2200/year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">ARIN Services</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>ARIN Service Type</th>
                <th>Price (Monthly CNY)</th>
                <th>Price (Monthly USD)</th>
                <th>Price (Annual CNY)</th>
                <th>Price (Annual USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ARIN IPv4 /24</td>
                <td>¥876/month</td>
                <td>$120/month</td>
                <td>¥10512/year</td>
                <td>$1440/year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">LIR Service Information</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">What is LIR?</h3>
            <p>LIR (Local Internet Registry) is a local registration authority for Internet number resources, responsible for allocating IP addresses and AS numbers to end users or smaller ISPs. As members of RIPE and APNIC, we can help you apply for and manage these resources.</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">PA vs PI</h3>
            <p>PA (Provider Aggregatable) addresses are allocated through ISPs and must be returned when changing providers. PI (Provider Independent) addresses are obtained directly from RIRs and can be taken to any ISP. PI addresses cost more but provide better flexibility.</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">Service Content</h3>
            <ul class="list-disc pl-5">
              <li>Apply for and allocate IP address space</li>
              <li>Apply for and allocate AS numbers</li>
              <li>IP address reverse DNS (rDNS) configuration</li>
              <li>RPKI (Resource Public Key Infrastructure) configuration</li>
              <li>IRR (Internet Routing Registry) record maintenance</li>
              <li>Professional technical support and consultation</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
            <h3 class="font-bold mb-2">Application Process</h3>
            <ol class="list-decimal pl-5">
              <li>Submit application form</li>
              <li>Complete qualification review</li>
              <li>Sign service agreement</li>
              <li>Pay applicable fees</li>
              <li>Resource allocation completed within 1-3 business days</li>
              <li>Provide technical support and configuration guidance</li>
            </ol>
          </div>
        </div>
      </section>

      <section class="my-8">
        <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
        <p class="mb-4">
          If you have any questions about our LIR services or need more information, please contact us through:
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="https://t.me/Pysio07" class="btn btn-outline gap-2">
            <i class="fab fa-telegram"></i> Telegram
          </a>
          <a href="mailto:team@akae.re" class="btn btn-outline gap-2">
            <i class="fas fa-envelope"></i> team@akae.re
          </a>
          <a href="tencent://message/?uin=593277393" class="btn btn-outline gap-2">
            <i class="fab fa-qq"></i> QQ: 593277393
          </a>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'no-navbar'
})

// Preload key images for better performance
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/RIR/RIPE-NCC-Member.png',
      type: 'image/png',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/RIR/apnic-seeklogo.png',
      type: 'image/png',
    }
  ]
})

onMounted(() => {
  // Basic page initialization
})
</script>

<style>
.prose code {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

/* Ensure colors can override zebra styles */
.table-zebra tbody tr.bg-red-50 {
  background-color: rgb(254 242 242) !important;
}

.table-zebra tbody tr.bg-blue-50 {
  background-color: rgb(239 246 255) !important;
}

.table-zebra tbody tr.bg-yellow-50 {
  background-color: rgb(254 252 232) !important;
}

.table-zebra tbody tr.bg-red-100,
.table-zebra tbody tr.bg-yellow-100 {
  display: none;
}

@media (prefers-color-scheme: dark) {
  .table-zebra tbody tr.dark\:bg-red-900\/15 {
    background-color: rgba(127, 29, 29, 0.15) !important;
  }

  .table-zebra tbody tr.dark\:bg-blue-900\/15 {
    background-color: rgba(30, 58, 138, 0.15) !important;
  }

  .table-zebra tbody tr.dark\:bg-yellow-900\/15 {
    background-color: rgba(113, 63, 18, 0.15) !important;
  }

  .table-zebra tbody tr.dark\:bg-red-900\/20,
  .table-zebra tbody tr.dark\:bg-blue-900\/20,
  .table-zebra tbody tr.dark\:bg-yellow-900\/20,
  .table-zebra tbody tr.dark\:bg-red-900\/30,
  .table-zebra tbody tr.dark\:bg-blue-900\/30,
  .table-zebra tbody tr.dark\:bg-yellow-900\/30 {
    display: none;
  }
}

/* Disable selection and dragging */
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}

img {
  -webkit-user-drag: none;
  pointer-events: none;
}
</style>
