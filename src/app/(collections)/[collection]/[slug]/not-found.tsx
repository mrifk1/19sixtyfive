import Link from "next/link";
import styles from "../../../NotFound.module.scss";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Item Not Found</p>
        <p className={styles.description}>
          We couldn’t find that article. Try exploring the list instead.
        </p>
        <Link className={styles.btn} href="/festival">
          Back to list
        </Link>
      </div>
    </div>
  );
}
