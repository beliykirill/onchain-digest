import Document, { type DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { LOCAL_STORAGE_VARIABLES } from 'shared/constants';
import { cdnify } from 'shared/lib/themes';

export default class LandingApp extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href={cdnify('/favicon.ico')} sizes="32x32" />
          <link rel="icon" href={cdnify('/favicon.svg')} type="image/svg+xml" />
          <meta name="theme-color" content="#f3f4f6" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#080a0f" media="(prefers-color-scheme: dark)" />
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem('${LOCAL_STORAGE_VARIABLES.THEME}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`,
            }}
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
