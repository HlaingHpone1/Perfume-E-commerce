import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us - FragranceHub",
  description: "Learn about FragranceHub and our mission",
};

export default async function AboutPage() {
  const t = await getTranslations();

  const values = [
    {
      title: t("page.about.values.qualityTitle"),
      description: t("page.about.values.qualityDescription"),
    },
    {
      title: t("page.about.values.careTitle"),
      description: t("page.about.values.careDescription"),
    },
    {
      title: t("page.about.values.expertTitle"),
      description: t("page.about.values.expertDescription"),
    },
    {
      title: t("page.about.values.globalTitle"),
      description: t("page.about.values.globalDescription"),
    },
  ];

  return (
    <div>
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-foreground text-4xl tracking-tight md:text-5xl lg:text-6xl">
              {t("page.about.title")}
            </h1>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              {t("page.about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <h2 className="font-display text-foreground text-3xl tracking-tight md:text-4xl">
            {t("page.about.storyTitle")}
          </h2>
          <div className="text-muted-foreground mt-8 space-y-5 text-base leading-relaxed">
            <p>{t("page.about.storyParagraph1")}</p>
            <p>{t("page.about.storyParagraph2")}</p>
            <p>{t("page.about.storyParagraph3")}</p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-foreground text-3xl tracking-tight md:text-4xl">
            {t("page.about.valuesTitle")}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="border-t border-[var(--border)] pt-6"
              >
                <h3 className="text-foreground text-lg font-medium">
                  {value.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 max-w-3xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-12">
          <h2 className="font-display text-foreground text-3xl tracking-tight">
            {t("page.about.missionTitle")}
          </h2>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed">
            {t("page.about.missionText")}
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-20">
          <div className="max-w-lg">
            <h2 className="font-display text-foreground text-3xl tracking-tight">
              {t("page.about.ctaTitle")}
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              {t("page.about.ctaSubtitle")}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-none px-8 text-[0.7rem] tracking-[0.2em] uppercase"
          >
            <Link href="/products">{t("cta.shopNow")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
