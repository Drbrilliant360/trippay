import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";

const SECTIONS = ["service", "fees", "data", "gated", "contact"] as const;

/** Creative Commons attribution for photos used across the site. */
const PHOTO_CREDITS = [
  {
    name: "Mount Kilimanjaro at Sunset",
    artist: "R Boed",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Mount_Kilimanjaro_at_Sunset_(Explored).jpg",
  },
  {
    name: "Herd of Elephants on the Serengeti",
    artist: "Floodmfx",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Herd_of_Elephants_on_the_Serengeti.jpg",
  },
  {
    name: "Zanzibar Fishing and Tourist Boats",
    artist: "Natalie Carberi",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Zanzibar_Fishing_and_Tourist_Boats.jpg",
  },
  {
    name: "Balloon Safari, Serengeti",
    artist: "Harvey Barrison",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Balloon_Safari_2012_06_01_3224_(7522665866).jpg",
  },
] as const;

export default function LegalPage() {
  const t = useTranslations("legal");

  return (
    <div className="space-y-6 pt-8">
      <PageHeader title={t("title")} description={t("subtitle")} />
      {SECTIONS.map((key) => (
        <section key={key} className="rounded-2xl border bg-card p-5">
          <h2 className="font-heading text-lg font-bold">{t(`sections.${key}.title`)}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t(`sections.${key}.body`)}</p>
        </section>
      ))}

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-heading text-lg font-bold">{t("credits.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("credits.body")}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {PHOTO_CREDITS.map((credit) => (
            <li key={credit.source}>
              <a
                href={credit.source}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {credit.name}
              </a>{" "}
              — {credit.artist},{" "}
              <a
                href={credit.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {credit.license}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
