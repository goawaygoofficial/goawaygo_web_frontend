import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

/** Browsers without View Transitions just navigate (and the page plays its normal way in). */
const supported = typeof document !== 'undefined' && 'startViewTransition' in document;

/**
 * A link whose photo grows into the next page: give the photo here and its copy there the same CSS
 * `view-transition-name` (e.g. `post-<id>`, `avatar-<id>`). The page itself then doesn't slide (see usePageMotion).
 *
 * The next page must show that photo at once, so pass what this page already knows as `state.preview` (e.g. the
 * post) and draw it there until the fresh data arrives.
 */
export function MorphLink({ state, ...props }: LinkProps) {
  const morphState: unknown = supported ? { ...(state as object | undefined), morph: true } : state;
  return <Link {...props} viewTransition={supported} state={morphState} />;
}
