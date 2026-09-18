"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import styles from "./article.module.css";

type SectionMeta = {
  id: string;
  heading: string;
  is_premium: boolean;
  display_order: number;
  section_type: string;
};

type SectionBody = SectionMeta & {
  body: string;
};

function sectionAnchor(section: SectionMeta, index: number) {
  const clean = section.heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return clean || `section-${index + 1}`;
}

export function ArticleSections({
  articleId,
  sectionMeta,
  initialFreeSections,
}: {
  articleId: string;
  sectionMeta: SectionMeta[];
  initialFreeSections: SectionBody[];
}) {
  const [sections, setSections] = useState<SectionBody[]>(initialFreeSections);
  const [membershipState, setMembershipState] = useState<
    "checking" | "member" | "nonmember" | "signedout"
  >("checking");

  useEffect(() => {
    let active = true;

    async function refreshAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setMembershipState("signedout");
        setSections(initialFreeSections);
        return;
      }

      const { data: hasMembership, error: membershipError } = await supabase.rpc(
        "has_active_membership"
      );

      if (!active) return;

      if (accessError || !hasPremiumAccess) {
        setMembershipState("nonmember");
        setSections(initialFreeSections);
        return;
      }

      const { data, error } = await supabase
        .from("article_sections")
        .select(
          "id,heading,body,is_premium,display_order,section_type"
        )
        .eq("article_id", articleId)
        .order("display_order", { ascending: true });

      if (!active) return;

      if (error) {
        setMembershipState("nonmember");
        setSections(initialFreeSections);
        return;
      }

      setMembershipState("member");
      setSections((data ?? []) as SectionBody[]);
    }

    void refreshAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshAccess();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [articleId, initialFreeSections]);

  const sectionsById = useMemo(
    () => new Map(sections.map((section) => [section.id, section])),
    [sections]
  );

  const firstPremiumIndex = sectionMeta.findIndex((section) => section.is_premium);

  return (
    <article className={styles.story}>
      {sectionMeta.map((section, index) => {
        const fullSection = sectionsById.get(section.id);
        const typeClass =
          section.section_type === "reality"
            ? styles.reality
            : section.section_type === "simulation"
              ? styles.simulation
              : "";
        const label =
          section.section_type === "reality"
            ? "Reality Anchor"
            : section.section_type === "simulation"
              ? "Rewritten Timeline"
              : null;

        if (section.is_premium && !fullSection) {
          return (
            <section
              id={sectionAnchor(section, index)}
              className={`${styles.section} ${typeClass} ${styles.lockedSection}`}
              key={section.id}
            >
              <div className={styles.sectionNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                {label && <p className={styles.timelineLabel}>{label}</p>}
                <h2>
                  {section.heading}
                  <span className={styles.premium}>PREMIUM</span>
                </h2>
                <div className={styles.lockBox}>
                  {index === firstPremiumIndex ? (
                    <>
                      <p className={styles.lockTitle}>Continue this timeline</p>
                      <p>
                        This section is available to Sports Rewritten members.
                        {membershipState === "signedout"
                          ? " Sign in or create a reader account, then choose a membership plan."
                          : membershipState === "nonmember"
                            ? " Choose a membership plan to unlock the rest of the premium timeline."
                            : " Checking your membership access…"}
                      </p>
                      <Link className="goldButton" href="/membership">
                        {membershipState === "signedout"
                          ? "Sign In or Join"
                          : "View Membership"}
                      </Link>
                    </>
                  ) : (
                    <p>Member-only section.</p>
                  )}
                </div>
              </div>
            </section>
          );
        }

        return (
          <section
            id={sectionAnchor(section, index)}
            className={`${styles.section} ${typeClass}`}
            key={section.id}
          >
            <div className={styles.sectionNumber}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div>
              {label && <p className={styles.timelineLabel}>{label}</p>}
              <h2>
                {section.heading}
                {section.is_premium && (
                  <span className={styles.premium}>PREMIUM</span>
                )}
              </h2>
              <p>{fullSection?.body ?? ""}</p>
            </div>
          </section>
        );
      })}
    </article>
  );
}
