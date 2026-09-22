import type { ComponentProps } from "react";

/**
 * Use document navigation on the Workers build. The pinned vinext Link runtime
 * can cancel clicks and then fail to load its client navigation functions.
 * Native anchors also preserve keyboard, new-tab, hash and history behavior.
 */
export default function SiteLink({
  href,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  return <a href={href} {...props} />;
}
