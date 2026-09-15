'use client';

import { useEffect, useState } from 'react';
import { apiFetch, initials } from '@/lib/client';
import { useToast } from '@/components/Toast';

type Member = {
  id: number; full_name: string; user_type: string; location: string;
  profession: string; skills: string; bio: string;
};
type Interest = { id: number; name: string };
type FullMember = Member & { interests: Interest[] };

const USER_TYPES = ['', 'Individual', 'Farmer', 'Skilled Professional', 'Business', 'NGO', 'Government Agency', 'Investor', 'Youth'];

export default function DiscoverPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [userType, setUserType] = useState('');
  const [location, setLocation] = useState('');
  const [interestId, setInterestId] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<FullMember | null>(null);

  useEffect(() => {
    apiFetch('/interests').then((d) => setInterests(d.interests)).catch(() => {});
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (userType) params.set('user_type', userType);
    if (location) params.set('location', location);
    if (interestId) params.set('interest_id', interestId);
    try {
      const d = await apiFetch(`/search/members?${params.toString()}`);
      setMembers(d.members);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  async function openMember(id: number) {
    try {
      const d = await apiFetch(`/profiles/${id}`);
      setSelected(d.user);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  return (
    <section className="view">
      <div className="view-head">
        <h2>Discover people</h2>
        <p>Find members by name, skill, profession, type, or location.</p>
      </div>

      <div className="filter-bar">
        <input
          type="text" placeholder="Search name, skill, or profession..."
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
        />
        <select value={userType} onChange={(e) => setUserType(e.target.value)}>
          {USER_TYPES.map((t) => <option key={t} value={t}>{t || 'Any type'}</option>)}
        </select>
        <input type="text" placeholder="Location..." value={location} onChange={(e) => setLocation(e.target.value)} />
        <select value={interestId} onChange={(e) => setInterestId(e.target.value)}>
          <option value="">Any interest</option>
          {interests.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <button className="btn-secondary" onClick={runSearch} type="button">Search</button>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">No members match yet. Try a broader search, or check back as more people join.</div>
      ) : (
        <div className="member-grid">
          {members.map((m) => (
            <div key={m.id} className="member-card" onClick={() => openMember(m.id)}>
              <div className="member-avatar">{initials(m.full_name)}</div>
              <h4>{m.full_name}</h4>
              <div className="member-type">{m.user_type}</div>
              {m.profession && <p className="member-meta">{m.profession}</p>}
              {m.location && <p className="member-meta">📍 {m.location}</p>}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-box member-profile-card" onClick={(e) => e.stopPropagation()}>
            <div className="member-avatar">{initials(selected.full_name)}</div>
            <h3>{selected.full_name}</h3>
            <div className="member-type">{selected.user_type}</div>
            {selected.profession && <div className="mp-row"><strong>Profession:</strong> {selected.profession}</div>}
            {selected.location && <div className="mp-row"><strong>Location:</strong> {selected.location}</div>}
            {selected.skills && <div className="mp-row"><strong>Skills:</strong> {selected.skills}</div>}
            {selected.bio && <p className="mp-bio">{selected.bio}</p>}
            {selected.interests?.length > 0 && (
              <div className="mp-tags">
                {selected.interests.map((i) => <span key={i.id}>{i.name}</span>)}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: '1.4rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
