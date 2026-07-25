import React, { useState, useContext } from 'react';
import { 
  Sparkles, Plus, Trash2, Link2, 
  ExternalLink, Check, Layout, Palette, ArrowLeft, MoveUp, MoveDown, AtSign
} from 'lucide-react';
import { useToast } from '../context/ToastContextInstance';
import { apiFetch, API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const themes = [
  { id: 'glassmorphism', name: 'Glassmorphism', bg: 'from-indigo-950 via-slate-900 to-purple-950', preview: 'bg-indigo-900/50' },
  { id: 'dark-neon', name: 'Dark Neon', bg: 'bg-background', preview: 'bg-emerald-950/80 border-emerald-400' },
  { id: 'minimal-light', name: 'Minimal Light', bg: 'bg-slate-50 text-slate-900', preview: 'bg-white border-slate-300' },
  { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-yellow-400 text-black', preview: 'bg-black text-yellow-300' },
  { id: 'sunset', name: 'Sunset Gradient', bg: 'from-amber-600 via-rose-600 to-purple-900', preview: 'bg-rose-900/50' }
];

export default function BioBuilder({ bioPage, onBack, onSaveSuccess }) {
  const { addToast } = useToast();
  const { user, login, logout } = useContext(AuthContext);
  const [slug, setSlug] = useState(bioPage ? bioPage.slug : '');
  const [title, setTitle] = useState(bioPage ? bioPage.title : 'My Portfolio & Links');
  const [bio, setBio] = useState(bioPage ? bioPage.bio : 'Welcome to my official links!');
  const [avatarUrl, setAvatarUrl] = useState(bioPage ? bioPage.avatarUrl : '');
  const [theme, setTheme] = useState(bioPage ? bioPage.theme : 'glassmorphism');
  const [socialLinks, setSocialLinks] = useState(bioPage ? bioPage.socialLinks : {
    twitter: '', github: '', linkedin: '', instagram: '', youtube: '', website: ''
  });
  const [links, setLinks] = useState(bioPage ? bioPage.links : [
    { title: 'My Official Website', url: 'https://example.com', isHighlighted: true },
    { title: 'Read My Latest Blog', url: 'https://example.com/blog', isHighlighted: false }
  ]);

  const [saving, setSaving] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkHighlight, setNewLinkHighlight] = useState(false);

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      addToast('Please enter both title and valid URL', 'error');
      return;
    }
    setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim(), isHighlighted: newLinkHighlight, clicks: 0 }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkHighlight(false);
  };

  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleMoveLink = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= links.length) return;
    const updated = [...links];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLinks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug.trim()) {
      addToast('URL handle (slug) is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = { slug, title, bio, avatarUrl, theme, socialLinks, links };
      const isEdit = !!bioPage?._id;
      const url = isEdit ? `${API_URL}/api/bio/${bioPage._id}` : `${API_URL}/api/bio`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }, user, login, logout);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save Bio Page');
      }

      addToast(`Bio Page ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      if (onSaveSuccess) onSaveSuccess(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-border-glass">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant transition-all text-on-surface-variant">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              {bioPage ? 'Edit Bio Page' : 'Create New Bio Page'}
            </h1>
            <p className="text-xs text-text-muted">Design custom link-in-bio landing pages with live preview</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-semibold text-on-surface text-sm shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
          {bioPage ? 'Update Bio Page' : 'Publish Bio Page'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Profile Section */}
          <div className="bg-surface/ border border-border-glass rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" />
              Profile Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">URL Handle (Slug)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-mono">/bio/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-portfolio"
                  className="w-full bg-background border border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Display Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-background border border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.com/photo.jpg"
                  className="w-full bg-background border border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="2"
                placeholder="Software Engineer & Content Creator"
                className="w-full bg-background border border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-surface/ border border-border-glass rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <AtSign className="w-5 h-5 text-purple-400" />
              Social Media Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['twitter', 'github', 'linkedin', 'instagram', 'youtube', 'website'].map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-semibold text-text-muted mb-1 capitalize">{platform} URL</label>
                  <input
                    type="text"
                    value={socialLinks[platform] || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                    placeholder={`https://${platform}.com/username`}
                    className="w-full bg-background border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="bg-surface/ border border-border-glass rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-400" />
              Theme & Style
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    theme === t.id ? 'border-purple-500 bg-purple-500/10 text-on-surface shadow-md' : 'border-border-glass bg-background/ text-text-muted hover:border-outline-variant'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg mb-2 ${t.preview}`}></div>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-links List & Adder */}
          <div className="bg-surface/ border border-border-glass rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-400" />
              Manage Sub-Links
            </h2>

            {/* Add New Link Form */}
            <div className="bg-background p-4 rounded-xl border border-border-glass space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Link Title (e.g. My GitHub)"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface"
                />
                <input
                  type="text"
                  placeholder="Target URL (https://...)"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLinkHighlight}
                    onChange={(e) => setNewLinkHighlight(e.target.checked)}
                    className="rounded border-outline-variant text-purple-600 focus:ring-0"
                  />
                  Highlight Link (Featured glow style)
                </label>

                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Link
                </button>
              </div>
            </div>

            {/* List of existing links */}
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between bg-background px-4 py-3 rounded-xl border border-border-glass text-xs gap-4">
                  <div className="min-w-0 w-full pr-2">
                    <span className="font-bold text-on-surface block truncate">{link.title}</span>
                    <span className="text-text-muted block truncate font-mono">{link.url}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleMoveLink(idx, -1)} disabled={idx === 0} className="p-1.5 hover:bg-surface-container rounded text-text-muted disabled:opacity-30">
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleMoveLink(idx, 1)} disabled={idx === links.length - 1} className="p-1.5 hover:bg-surface-container rounded text-text-muted disabled:opacity-30">
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleRemoveLink(idx)} className="p-1.5 hover:bg-rose-950 hover:text-rose-400 rounded text-text-muted">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Phone Live Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-8 w-full max-w-sm">
            <div className="text-center mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Live Preview</div>

            {/* Phone Frame */}
            <div className="w-full bg-surface p-4 rounded-[40px] border-4 border-border-glass shadow-2xl shadow-primary/10 animate-float-slow">
              <div className="w-full h-[580px] rounded-[32px] overflow-y-auto bg-background border border-border-glass p-4 flex flex-col items-center text-center relative">
                {/* Avatar */}
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-purple-500/40" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center text-xl font-bold mb-3">
                    {title ? title.charAt(0) : 'B'}
                  </div>
                )}

                <h3 className="text-base font-bold text-on-surface mb-1 truncate max-w-[240px]">{title || 'Your Title'}</h3>
                <p className="text-xs text-text-muted mb-6 max-w-[240px]">{bio || 'Your bio text goes here...'}</p>

                {/* Sub-links preview */}
                <div className="w-full space-y-2.5">
                  {links.map((link, i) => (
                    <div
                      key={i}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                        link.isHighlighted ? 'bg-purple-600 text-on-surface border-purple-400' : 'bg-surface text-on-surface border-border-glass'
                      }`}
                    >
                      <span className="truncate">{link.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
