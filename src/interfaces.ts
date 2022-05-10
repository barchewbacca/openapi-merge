/**
 * A single Configuration input File.
 */
export interface App {
  /**
   * The path to the input OpenAPI Schema that will be merged into an array.
   *
   * @minLength 1
   */
  url: string;
  appId?: string;
}

/**
 * The Configuration file.
 */
export type Configuration = {
  /**
   * The input items for the merge algorithm. You must provide at least one.
   *
   * @minItems 1
   */
  appList: App[];

  /**
   * The output file to put the results in as JSON format.
   *
   * @minLength 1
   */
  output: string;
};

export interface OutputApi {
  api: unknown;
  appId?: string;
}
