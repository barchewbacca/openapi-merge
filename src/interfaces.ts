/**
 * NOTE: This is copied from:
 * https://bitbucket.org/echo_rm/openapi-merge-cli/src/master/src/data.ts
 * With some changes
 */

export type OperationSelection = {
  /**
   * Only Operatinos that have these tags will be taken from this OpenAPI file. If a single Operation contains
   * an includeTag and an excludeTag then it will be excluded; exclusion takes precedence.
   */
  includeTags?: string[];

  /**
   * Any Operation that has any one of these tags will be excluded from the final result. If a single Operation contains
   * an includeTag and an excludeTag then it will be excluded; exclusion takes precedence.
   */
  excludeTags?: string[];
};

/**
 * The common configuration properties of an Input.
 */
export interface ConfigurationInputBase {
  /**
   * The prefix that will be used in the event of a conflict of two definition names.
   *
   * @minLength 1
   */
  disputePrefix?: string;

  /**
   * For this input, you can perform these modifications to its paths elements.
   */
  pathModification?: {
    /**
     * If a path starts with these characters, then stip them from the beginning of the path. Will run before prepend.
     *
     * @minLength 1
     */
    stripStart?: string;

    /**
     * Append these characters to the start of the paths for this input. Will run after stripStart.
     *
     * @minLength 1
     */
    prepend?: string;
  };

  /**
   * Choose which OpenAPI Operations should be included from this input.
   */
  operationSelection?: OperationSelection;
}

/**
 * A single Configuration input from a File.
 */
export interface ConfigurationInputFromFile extends ConfigurationInputBase {
  /**
   * The path to the input OpenAPI Schema that will be merged.
   *
   * @minLength 1
   */
  inputFile: string;
}

/**
 * The Configuration file for the OpenAPI Merge CLI Tool.
 */
export type Configuration = {
  /**
   * The input items for the merge algorithm. You must provide at least one.
   *
   * @minItems 1
   */
  inputs: ConfigurationInputFromFile[];

  /**
   * The output file to put the results in. If you use the .yml or .yaml extension then the schema will be output
   * in YAML format, otherwise, it will be output in JSON format.
   *
   * @minLength 1
   */
  output: string;
};
