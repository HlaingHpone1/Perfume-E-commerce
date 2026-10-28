import { getTranslations } from "next-intl/server";
import Link from "next/link";

const Footer = async () => {
  const t = await getTranslations();

  return (
    <footer className="border-t border-[var(--border)] pt-16 pb-10">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-foreground text-2xl tracking-tight">
              {t("footer.brandName")}
            </p>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              {t("footer.brandDescription")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            <div>
              <p className="text-foreground mb-4 text-[0.65rem] tracking-[0.2em] uppercase">
                {t("footer.shop")}
              </p>
              <ul className="text-muted-foreground space-y-3 text-sm">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("footer.allProducts")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=mens-fragrances"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("footer.mensFragrances")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=womens-fragrances"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("footer.womensFragrances")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-foreground mb-4 text-[0.65rem] tracking-[0.2em] uppercase">
                {t("footer.company")}
              </p>
              <ul className="text-muted-foreground space-y-3 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("footer.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("navigation.contact")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-foreground mb-4 text-[0.65rem] tracking-[0.2em] uppercase">
                {t("footer.support")}
              </p>
              <ul className="text-muted-foreground space-y-3 text-sm">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("footer.customerService")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("footer.shippingInfo")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mt-14 border-t border-[var(--border)] pt-8 text-xs tracking-wide">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.brandName")}.{" "}
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
