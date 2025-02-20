export interface GitInfo {
  hash: string;
  tag: string | null;
  dirty: boolean;
  distance: number | null;
  describe: string;
}
