import gitDescribe from 'git-describe';
import type { GitInfo } from 'git-describe';

export default defineNitroPlugin((nitroApp) => {
  try {
    const gitInfo: GitInfo = gitDescribe.gitDescribeSync();
    const hash = gitInfo.hash.startsWith('g') ? gitInfo.hash.slice(1) : gitInfo.hash;
    process.env.NUXT_PUBLIC_GIT_HASH = hash.substring(0, 10);
  } catch (error) {
    console.error('Failed to get git hash:', error);
    process.env.NUXT_PUBLIC_GIT_HASH = 'development';
  }
});
