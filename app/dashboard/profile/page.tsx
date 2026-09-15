'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch } from '@/lib/client';
import { useToast } from '@/components/Toast';

type Interest = { id: number; name: string };
type Profile = {
  full_name: string; user_type: string; location: string; profession: string;
  skills: string; bio: string; interests: Interest[];
};

const USER_TYPES = ['Individual', 'Farmer', 'Skilled Professional', 'Business', 'NGO', 'Government Agency', 'Investor', 'Youth'];

export default function ProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch('/auth/me'), apiFetch('/interests')]).then(([me, allI]) => {
      setProfile(me.user);
      setAllInterests(allI.interests);
      setSelectedIds(new Set(me.user.interests.map((i: Interest) => i.id)));
    }).catch((err) => toast(err.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleInterest(id: number) {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
    try {
      await apiFetch('/profiles/me/interests', {
        method: 'PUT',
        body: JSON.stringify({ interest_ids: Array.from(next) }),
      });
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: form.get('full_name'),
          user_type: form.get('user_type'),
          location: form.get('location'),
          profession: form.get('profession'),
          skills: form.get('skills'),
          bio: form.get('bio'),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  if (!profile) return null;

  return (
    <section className="view">
      <div className="view-head">
        <h2>My profile</h2>
        <p>This is what other members will see about you.</p>
      </div>

      <form className="profile-form" onSubmit={saveProfile}>
        <div className="profile-grid">
          <label>Full name
            <input type="text" name="full_name" defaultValue={profile.full_name} />
          </label>
          <label>I am a...
            <select name="user_type" defaultValue={profile.user_type}>
              {USER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Location
            <input type="text" name="location" defaultValue={profile.location} />
          </label>
          <label>Profession / focus area
            <input type="text" name="profession" defaultValue={profile.profession} />
          </label>
          <label className="full-width">Skills (comma-separated)
            <input type="text" name="skills" defaultValue={profile.skills} placeholder="e.g. Web development, Poultry farming, Grant writing" />
          </label>
          <label className="full-width">Bio
            <textarea name="bio" rows={4} defaultValue={profile.bio} placeholder="Tell the community what you do and what you're looking for..." />
          </label>
        </div>

        <div className="interest-picker">
          <p className="picker-label">Interests</p>
          <div className="tag-list">
            {allInterests.map((i) => (
              <button
                key={i.id} type="button"
                className={`tag-chip ${selectedIds.has(i.id) ? 'selected' : ''}`}
                onClick={() => toggleInterest(i.id)}
              >
                {i.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary">Save profile</button>
        {saved && <p className="form-success">Profile saved.</p>}
      </form>
    </section>
  );
}
