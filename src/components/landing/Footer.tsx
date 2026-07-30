import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Smart Search", href: "#smart-search" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "#faq" },
      { label: "Documentation", href: "/docs" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white font-bold">
                ▶
              </div>

              <span className="text-xl font-bold text-slate-900">
                InsightTube
                <span className="text-violet-600">-AI</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              Turn long YouTube videos into concise AI-powered summaries and
              learn faster.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://github.com"
                className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-lg hover:bg-violet-50"
              >
                G
              </a>

              <a
                href="https://linkedin.com"
                className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-lg hover:bg-violet-50"
              >
                in
              </a>

              <a
                href="https://youtube.com"
                className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-lg hover:bg-violet-50"
              >
                ▶
              </a>

              <a
                href="mailto:hello@insighttube.ai"
                className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-lg hover:bg-violet-50"
              >
                ✉
              </a>
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold text-slate-900">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-violet-600"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-violet-600"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {year} InsightTube-AI. All rights reserved.
          </p>

          <p className="text-xs text-slate-500">
            Built with ❤️ for smarter learning.
          </p>
        </div>
      </div>
    </footer>
  );
}