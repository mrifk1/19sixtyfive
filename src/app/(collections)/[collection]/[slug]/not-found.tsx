"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../../NotFound.module.scss";

export default function NotFound() {
  const pathname = usePathname();

  let backUrl = "/";
  if (pathname.startsWith("/festival")) {
    backUrl = "/festival";
  } else if (pathname.startsWith("/community")) {
    backUrl = "/community";
  } else if (pathname.startsWith("/sports")) {
    backUrl = "/sports";
  } else if (pathname.startsWith("/artist-spotlight")) {
    backUrl = "/artist-spotlight";
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Item Not Found</p>
        <p className={styles.description}>
          We couldn’t find that article. Try exploring the list instead.
        </p>
        <Link className={styles.btn} href={backUrl}>
          Back to list
        </Link>
      </div>
    </div>
  );
}
