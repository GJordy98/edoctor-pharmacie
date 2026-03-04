'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

import { api } from '@/lib/api-client';
import type { PharmaNotification } from '@/lib/types';

export default function Header() {
  const [officineName, setOfficineName] = useState('');
  const [officineNumber, setOfficineNumber] = useState('');
  const [notifications, setNotifications] = useState<PharmaNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const name = localStorage.getItem('officine_name') || 'Pharmacie';
    const number = localStorage.getItem('officine_number') || '';
    queueMicrotask(() => {
      setOfficineName(name);
      setOfficineNumber(number);
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // silencieux
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notif: PharmaNotification) => {
    if (notif.is_read) return;
    await api.markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );
  };

  const handleClearAll = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => api.markNotificationAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    api.logout();
    window.location.href = '/login';
  };

  const toggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    const html = document.documentElement;
    const currentToggled = html.getAttribute('data-toggled');
    if (currentToggled !== 'close') {
      html.setAttribute('data-toggled', 'close');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) overlay.remove();
    } else {
      html.setAttribute('data-toggled', 'open');
      if (window.innerWidth < 992) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText =
          'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99;transition:opacity 0.3s;';
        overlay.addEventListener('click', () => {
          html.setAttribute('data-toggled', 'close');
          overlay.remove();
        });
        document.body.appendChild(overlay);
      }
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
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
              aria-label="Toggle Sidebar"
              className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle"
              href="#"
              onClick={toggleSidebar}
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
          <li className="header-element notifications-dropdown d-xl-block d-none dropdown" style={{ position: 'relative' }}>
            <a
              href="#"
              className="header-link dropdown-toggle"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              id="messageDropdown"
              aria-expanded="false"
              style={{ position: 'relative' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none" />
                <path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" opacity="0.2" />
                <path d="M96,192a32,32,0,0,0,64,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="badge bg-danger"
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    fontSize: '10px',
                    minWidth: '18px',
                    height: '18px',
                    lineHeight: '18px',
                    padding: '0 4px',
                    borderRadius: '9px',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </a>
            <div className="main-header-dropdown dropdown-menu dropdown-menu-end" data-popper-placement="none">
              <div className="p-3 bg-primary text-fixed-white">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="mb-0 fs-16">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="badge bg-white text-primary ms-2" style={{ fontSize: '11px' }}>
                        {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  <button
                    className="badge bg-light text-default border"
                    style={{ cursor: 'pointer', background: 'none' }}
                    onClick={handleClearAll}
                  >
                    Tout marquer lu
                  </button>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <ul
                className="list-unstyled mb-0"
                id="header-notification-scroll"
                style={{ maxHeight: '320px', overflowY: 'auto' }}
              >
                {loadingNotifs ? (
                  <li className="dropdown-item text-center text-muted py-3">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Chargement…
                  </li>
                ) : notifications.length === 0 ? (
                  <li className="dropdown-item text-center text-muted py-4">
                    <i className="ri-notification-off-line fs-24 d-block mb-1"></i>
                    Aucune notification
                  </li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`dropdown-item position-relative${notif.is_read ? '' : ' bg-light'}`}
                      style={{
                        borderLeft: notif.is_read ? 'none' : '3px solid var(--primary-color, #4361ee)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleMarkAsRead(notif)}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className="lh-1">
                          <span className="avatar avatar-sm avatar-rounded bg-primary-transparent">
                            <i className="ri-shopping-cart-line fs-16"></i>
                          </span>
                        </div>
                        <div className="flex-fill">
                          <span className={`d-block${notif.is_read ? '' : ' fw-semibold'}`}>
                            {notif.title}
                          </span>
                          <span className="d-block text-muted fs-12">{notif.message}</span>
                        </div>
                        <div className="text-end" style={{ minWidth: '48px' }}>
                          <span className="d-block mb-1 fs-12 text-muted">{formatTime(notif.created_at)}</span>
                          {!notif.is_read && (
                            <span className="badge bg-primary-transparent text-primary" style={{ fontSize: '9px' }}>
                              Nouveau
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
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
        </ul>
      </div>
    </header>
  );
}