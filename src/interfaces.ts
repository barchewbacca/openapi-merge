export type DeveloperConfig = {
  [appId: string]: DeveloperConfigItem;
};

export interface DeveloperConfigItem {
  openapiUrls?: string[];
  asyncapiUrls?: string[];
  guides?: GuideConfig[];
}

export interface GuideConfig {
  name: string;
  url: string;
}

export interface FetchApiResponse {
  data: unknown;
  appId: string;
}

export interface FetchGuideResponse {
  data: string;
  appId: string;
  name: string;
}
