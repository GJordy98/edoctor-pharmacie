import Script from 'next/script';
import Image from 'next/image';
import './globals.css';

// Stylesheets
import '../public/libs/bootstrap/css/bootstrap.min.css';
import '../public/css/icons.css';
import '../public/libs/node-waves/waves.min.css';
import '../public/libs/simplebar/simplebar.min.css';
import '../public/libs/flatpickr/flatpickr.min.css';
import '../public/libs/@simonwep/pickr/themes/nano.min.css';
import '../public/libs/choices.js/public/assets/styles/choices.min.css';
import '../public/libs/@tarekraafat/autocomplete.js/css/autoComplete.css';
import '../public/libs/gridjs/theme/mermaid.min.css';
import '../public/libs/sweetalert2/sweetalert2.min.css';
import '../public/css/styles.css';

export const metadata = {
  title: 'Pharmacie - Gestion',
  description: 'Système de gestion de pharmacie',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="fr" 
      dir="ltr" 
      data-nav-layout="vertical" 
      data-header-styles="transparent"
      data-width="fullwidth" 
      data-menu-styles="transparent" 
      data-page-style="flat" 
      data-toggled="double-menu-open"
      data-vertical-style="doublemenu" 
      data-loader="disable"
      suppressHydrationWarning
    >
      <head>
        {/* head items are now handled via metadata and imports */}
      </head>
      
      <body suppressHydrationWarning>
        <div className="progress-top-bar"></div>
        
        <div id="loader" className="d-none">
          <Image src="/images/media/loader.svg" alt="Loading" width={40} height={40} />
        </div>
        
        <div className="page">
          {children}
        </div>
        
        {/* Scroll To Top */}
        <div className="scrollToTop">
          <span className="arrow lh-1">
            <i className="ti ti-arrow-big-up fs-18"></i>
          </span>
        </div>
        <div id="responsive-overlay"></div>
        
        {/* Scripts */}
        <Script src="/js/main.js" strategy="beforeInteractive" />
        <Script src="/libs/@popperjs/core/umd/popper.min.js" strategy="beforeInteractive" />
        <Script src="/libs/bootstrap/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Script src="/js/defaultmenu.min.js" strategy="afterInteractive" />
        <Script src="/libs/node-waves/waves.min.js" strategy="afterInteractive" />
        <Script src="/js/sticky.js" strategy="afterInteractive" />
        <Script src="/libs/simplebar/simplebar.min.js" strategy="beforeInteractive" />
        <Script src="/js/simplebar.js" strategy="afterInteractive" />
        <Script src="/libs/@tarekraafat/autocomplete.js/autoComplete.min.js" strategy="afterInteractive" />
        <Script src="/libs/@simonwep/pickr/pickr.es5.min.js" strategy="afterInteractive" />
        <Script src="/libs/flatpickr/flatpickr.min.js" strategy="afterInteractive" />
        <Script src="/js/custom-switcher.min.js" strategy="afterInteractive" />
        <Script src="/libs/sweetalert2/sweetalert2.min.js" strategy="afterInteractive" />
        <Script src="/libs/gridjs/gridjs.umd.js" strategy="afterInteractive" />
        <Script src="/libs/choices.js/public/assets/scripts/choices.min.js" strategy="afterInteractive" />
        <Script src="/js/custom.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}