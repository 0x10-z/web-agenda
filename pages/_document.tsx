import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

export default function Document() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0 = enero, 1 = febrero, ...
  const isWinter = () => {
    return currentMonth === 11 || currentMonth === 0 || currentMonth === 1;
  };
  return (
    <Html lang="en">
      <Head>
        {/*<!-- SEO
            ================================================== -->*/}
        <meta
          name="description"
          content="{% block site_description %}Peluqueria H2U Agenda{% endblock site_description %}"
        />
        <meta name="author" content="Iker Ocio, https://ikerocio.com" />
        <Link href="https://ikerocio.com" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
