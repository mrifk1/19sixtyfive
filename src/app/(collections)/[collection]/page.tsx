import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./Collections.module.scss";

import {
  asKind,
  getCollection,
  hrefOf,
  pickHover,
  isMobileFromHeaders,
} from "@/lib/api";
import type { CollectionItem, CollectionKind } from "@/types";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const UI: Record<
  CollectionKind,
  {
    titleLines: string[];
    icon?: string; // <— optional
    iconLabel?: string; // <— optional
    subtitle: string;
    frameClass:
      | "frameFestival"
      | "frameCommunity"
      | "frameArtist"
      | "frameSports";
    variant: "frameWhite" | "frameBlack";
  }
> = {
  festival: {
    titleLines: ["Common ground:", "Festivals, flipped our way."],
    iconLabel: "Festivals",
    subtitle:
      "We don’t just build festivals — we build movements, moments and the kind of subculture people want to belong to.",
    frameClass: "frameFestival",
    variant: "frameWhite",
  },
  community: {
    titleLines: ["The community:", "Same series, fresh takes."],
    iconLabel: "Community",
    subtitle:
      "Intimate but unexpected, our sessions bring artists, collaborators and creatives together for shared sparks and surprise moments.",
    frameClass: "frameCommunity",
    variant: "frameBlack",
  },
  artist: {
    titleLines: ["Artist spotlight:", "Where craft meets crowd."],
    iconLabel: "Artist Spotlight",
    subtitle:
      "From indie pop to rock, classical and everything in between — we curate concerts that don’t just fill a room, they fill a feeling.",
    frameClass: "frameArtist",
    variant: "frameWhite",
  },
  sport: {
    titleLines: ["Sports:", "Energy in motion."],
    iconLabel: "Sports",
    subtitle:
      "We turn spaces into charged fan zones, where courts become culture and athletes feel close enough to touch.",
    frameClass: "frameSports",
    variant: "frameWhite",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const kind = asKind(collection);
  if (!kind) return { title: "Not Found" };
  const ttl = kind[0].toUpperCase() + kind.slice(1);
  return {
    title: `${ttl} | 19sixtyfive`,
    alternates: { canonical: `/${collection}` },
  };
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const raw = collection;
  const kind = asKind(raw);
  if (!kind) return notFound();

  const ui = UI[kind];
  // Detect mobile from request headers
  const isMobile = await isMobileFromHeaders();
  const items = await getCollection(kind, isMobile);

  return (
    <>
      <section className={styles.heroTitle}>
        <h1>
          {ui.titleLines[0]}
          <br />
          {ui.titleLines[1]}
        </h1>
      </section>

      <section className={`${styles.heroImg} ${styles[`hero-${raw}`]}`} />

      <section className={styles.heroSubtitle}>
        {ui.icon ? (
          <Image src={ui.icon} alt={`${kind} icon`} width={90} height={90} />
        ) : (
          <>
            <h1 className={styles.iconText} aria-label={`${kind} icon`}>
              {ui.iconLabel ?? kind}
            </h1>
            <p>{ui.subtitle}</p>
          </>
        )}
      </section>

      <section
        className={`${styles.frame} ${styles[ui.frameClass]} ${
          styles[ui.variant]
        }`}
      >
        <article className={styles.frameContent}>
          {items.map((it: CollectionItem) => (
            <figure key={it.id} className={styles.frameItem}>
              <div className={styles.frameImg}>
                <Image
                  src={pickHover(it.image_hover ?? null, isMobile)}
                  alt={it.title ?? "Untitled"}
                  width={350}
                  height={350}
                />
              </div>
              <figcaption>
                <Link href={hrefOf(kind, it)}>{it.title ?? "Untitled"}</Link>
              </figcaption>
            </figure>
          ))}
        </article>
      </section>
    </>
  );
}
