import gitDescribe from 'git-describe';
import type { GitInfo } from 'git-describe';

export function getGitHash(): string {
  try {
    const gitInfo: GitInfo = gitDescribe.gitDescribeSync();
    return gitInfo.hash.startsWith('g') ? gitInfo.hash.slice(1) : gitInfo.hash;
  } catch (error) {
    console.error('Failed to get git hash:', error);
    return 'development';
  }
}
