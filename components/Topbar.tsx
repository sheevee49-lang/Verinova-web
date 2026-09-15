'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch, timeAgo } from '@/lib/client';

type Notification = { id: number; message: string; is_read: boolean; created_at: string };

const NAV_ITEMS = [
  { href: '/dashboard/discover', label: 'Discover' },
  { href: '/dashboard/communities', label: 'Communities' },
  { href: '/dashboard/profile', label: 'My Profile' },
  { href: '/dashboard/admin', label: 'Admin' },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    apiFetch('/notifications').then((d) => {
      setNotifications(d.notifications);
      setUnreadCount(d.unread_count);
    }).catch(() => {});
  }, []);

  async function togglePanel() {
    const next = !panelOpen;
    setPanelOpen(next);
    if (next) {
      const d = await apiFetch('/notifications');
      setNotifications(d.notifications);
      setUnreadCount(d.unread_count);
    }
  }

  async function markAllRead() {
    await apiFetch('/notifications/read-all', { method: 'POST' });
    const d = await apiFetch('/notifications');
    setNotifications(d.notifications);
    setUnreadCount(d.unread_count);
  }

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="topbar">
      <div className="topbar-brand">
<Image
  src="/logo-icon.png"
  alt="VeriNova"
  width={907}
  height={403}
  style={{ height: '28px', width: 'auto' }}
  priority
/>
        <span>VeriNova Connect</span>
      </div>
      <nav className="topbar-nav">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={`nav-btn ${pathname === item.href ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={togglePanel} type="button">
          <span>Notifications</span>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
        <button className="icon-btn" onClick={logout} type="button">Log out</button>
      </div>

      {panelOpen && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <span>Notifications</span>
            <button onClick={markAllRead} type="button">Mark all read</button>
          </div>
          <div className="notif-list">
            {notifications.length === 0 && <div className="notif-empty">No notifications yet.</div>}
            {notifications.map((n) => (
              <div key={n.id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
                {n.message}
                <span className="notif-time">{timeAgo(n.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
