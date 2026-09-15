'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch } from '@/lib/client';
import { useToast } from '@/components/Toast';

type Community = {
  id: number; name: string; description: string; category: string; county: string;
  member_count: number; is_member: boolean;
};

export default function CommunitiesPage() {
  const toast = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const d = await apiFetch('/communities');
      setCommunities(d.communities);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  async function join(id: number) {
    try {
      await apiFetch(`/communities/${id}/join`, { method: 'POST' });
      toast('Joined community', 'success');
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  async function createCommunity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch('/communities', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          category: form.get('category'),
          county: form.get('county'),
          description: form.get('description'),
        }),
      });
      setModalOpen(false);
      e.currentTarget.reset();
      toast('Community created', 'success');
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  return (
    <section className="view">
      <div className="view-head">
        <h2>Communities</h2>
        <p>Join a community, or start one for the people you serve.</p>
        <button className="btn-primary" onClick={() => setModalOpen(true)} type="button">+ New community</button>
      </div>

      {communities.length === 0 ? (
        <div className="empty-state">No communities yet. Be the first to start one.</div>
      ) : (
        <div className="community-list">
          {communities.map((c) => (
            <div key={c.id} className="community-row">
              <div className="community-info">
                <h4>{c.name}</h4>
                {c.description && <p>{c.description}</p>}
                <div className="community-tags">
                  {c.category && <span>{c.category}</span>}
                  {c.county && <span>{c.county}</span>}
                </div>
              </div>
              <div className="community-actions">
                <span className="member-count">{c.member_count} member{c.member_count === 1 ? '' : 's'}</span>
                <button className="btn-secondary" disabled={c.is_member} onClick={() => join(c.id)} type="button">
                  {c.is_member ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Start a community</h3>
<form id="community-form" onSubmit={createCommunity}>
              <label>Name
                <input type="text" name="name" required />
              </label>
              <label>Category
                <input type="text" name="category" placeholder="e.g. Agriculture, Tech, Youth" />
              </label>
              <label>County / area
                <input type="text" name="county" />
              </label>
              <label>Description
                <textarea name="description" rows={3} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
