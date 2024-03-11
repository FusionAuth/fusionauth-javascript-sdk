/**
 * Takes in a string which may or may not
 * have a leading `/` and returns the same
 * string but definitely with a leading `/`
 */
const getWithLeadingSlash = (someString: string) => {
  return someString.startsWith('/') ? someString : `/${someString}`;
};

/**
 * Formats a potential `path` utilizing a fallback when no
 * `path` is passed in. Ensures that `path` has a leading `/`.
 *
 * #### Example
 * ```ts
 * getFormattedPath(undefined, "some/fallback") // "/some/fallback"
 * getFormattedPath(undefined, "/some/fallback") // "/some/fallback"
 *
 * getFormattedPath("some/path", "/some/fallback") // "/some/path"
 * getFormattedPath("/some/path", "/some/fallback") // "/some/path"
 * ```
 */
export const getFormattedPath = (
  path: string | undefined,
  fallbackPath: string,
) => {
  return getWithLeadingSlash(path || fallbackPath);
};
