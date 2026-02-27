'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { api } from '@/lib/api-client';

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    api.logout();
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  return (
    <aside className="app-sidebar sticky sticky-pin" id="sidebar">
      {/* Sidebar Header */}
      <div className="main-sidebar-header">
        <Link href="/products" className="header-logo">
          <Image src="/images/brand-logos/desktop-logo.png" alt="logo" className="desktop-logo" width={150} height={40} priority />
          <Image src="/images/brand-logos/toggle-dark.png" alt="logo" className="toggle-dark" width={40} height={40} priority />
          <Image src="/images/brand-logos/desktop-dark.png" alt="logo" className="desktop-dark" width={150} height={40} priority />
          <Image src="/images/brand-logos/toggle-logo.png" alt="logo" className="toggle-logo" width={40} height={40} priority />
        </Link>
      </div>

      {/* Sidebar Content */}
      <div className="main-sidebar" id="sidebar-scroll" data-simplebar="init">
        <div className="simplebar-wrapper" style={{ margin: '-8px 0px -240px' }}>
          <div className="simplebar-height-auto-observer-wrapper">
            <div className="simplebar-height-auto-observer"></div>
          </div>
          <div className="simplebar-mask">
            <div className="simplebar-offset" style={{ right: '0px', bottom: '0px' }}>
              <div className="simplebar-content-wrapper" tabIndex={0} role="region" aria-label="scrollable content" style={{ height: '100%', overflow: 'scroll hidden' }}>
                <div className="simplebar-content" style={{ padding: '8px 0px 240px' }}>
                  {/* Main Navigation */}
                  <nav className="main-menu-container nav nav-pills flex-column sub-open active open">
                    <ul className="main-menu">
                      {/* Category */}
                      <li className="slide__category">
                        <span className="category-name">Main</span>
                      </li>

                      {/* Dashboards */}
                      <li className="slide has-sub active open">
                        <a href="#" className="side-menu__item active open">
                          <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" viewBox="0 0 256 256">
                            <rect width="256" height="256" fill="none"></rect>
                            <path d="M133.66,34.34a8,8,0,0,0-11.32,0L40,116.69V216h64V152h48v64h64V116.69Z" opacity="0.2"></path>
                            <line x1="16" y1="216" x2="240" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                            <polyline points="152 216 152 152 104 152 104 216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
                            <line x1="40" y1="116.69" x2="40" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                            <line x1="216" y1="216" x2="216" y2="116.69" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                            <path d="M24,132.69l98.34-98.35a8,8,0,0,1,11.32,0L232,132.69" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                          </svg>
                          <span className="side-menu__label">Dashboards</span>
                          <i className="ri-arrow-right-s-line side-menu__angle"></i>
                        </a>
                        <ul className="slide-menu child1 double-menu-active" style={{ position: 'relative', display: 'block' }}>
                          <li className="slide side-menu__label1">
                            <a href="#">Dashboards</a>
                          </li>
                          <li className="slide">
                            <Link href="/products" className={`side-menu__item ${isActive('/products')}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="side-menu-doublemenu__icon" viewBox="0 0 256 256">
                                <rect width="256" height="256" fill="none"></rect>
                                <path d="M54.46,201.54c-9.2-9.2-3.1-28.53-7.78-39.85C41.82,150,24,140.5,24,128s17.82-22,22.68-33.69C51.36,83,45.26,63.66,54.46,54.46S83,51.36,94.31,46.68C106.05,41.82,115.5,24,128,24S150,41.82,161.69,46.68c11.32,4.68,30.65-1.42,39.85,7.78s3.1,28.53,7.78,39.85C214.18,106.05,232,115.5,232,128S214.18,150,209.32,161.69c-4.68,11.32,1.42,30.65-7.78,39.85s-28.53,3.1-39.85,7.78C150,214.18,140.5,232,128,232s-22-17.82-33.69-22.68C83,204.64,63.66,210.74,54.46,201.54Z" opacity="0.2"></path>
                                <path d="M54.46,201.54c-9.2-9.2-3.1-28.53-7.78-39.85C41.82,150,24,140.5,24,128s17.82-22,22.68-33.69C51.36,83,45.26,63.66,54.46,54.46S83,51.36,94.31,46.68C106.05,41.82,115.5,24,128,24S150,41.82,161.69,46.68c11.32,4.68,30.65-1.42,39.85,7.78s3.1,28.53,7.78,39.85C214.18,106.05,232,115.5,232,128S214.18,150,209.32,161.69c-4.68,11.32,1.42,30.65-7.78,39.85s-28.53,3.1-39.85,7.78C150,214.18,140.5,232,128,232s-22-17.82-33.69-22.68C83,204.64,63.66,210.74,54.46,201.54Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                                <circle cx="96" cy="96" r="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
                                <circle cx="160" cy="160" r="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
                                <line x1="88" y1="168" x2="168" y2="88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              </svg>
                              Ventes
                            </Link>
                          </li>

                          {/* Pharmacie Sub-menu */}
                          <li className="slide has-sub active open">
                            <a href="#" className="side-menu__item active open">
                              <svg xmlns="http://www.w3.org/2000/svg" className="side-menu-doublemenu__icon" width="32" height="32" viewBox="0 0 256 256">
                                <path d="M224,56V200a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H216A8,8,0,0,1,224,56Z" opacity="0.2"></path>
                                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path>
                              </svg>
                              Pharmacie
                              <span className="badge bg-primary-transparent ms-2">12</span>
                              <i className="ri-arrow-right-s-line side-menu__angle"></i>
                            </a>
                            <ul className="slide-menu child2" style={{ display: 'block' }}>
                              <li className="slide">
                                <Link href="/products" className={`side-menu__item ${isActive('/products')}`}>
                                  Produits
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/orders" className={`side-menu__item ${isActive('/orders')}`}>
                                  Commandes
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/pickup" className={`side-menu__item ${isActive('/pickup')}`}>
                                  Pickups &amp; Livraisons
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/send-prescription" className={`side-menu__item ${isActive('/send-prescription')}`}>
                                  Envoyer Ordonnance
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/profile" className={`side-menu__item ${isActive('/profile')}`}>
                                  Paramètres pharmacie
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/validate-order" className={`side-menu__item ${isActive('/validate-order')}`}>
                                  Scanner une commande
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/schedule" className={`side-menu__item ${isActive('/schedule')}`}>
                                  Planning &amp; Horaires
                                </Link>
                              </li>
                              <li className="slide">
                                <Link href="/kyc" className={`side-menu__item ${isActive('/kyc')}`}>
                                  Vérification KYC
                                </Link>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>

                    {/* Bottom Menu */}
                    <ul className="doublemenu_bottom-menu main-menu mb-0 border-top">
                      {/* Theme Settings */}
                      <li className="slide">
                        <a href="#" className="side-menu__item layout-setting-doublemenu">
                          <span className="light-layout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" viewBox="0 0 256 256">
                              <rect width="256" height="256" fill="none"></rect>
                              <path d="M108.11,28.11A96.09,96.09,0,0,0,227.89,147.89,96,96,0,1,1,108.11,28.11Z" opacity="0.2"></path>
                              <path d="M108.11,28.11A96.09,96.09,0,0,0,227.89,147.89,96,96,0,1,1,108.11,28.11Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
                            </svg>
                          </span>
                          <span className="dark-layout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" viewBox="0 0 256 256">
                              <rect width="256" height="256" fill="none"></rect>
                              <circle cx="128" cy="128" r="56" opacity="0.2"></circle>
                              <line x1="128" y1="40" x2="128" y2="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <circle cx="128" cy="128" r="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
                              <line x1="64" y1="64" x2="56" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <line x1="64" y1="192" x2="56" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <line x1="192" y1="64" x2="200" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <line x1="192" y1="192" x2="200" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <line x1="40" y1="128" x2="32" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <line x1="128" y1="216" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                              <line x1="216" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                            </svg>
                          </span>
                          <span className="side-menu__label">Theme Settings</span>
                        </a>
                      </li>

                      {/* Logout */}
                      <li className="slide">
                        <a href="#" onClick={handleLogout} className="side-menu__item">
                          <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" viewBox="0 0 256 256">
                            <rect width="256" height="256" fill="none"></rect>
                            <path d="M48,40H202a16,16,0,0,1,16,16V200a16,16,0,0,1-16,16H48a0,0,0,0,1,0,0V40A0,0,0,0,1,48,40Z" opacity="0.2"></path>
                            <polyline points="112 40 48 40 48 216 112 216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
                            <line x1="112" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                            <polyline points="184 88 224 128 184 168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
                          </svg>
                          <span className="side-menu__label">Déconnexion</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}