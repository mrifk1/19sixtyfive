"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.scss";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const pathname = usePathname() || "/";
  const isIndex = pathname === "/";

  // index-only scroll listener
  useEffect(() => {
    if (!isIndex) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isIndex]);

  // lock body scroll when menu is open
  useEffect(() => {
    const body = document.body; // HTMLBodyElement
    if (menuOpen) {
      const y = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${y}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      body.dataset.scrollY = String(y);
    } else {
      const y = Number(document.body.dataset.scrollY ?? "0");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      window.scrollTo(0, y);
      // optional: cleanup
      delete body.dataset.scrollY;
    }
  }, [menuOpen]);

  // close with Escape key
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
          styles.sticky, // if this class exists in SCSS
          isIndex ? styles.index : "",
          scrolled ? styles.scrolled : "",
          menuOpen ? styles.menuActive : "",
        ].join(" ")}
      >
        <Link href="/" className={styles.logo} aria-label="Home">
          <Image
            src="/images/logo/logo.svg"
            alt="1965 logo"
            width={60}
            height={60}
          />
        </Link>

        <button
          className={[styles.toggle, menuOpen ? styles.active : ""].join(" ")}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-controls="main-menu"
          aria-expanded={menuOpen}
          type="button"
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
            src="/images/logo/logo-white.svg"
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
          type="button"
        >
          <span />
          <span />
        </button>

        <nav aria-label="Site menu">
          <ul>
            <li>
              <Link href="/festival" onClick={() => setMenuOpen(false)}>
                Festivals
              </Link>
            </li>
            <li>
              <Link href="/community" onClick={() => setMenuOpen(false)}>
                Community
              </Link>
            </li>
            <li>
              <Link href="/artist" onClick={() => setMenuOpen(false)}>
                Artist
              </Link>
            </li>
            <li>
              <Link href="/brands" onClick={() => setMenuOpen(false)}>
                Brands
              </Link>
            </li>
            <li>
              <Link href="/sports" onClick={() => setMenuOpen(false)}>
                Sports
              </Link>
            </li>
            <li>
              <Link href="/news" onClick={() => setMenuOpen(false)}>
                News
              </Link>
            </li>
            <li>
              <Link href="/fam" onClick={() => setMenuOpen(false)}>
                Fam
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
