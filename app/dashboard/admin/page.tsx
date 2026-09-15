'use client';

import { useEffect, useState } from 'react';
import { apiFetch, timeAgo } from '@/lib/client';
import { useToast } from '@/components/Toast';

type Stats = { total_users: number; total_communities: number; total_notifications: number };
type AdminUser = { id: number; full_name: string; email: string; user_type: string; location: string; created_at: string };
type AdminCommunity = { id: number; name: string; category: string; county: string; member_count: number; creator_name: string; created_at: string };
type AdminNotification = { id: number; recipient_name: string; type: string; message: string; is_read: boolean; created_at: string };

export default function AdminPage() {
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [communities, setCommunities] = useState<AdminCommunity[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [tab, setTab] = useState<'users' | 'communities' | 'activity'>('users');

  useEffect(() => {
    apiFetch('/admin/overview')
      .then((d) => {
        setStats(d.stats);
        setUsers(d.users);
        setCommunities(d.communities);
        setNotifications(d.recent_notifications);
      })
      .catch((err) => toast(err.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="view">
      <div className="view-head">
        <h2>Admin dashboard</h2>
        <p>All registered users, communities, and recent notification activity. Not access-restricted yet — anyone logged in can view this.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-num">{stats?.total_users ?? '—'}</span>
          <span className="stat-label">Total users</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats?.total_communities ?? '—'}</span>
          <span className="stat-label">Total communities</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats?.total_notifications ?? '—'}</span>
          <span className="stat-label">Total notifications</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')} type="button">
          Users ({users.length})
        </button>
        <button className={`admin-tab ${tab === 'communities' ? 'active' : ''}`} onClick={() => setTab('communities')} type="button">
          Communities ({communities.length})
        </button>
        <button className={`admin-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')} type="button">
          Recent activity
        </button>
      </div>

      {tab === 'users' && (
        users.length === 0 ? <div className="empty-state">No users yet.</div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Type</th><th>Location</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.user_type}</td>
                    <td>{u.location || '—'}</td>
                    <td>{timeAgo(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'communities' && (
        communities.length === 0 ? <div className="empty-state">No communities yet.</div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>County</th><th>Creator</th><th>Members</th><th>Created</th></tr>
              </thead>
              <tbody>
                {communities.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.category || '—'}</td>
                    <td>{c.county || '—'}</td>
                    <td>{c.creator_name}</td>
                    <td>{c.member_count}</td>
                    <td>{timeAgo(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'activity' && (
        notifications.length === 0 ? <div className="empty-state">No notification activity yet.</div> : (
          <div className="community-list">
            {notifications.map((n) => (
              <div key={n.id} className="community-row">
                <div className="community-info">
                  <h4>{n.recipient_name}</h4>
                  <p>{n.message}</p>
                  <div className="community-tags">
                    <span>{n.type}</span>
                    <span>{n.is_read ? 'read' : 'unread'}</span>
                  </div>
                </div>
                <div className="community-actions">
                  <span className="member-count">{timeAgo(n.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}