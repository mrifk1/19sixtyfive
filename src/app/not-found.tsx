import Link from "next/link";
import styles from "./NotFound.module.scss";


export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Not Found</p>
        <p className={styles.description}>
          That page doesn’t exist or is no longer available.
        </p>
        <Link className={styles.btn} href="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
