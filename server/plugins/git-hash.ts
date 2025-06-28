
let gitDescribe: any;
let GitInfo: any;
try {
  gitDescribe = require('git-describe');
  GitInfo = require('git-describe').GitInfo;
} catch (e) {
  // git-describe 不存在时容错
}

export default defineNitroPlugin((nitroApp) => {
  try {
    if (gitDescribe && gitDescribe.gitDescribeSync) {
      const gitInfo = gitDescribe.gitDescribeSync();
      const hash = gitInfo.hash && gitInfo.hash.startsWith('g') ? gitInfo.hash.slice(1) : (gitInfo.hash || '');
      process.env.NUXT_PUBLIC_GIT_HASH = hash.substring(0, 10) || 'development';
    } else {
      process.env.NUXT_PUBLIC_GIT_HASH = 'development';
    }
  } catch (error) {
    console.error('Failed to get git hash:', error);
    process.env.NUXT_PUBLIC_GIT_HASH = 'development';
  }
});
