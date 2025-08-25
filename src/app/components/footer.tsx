import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/components/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <Image
          src="/images/logo-white.svg"
          alt="1965 Logo White"
          width={140}
          height={140}
          className={styles.logoImage}
        />
      </Link>

      {/* Column 1 */}
      <div className={styles.column1}>
        <ul className={`${styles.list} ${styles.left}`}>
          <li>
            <Link href="festival">Festivals</Link>
          </li>
          <li>
            <Link href="community">Community</Link>
          </li>
          <li>
            <Link href="artist-spotlight">Artist Spotlight</Link>
          </li>
          <li>
            <Link href="brands-collab">Brands Collab</Link>
          </li>
        </ul>
        <ul className={`${styles.list} ${styles.right}`}>
          <li>
            <Link href="sports">Sports</Link>
          </li>
          <li>
            <Link href="news">News</Link>
          </li>
          <li>
            <Link href="our-fam">Our Fam</Link>
          </li>
          <li>
            <Link href="#">Youtube</Link>
          </li>
        </ul>
      </div>

      {/* Column 2 */}
      <div className={styles.column2}>
        <p>
          27 Pasir Panjang Road
          <br />
          Pasir Panjang Power Station
          <br />
          Singapore 117537
        </p>
        <ul>
          <li>+65 6475 9200</li>
          <li>
            <a href="mailto:contact@19sixtyfive.com.sg">
              contact@19sixtyfive.com.sg
            </a>
          </li>
        </ul>
      </div>

      {/* Column 3 */}
      <ul className={styles.column3}>
        <li>
          <a href="https://24owls.sg/" target="_blank">
            24owls.sg
          </a>
        </li>
        <li>
          <a href="https://sixtyfive.sg/" target="_blank">
            sixtyfive.sg
          </a>
        </li>
        <li>
          <a href="https://tangentmoves.sg/" target="_blank">
            tangentmoves.sg
          </a>
        </li>
      </ul>
    </footer>
  );
}
