import { Check, Circle, Cloud, Globe2, Palette, Save, ShieldCheck, Sun } from 'lucide-react';
import { useState } from 'react';
import { useCms } from '../context/CmsContext';

const defaultSettings = {
  publicationName: 'Storyline Journal',
  publicationUrl: 'storyline.site',
  description: 'Independent stories about design, technology, place, and the way we live now.',
  comments: true,
  emailDigest: true,
  approvals: false,
};

const whiteThemes = [
  { id: 'warm', label: 'Ivory', description: 'Soft and warm', icon: Sun },
  { id: 'pure', label: 'Pure', description: 'Bright and clean', icon: Circle },
  { id: 'cloud', label: 'Cloud', description: 'Calm and muted', icon: Cloud },
];

function readSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem('storyline-workspace-settings') || 'null');
    return stored && typeof stored === 'object' ? { ...defaultSettings, ...stored } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function Toggle({ checked, onChange, label }) {
  return <button type="button" className={`toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span /></button>;
}

export default function SettingsPage() {
  const { theme, setTheme, uiSize, setUiSize, notify } = useCms();
  const [settings, setSettings] = useState(readSettings);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const saveSettings = () => {
    const nextErrors = {};
    if (settings.publicationName.trim().length < 2) nextErrors.publicationName = 'Enter a publication name.';
    if (!/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(settings.publicationUrl.trim())) nextErrors.publicationUrl = 'Enter a valid domain, such as storyline.site.';
    if (settings.description.trim().length < 20) nextErrors.description = 'Add a description of at least 20 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify('Review the highlighted publication fields', 'error');
      requestAnimationFrame(() => document.querySelector('.settings-section [aria-invalid="true"]')?.focus());
      return;
    }
    localStorage.setItem('storyline-workspace-settings', JSON.stringify(settings));
    notify('Workspace settings saved');
  };

  return (
    <div>
      <section className="page-heading">
        <div><p className="eyebrow">Workspace</p><h2>Settings</h2><p>Make Storyline feel like home for your team.</p></div>
        <button className="button button--primary" type="button" onClick={saveSettings}><Save size={17} /> Save changes</button>
      </section>
      <div className="settings-grid">
        <nav className="settings-nav" aria-label="Settings sections">
          <a className="is-active" href="#publication"><Globe2 size={17} />Publication</a>
          <a href="#appearance"><Palette size={17} />Appearance</a>
          <a href="#workflow"><ShieldCheck size={17} />Workflow</a>
        </nav>
        <div className="settings-content">
          <section className="panel settings-section" id="publication">
            <div className="settings-section__heading"><div className="settings-section__icon"><Globe2 size={19} /></div><div><h3>Publication details</h3><p>Basic information readers see across your site.</p></div></div>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="publication-name">Publication name</label>
                <input className="input" id="publication-name" value={settings.publicationName} onChange={(event) => update('publicationName', event.target.value)} aria-invalid={!!errors.publicationName} />
                {errors.publicationName && <span className="field-error">{errors.publicationName}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="publication-url">Publication URL</label>
                <input className="input" id="publication-url" value={settings.publicationUrl} onChange={(event) => update('publicationUrl', event.target.value)} aria-invalid={!!errors.publicationUrl} />
                {errors.publicationUrl && <span className="field-error">{errors.publicationUrl}</span>}
              </div>
            </div>
            <div className="form-field">
              <div className="form-label-row"><label htmlFor="publication-description">Description</label><span>{settings.description.length}/180</span></div>
              <textarea className="input settings-textarea" id="publication-description" maxLength={180} value={settings.description} onChange={(event) => update('description', event.target.value)} aria-invalid={!!errors.description} />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
          </section>

          <section className="panel settings-section" id="appearance">
            <div className="settings-section__heading"><div className="settings-section__icon"><Palette size={19} /></div><div><h3>Appearance</h3><p>Choose a noticeably different white tone and comfortable interface size.</p></div></div>
            <div className="white-theme-grid" aria-label="Workspace white tone">
              {whiteThemes.map(({ id, label, description, icon: Icon }) => (
                <button type="button" key={id} className={theme === id ? 'is-active' : ''} onClick={() => setTheme(id)} aria-pressed={theme === id}>
                  <span className={`white-swatch white-swatch--${id}`}><Icon size={19} /></span>
                  <span><strong>{label}</strong><small>{description}</small></span>
                  {theme === id && <Check size={18} />}
                </button>
              ))}
            </div>
            <div className="interface-size-control">
              <div><strong>Interface size</strong><span>Adjust text, controls, and workspace spacing.</span></div>
              <div className="size-options" aria-label="Interface size">
                {['small', 'medium', 'large'].map((size) => (
                  <button key={size} type="button" className={uiSize === size ? 'is-active' : ''} onClick={() => setUiSize(size)} aria-pressed={uiSize === size}>
                    <b className={`size-sample size-sample--${size}`}>A</b>
                    <span>{size[0].toUpperCase() + size.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="panel settings-section" id="workflow">
            <div className="settings-section__heading"><div className="settings-section__icon"><ShieldCheck size={19} /></div><div><h3>Editorial workflow</h3><p>Control publishing and notification defaults.</p></div></div>
            <div className="setting-row"><div><strong>Reader comments</strong><span>Allow comments on newly published articles.</span></div><Toggle label="Reader comments" checked={settings.comments} onChange={(value) => update('comments', value)} /></div>
            <div className="setting-row"><div><strong>Weekly digest</strong><span>Email editors a weekly publication summary.</span></div><Toggle label="Weekly digest" checked={settings.emailDigest} onChange={(value) => update('emailDigest', value)} /></div>
            <div className="setting-row"><div><strong>Require approval</strong><span>Contributors need an editor to approve publishing.</span></div><Toggle label="Require approval" checked={settings.approvals} onChange={(value) => update('approvals', value)} /></div>
          </section>
        </div>
      </div>
    </div>
  );
}
