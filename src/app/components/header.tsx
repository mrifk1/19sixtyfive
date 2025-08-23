"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/components/Header.module.scss";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isIndex = pathname === "/"; // <— hanya true di halaman root

  useEffect(() => {
    if (!isIndex) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isIndex]);

  // lock body scroll saat menu open
  useEffect(() => {
    const body = document.body;
    if (menuOpen) {
      const y = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${y}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      (body as any).dataset.scrollY = String(y);
    } else {
      const y = Number((document.body as any).dataset.scrollY || 0);
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      window.scrollTo(0, y);
    }
  }, [menuOpen]);

  // tutup dengan Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={[
          styles.header,
          styles.sticky, // kalau ada
          isIndex ? styles.index : "",
          scrolled ? styles.scrolled : "",
          menuOpen ? styles.menuActive : "",
        ].join(" ")}
      >
        <Link href="/" className={styles.logo} aria-label="Home">
          <Image
            src="/images/logo.svg"
            alt="1965 logo"
            width={60}
            height={60}
          />
        </Link>

        <button
          className={[styles.toggle, menuOpen ? styles.active : ""].join(" ")}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={styles.pageOffset} />

      {/* Menu overlay */}
      <div
        id="main-menu"
        className={[styles.menu, menuOpen ? styles.active : ""].join(" ")}
      >
        <Link
          href="/"
          className={styles.logo}
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/logo-white.svg"
            alt="1965 logo white"
            width={90}
            height={90}
          />
        </Link>

        <button
          className={[styles.close, menuOpen ? styles.active : ""].join(" ")}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          aria-controls="main-menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav aria-label="Site menu">
          <ul>
            <li>
              <Link href="/pages/festival" onClick={() => setMenuOpen(false)}>
                Festivals
              </Link>
            </li>
            <li>
              <Link href="/pages/community" onClick={() => setMenuOpen(false)}>
                Community
              </Link>
            </li>
            <li>
              <Link
                href="/pages/artist-spotlight"
                onClick={() => setMenuOpen(false)}
              >
                Artist Spotlight
              </Link>
            </li>
            <li>
              <Link
                href="/pages/brands-collab"
                onClick={() => setMenuOpen(false)}
              >
                Brands Collab
              </Link>
            </li>
            <li>
              <Link href="/pages/sports" onClick={() => setMenuOpen(false)}>
                Sports
              </Link>
            </li>
            <li>
              <Link href="/pages/news" onClick={() => setMenuOpen(false)}>
                News
              </Link>
            </li>
            <li>
              <Link href="/pages/our-fam" onClick={() => setMenuOpen(false)}>
                Our Fam
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
