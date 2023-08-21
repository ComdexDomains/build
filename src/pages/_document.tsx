import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head >
        <title>Comdex Domains</title>
        <link rel="icon" href="/injDomainLogo.png" />

        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', 'GA_TRACKING_ID');
      `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
