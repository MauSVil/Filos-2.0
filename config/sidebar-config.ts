export const AUTO_COLLAPSE_PAGES = [
  "/ai/nano-banana",
  "/products/new",
  "/prospects/new",
];

export function shouldAutoCollapsePage(pathname: string): boolean {
  return AUTO_COLLAPSE_PAGES.some(page => pathname.includes(page));
}