/**
 * Safety net for automatic page translation.
 *
 * Browser translators (Safari, Chrome, extensions) replace the page's text with
 * their own elements, without telling React. When React later updates that
 * text, it tries to remove or move a node that is no longer where it left it,
 * and the browser throws "removeChild / insertBefore: not a child of this node".
 * That crashed the whole app for people whose phones translated it.
 *
 * The app asks browsers not to translate it (translate="no" in index.html), and
 * offers its own French version instead. This guard covers translators that
 * ignore that request: the out-of-place operation is skipped instead of
 * crashing. The page may then show some stale translated text, but it keeps
 * working. (This is the workaround suggested by the React team, issue #11538.)
 */
export function guardAgainstTranslation() {
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };

  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, reference: Node | null): T {
    if (reference && reference.parentNode !== this) return node;
    return insertBefore.call(this, node, reference) as T;
  };
}
