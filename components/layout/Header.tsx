'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [officineName, setOfficineName] = useState('');
  const [officineNumber, setOfficineNumber] = useState('');

  useEffect(() => {
    // Charger les informations de la pharmacie depuis le localStorage ou API
    const name = localStorage.getItem('officine_name') || 'Pharmacie';
    const number = localStorage.getItem('officine_number') || '';
    
    // Use a microtask to avoid synchronous setState in effect body
    // which triggers cascading renders warning in React
    queueMicrotask(() => {
      setOfficineName(name);
      setOfficineNumber(number);
    });
  }, []);

  const handleLogout = () => {
    // Logique de déconnexion
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="app-header sticky sticky-pin" id="header">
      <div className="main-header-container container-fluid">
        {/* Header Left */}
        <div className="header-content-left">
          <div className="header-element">
            <div className="horizontal-logo">
              <Link href="/products" className="header-logo">
                <Image src="/images/brand-logos/desktop-logo.png" alt="logo" className="desktop-logo" width={150} height={40} priority />
                <Image src="/images/brand-logos/toggle-logo.png" alt="logo" className="toggle-logo" width={40} height={40} priority />
                <Image src="/images/brand-logos/desktop-dark.png" alt="logo" className="desktop-dark" width={150} height={40} priority />
                <Image src="/images/brand-logos/toggle-dark.png" alt="logo" className="toggle-dark" width={40} height={40} priority />
              </Link>
            </div>
          </div>

          <div className="header-element mx-lg-0 mx-2">
            <a 
              aria-label="Hide Sidebar"
              className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle"
              data-bs-toggle="sidebar" 
              href="#"
            >
              <span></span>
            </a>
          </div>

          <div className="header-element header-search header-search-content d-md-block d-none">
            <input 
              type="text" 
              className="header-search-bar form-control bg-white" 
              id="header-search"
              placeholder="Rechercher" 
              spellCheck="false" 
              autoComplete="off" 
              autoCapitalize="off" 
            />
            <a href="#" className="header-search-icon border-0">
              <i className="bi bi-search fs-12 mb-1"></i>
            </a>
          </div>
        </div>

        {/* Officine Name */}
        <div className="header-content-right">
          <span className="fs-13 fw-medium">
            <h4 id="officine_name">{officineName}</h4>
          </span>
        </div>

        {/* Header Right */}
        <ul className="header-content-right">
          {/* Mobile Search */}
          <li className="header-element d-md-none d-block">
            <a href="#" className="header-link" data-bs-toggle="modal" data-bs-target="#header-responsive-search">
              <svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <circle cx="112" cy="112" r="80" opacity="0.2" />
                <circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
            </a>
          </li>

          {/* Theme Toggle */}
          <li className="header-element header-theme-mode">
            <a href="#" className="header-link layout-setting">
              <span className="light-layout">
                <svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" viewBox="0 0 256 256">
                  <rect width="256" height="256" fill="none" />
                  <path d="M108.11,28.11A96.09,96.09,0,0,0,227.89,147.89,96,96,0,1,1,108.11,28.11Z" opacity="0.2" />
                  <path d="M108.11,28.11A96.09,96.09,0,0,0,227.89,147.89,96,96,0,1,1,108.11,28.11Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                </svg>
              </span>
              <span className="dark-layout">
                <svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" viewBox="0 0 256 256">
                  <rect width="256" height="256" fill="none" />
                  <circle cx="128" cy="128" r="56" opacity="0.2" />
                  <line x1="128" y1="40" x2="128" y2="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <circle cx="128" cy="128" r="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="64" y1="64" x2="56" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="64" y1="192" x2="56" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="192" y1="64" x2="200" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="192" y1="192" x2="200" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="40" y1="128" x2="32" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="128" y1="216" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                  <line x1="216" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                </svg>
              </span>
            </a>
          </li>

          {/* Notifications */}
          <li className="header-element notifications-dropdown d-xl-block d-none dropdown">
            <a href="#" className="header-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" id="messageDropdown" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" opacity="0.2" />
                <path d="M96,192a32,32,0,0,0,64,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
              <span className="header-icon-pulse bg-secondary rounded pulse pulse-secondary"></span>
            </a>
            <div className="main-header-dropdown dropdown-menu dropdown-menu-end" data-popper-placement="none">
              <div className="p-3 bg-primary text-fixed-white">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="mb-0 fs-16">Notifications</p>
                  <a href="#" className="badge bg-light text-default border">Clear All</a>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <ul className="list-unstyled mb-0" id="header-notification-scroll">
                <li className="dropdown-item position-relative">
                  <a href="#" className="stretched-link"></a>
                  <div className="d-flex align-items-start gap-3">
                    <div className="lh-1">
                      <span className="avatar avatar-sm avatar-rounded bg-primary-transparent">
                        <i className="ri-shopping-cart-line fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill">
                      <span className="d-block fw-semibold">Commande validée</span>
                      <span className="d-block text-muted fs-12">La commande a été validée</span>
                    </div>
                    <div className="text-end">
                      <span className="d-block mb-1 fs-12 text-muted">02:16pm</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </li>

          {/* Fullscreen */}
          <li className="header-element header-fullscreen">
            <a href="#" className="header-link" data-bs-toggle="fullscreen">
              <svg xmlns="http://www.w3.org/2000/svg" className="full-screen-open header-link-icon" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <rect x="48" y="48" width="160" height="160" opacity="0.2" />
                <polyline points="168 48 208 48 208 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <polyline points="88 208 48 208 48 168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <polyline points="208 168 208 208 168 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <polyline points="48 88 48 48 88 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="full-screen-close header-link-icon d-none" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M168,48V88H208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M88,208V168H48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M208,168H168v40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M48,88H88V48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
            </a>
          </li>

          {/* Profile Dropdown */}
          <li className="header-element dropdown">
            <a href="#" className="header-link dropdown-toggle" id="mainHeaderProfile" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
              <div>
                <Image src="/images/faces/pharmacy_profile.png" alt="Profile" className="header-link-icon" width={32} height={32} />
              </div>
            </a>
            <div className="main-header-dropdown dropdown-menu pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end" aria-labelledby="mainHeaderProfile">
              <div className="p-3 bg-primary text-fixed-white">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="mb-0 fs-16">Profil pharmacie</p>
                  <a href="#" className="text-fixed-white"><i className="ti ti-settings-cog"></i></a>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="p-3">
                <div className="d-flex align-items-start gap-2">
                  <div className="lh-1">
                    <span className="avatar avatar-sm bg-primary-transparent avatar-rounded">
                      <Image src="/images/faces/pharmacy_profile.png" alt="Profile" width={32} height={32} />
                    </span>
                  </div>
                  <div>
                    <span className="d-block fw-semibold lh-1" id="officine_name2">{officineName}</span>
                    <span className="text-muted fs-12" id="officine_number">{officineNumber}</span>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <ul className="list-unstyled mb-0">
                <li>
                  <ul className="list-unstyled mb-0 sub-list">
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" href="/profile">
                        <i className="ti ti-settings-cog me-2 fs-18"></i>Profil Pharmacie
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <ul className="list-unstyled mb-0 sub-list">
                    <li>
                      <a className="dropdown-item d-flex align-items-center" href="#" onClick={handleLogout}>
                        <i className="ti ti-logout me-2 fs-18"></i>Se déconnecter
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </li>

          {/* Switcher */}
          <li className="header-element">
            <a href="#" className="header-link switcher-icon" data-bs-toggle="offcanvas" data-bs-target="#switcher-canvas">
              <svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M207.86,123.18l16.78-21a99.14,99.14,0,0,0-10.07-24.29l-26.7-3a81,81,0,0,0-6.81-6.81l-3-26.71a99.43,99.43,0,0,0-24.3-10l-21,16.77a81.59,81.59,0,0,0-9.64,0l-21-16.78A99.14,99.14,0,0,0,77.91,41.43l-3,26.7a81,81,0,0,0-6.81,6.81l-26.71,3a99.43,99.43,0,0,0-10,24.3l16.77,21a81.59,81.59,0,0,0,0,9.64l-16.78,21a99.14,99.14,0,0,0,10.07,24.29l26.7,3a81,81,0,0,0,6.81,6.81l3,26.71a99.43,99.43,0,0,0,24.3,10l21-16.77a81.59,81.59,0,0,0,9.64,0l21,16.78a99.14,99.14,0,0,0,24.29-10.07l3-26.7a81,81,0,0,0,6.81-6.81l26.71-3a99.43,99.43,0,0,0,10-24.3l-16.77-21A81.59,81.59,0,0,0,207.86,123.18ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2" />
                <circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}