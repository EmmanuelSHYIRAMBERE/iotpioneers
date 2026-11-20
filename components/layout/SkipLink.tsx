/** First focusable element on the page; visible only when focused. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only-focusable fixed top-3 left-3 z-[100] rounded-button bg-bright-gold px-4 py-3 font-display font-semibold text-navy-950"
    >
      Skip to main content
    </a>
  );
}
