import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "David Ayman | Full-Stack Developer with AI Agent Integration",
  description:
    "Portfolio of David Ayman Bakhet Hanin — Full-Stack Developer specializing in Laravel, PHP, Python, and AI agent integration.",
  openGraph: {
    title: "David Ayman | Full-Stack Developer with AI Agent Integration",
    description:
      "Laravel · PHP · Python · AI agents — production full-stack web applications and intelligent automation.",
    type: "website",
  },
};

const themeInitScript = `
(() => {
  try {
    const key = "md-portfolio-theme-v2";
    const stored = localStorage.getItem(key);
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full font-sans text-ink" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
