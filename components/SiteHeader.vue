<script setup lang="ts">
import { ArrowUpRight, Menu } from '@lucide/vue'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { GITHUB_REPO, LOGO_URL, networkLinks, resourceLinks, toolLinks } from '@/lib/site'

const mobileOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { mobileOpen.value = false })

const menus = [
  { label: '网络', links: networkLinks },
  { label: '工具', links: toolLinks },
]
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
    <div class="page-container flex h-14 items-center gap-6">
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold tracking-tight">
        <img :src="LOGO_URL" alt="" class="size-6 rounded-full" width="24" height="24">
        <span>Pysio Networks</span>
      </NuxtLink>

      <NavigationMenu class="hidden md:flex" :viewport="false">
        <NavigationMenuList>
          <NavigationMenuItem v-for="menu in menus" :key="menu.label">
            <NavigationMenuTrigger class="h-8 bg-transparent px-3 text-muted-foreground hover:text-foreground data-[state=open]:text-foreground">
              {{ menu.label }}
            </NavigationMenuTrigger>
            <NavigationMenuContent class="md:w-[520px]">
              <ul class="grid grid-cols-2 gap-1 p-1">
                <li v-for="link in menu.links" :key="link.to">
                  <NavigationMenuLink as-child>
                    <NuxtLink :to="link.to" class="flex flex-row items-start gap-3 rounded-md p-3 hover:bg-muted">
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                        <component :is="link.icon" class="size-4" />
                      </span>
                      <span class="flex flex-col gap-0.5">
                        <span class="text-sm font-medium leading-none">{{ link.title }}</span>
                        <span class="text-xs leading-snug text-muted-foreground">{{ link.description }}</span>
                      </span>
                    </NuxtLink>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem v-for="link in resourceLinks.slice(0, 2)" :key="link.to">
            <NavigationMenuLink as-child>
              <NuxtLink :to="link.to" :class="[navigationMenuTriggerStyle(), 'h-8 bg-transparent px-3 text-muted-foreground hover:text-foreground']">
                {{ link.title }}
              </NuxtLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div class="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" as-child class="hidden sm:inline-flex">
          <a :href="`https://github.com/${GITHUB_REPO}`" target="_blank" rel="noopener" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-4" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.64 1.66.23 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3" /></svg>
          </a>
        </Button>
        <Button size="sm" as-child class="hidden sm:inline-flex">
          <NuxtLink to="/bgp">
            路由查询
            <ArrowUpRight data-icon="inline-end" />
          </NuxtLink>
        </Button>

        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="md:hidden" aria-label="打开菜单">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-full overflow-y-auto sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Pysio Networks</SheetTitle>
            </SheetHeader>
            <nav class="flex flex-col gap-6 px-4 pb-8">
              <div v-for="group in [...menus, { label: '更多', links: resourceLinks }]" :key="group.label" class="flex flex-col gap-1">
                <p class="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ group.label }}</p>
                <NuxtLink
                  v-for="link in group.links"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  active-class="bg-muted font-medium"
                >
                  <component :is="link.icon" class="size-4 text-muted-foreground" />
                  {{ link.title }}
                </NuxtLink>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
