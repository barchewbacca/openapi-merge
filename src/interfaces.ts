/**
 * The merge file.
 */
export type AppList = {
  [appId: string]: App;
};

export interface App {
  openApi?: string[];
  asyncApi?: string[];
  guides?: Guide[];
}

export interface Guide {
  topic: string;
  url: string;
}
