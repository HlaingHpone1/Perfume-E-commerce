"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(t("page.contact.successMessage"));
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const faqs = [
    {
      q: t("page.contact.faq.trackOrderQuestion"),
      a: t("page.contact.faq.trackOrderAnswer"),
    },
    {
      q: t("page.contact.faq.returnPolicyQuestion"),
      a: t("page.contact.faq.returnPolicyAnswer"),
    },
    {
      q: t("page.contact.faq.authenticityQuestion"),
      a: t("page.contact.faq.authenticityAnswer"),
    },
    {
      q: t("page.contact.faq.internationalShippingQuestion"),
      a: t("page.contact.faq.internationalShippingAnswer"),
    },
  ];

  return (
    <div>
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-foreground text-4xl tracking-tight md:text-5xl">
              {t("page.contact.title")}
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              {t("page.contact.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-foreground text-3xl tracking-tight">
              {t("page.contact.contactInfoTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              {t("page.contact.contactInfoDescription")}
            </p>

            <dl className="mt-10 space-y-8">
              <div>
                <dt className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
                  {t("page.contact.emailLabel")}
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  <a
                    href="mailto:support@fragrancehub.com"
                    className="hover:text-foreground transition-colors"
                  >
                    support@fragrancehub.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
                  {t("page.contact.phoneLabel")}
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm">
                  <a
                    href="tel:+1234567890"
                    className="hover:text-foreground transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
                  {t("page.contact.addressLabel")}
                </dt>
                <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  123 Fragrance Street
                  <br />
                  New York, NY 10001
                  <br />
                  United States
                </dd>
              </div>
              <div>
                <dt className="text-foreground text-[0.65rem] tracking-[0.18em] uppercase">
                  {t("page.contact.businessHoursTitle")}
                </dt>
                <dd className="text-muted-foreground mt-2 space-y-1 text-sm">
                  <p>{t("page.contact.businessHoursWeekdays")}</p>
                  <p>{t("page.contact.businessHoursSaturday")}</p>
                  <p>{t("page.contact.businessHoursSunday")}</p>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-foreground text-3xl tracking-tight">
              {t("page.contact.formTitle")}
            </h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t("page.contact.formNameLabel")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  className="rounded-none"
                  placeholder={t("page.contact.formNamePlaceholder")}
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("page.contact.formEmailLabel")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="rounded-none"
                  placeholder={t("page.contact.formEmailPlaceholder")}
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  {t("page.contact.formSubjectLabel")}
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  className="rounded-none"
                  placeholder={t("page.contact.formSubjectPlaceholder")}
                  required
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  {t("page.contact.formMessageLabel")}
                </Label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder={t("page.contact.formMessagePlaceholder")}
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="rounded-none text-[0.7rem] tracking-[0.2em] uppercase"
              >
                {isSubmitting ? (
                  t("page.contact.formSubmitting")
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    {t("page.contact.formSubmit")}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
          <h2 className="font-display text-foreground text-center text-3xl tracking-tight">
            {t("page.contact.faqTitle")}
          </h2>
          <div className="mt-12 space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-t border-[var(--border)] pt-6">
                <h3 className="text-foreground text-base font-medium">
                  {faq.q}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
