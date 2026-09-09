import { useEffect, useMemo, useRef, useState } from 'react';
import { Bold, Eye, FileImage, Italic, Link2, List, Monitor, Plus, Redo2, Smartphone, Trash2, Type, Underline, Undo2, UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCms } from '../context/CmsContext';
import PreviewPane from './PreviewPane';

const emptyArticle = {
  title: '',
  body: '',
  author: 'Maya Chen',
  category: '',
  tags: [],
  status: 'draft',
  featuredImage: '/images/editorial-1.svg',
};

export default function ArticleForm({ article, mode = 'create' }) {
  const { categories, createArticle, updateArticle, notify } = useCms();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const draftKey = `storyline-editor-draft-${article?.id || 'new'}`;
  const [form, setForm] = useState(() => {
    const base = { ...emptyArticle, ...article, tags: article?.tags || [] };
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
      const isNewer = saved?.savedAt && (!article?.updatedAt || new Date(saved.savedAt) > new Date(article.updatedAt));
      return isNewer ? { ...base, ...saved.form, tags: saved.form?.tags || base.tags } : base;
    } catch {
      return base;
    }
  });
  const bodyHistoryRef = useRef([form.body]);
  const historyIndexRef = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [device, setDevice] = useState('desktop');
  const [dragging, setDragging] = useState(false);

  const previewArticle = useMemo(() => ({ ...form, updatedAt: article?.updatedAt || new Date().toISOString() }), [form, article]);

  useEffect(() => {
    if (!dirty) return undefined;
    setSaveNote('Saving locally…');
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ form, savedAt: new Date().toISOString() }));
      setSaveNote('Draft saved locally');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [form, dirty, draftKey]);

  useEffect(() => {
    const protectDraft = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const keyboardSave = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('beforeunload', protectDraft);
    document.addEventListener('keydown', keyboardSave);
    return () => {
      window.removeEventListener('beforeunload', protectDraft);
      document.removeEventListener('keydown', keyboardSave);
    };
  }, [dirty]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setSaveNote('Unsaved changes');
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Give your article a clear title.';
    else if (form.title.trim().length < 5) next.title = 'Title must be at least 5 characters.';
    if (form.title.length > 110) next.title = 'Keep the title under 110 characters.';
    if (!form.body.trim()) next.body = 'Article content is required.';
    else if (form.body.trim().length < 80) next.body = 'Add at least 80 characters of content.';
    if (!form.author.trim()) next.author = 'Author name is required.';
    if (!form.category) next.category = 'Choose a category.';
    if (form.featuredImage && !form.featuredImage.startsWith('data:')) {
      try { new URL(form.featuredImage, window.location.origin); } catch { next.featuredImage = 'Enter a valid image URL.'; }
    }
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector('.editor-form [aria-invalid="true"]')?.focus());
      notify('Please review the highlighted fields', 'error');
      return false;
    }
    return true;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, title: form.title.trim(), body: form.body.trim(), author: form.author.trim() };
      const saved = mode === 'edit'
        ? await updateArticle(article.id, payload)
        : await createArticle(payload);
      localStorage.removeItem(draftKey);
      setDirty(false);
      setSaveNote('All changes synced');
      navigate(`/articles/${saved.id}/edit`, { replace: true });
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = (rawValue = tagInput) => {
    const values = rawValue.split(',').map((tag) => tag.trim().replace(/^#/, '').toLowerCase()).filter(Boolean);
    if (!values.length) return;
    setField('tags', [...new Set([...form.tags, ...values])].slice(0, 8));
    setTagInput('');
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
    if (event.key === 'Backspace' && !tagInput && form.tags.length) {
      setField('tags', form.tags.slice(0, -1));
    }
  };

  const handleImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Choose an image file', 'error');
    if (file.size > 2 * 1024 * 1024) return notify('Image must be smaller than 2 MB', 'error');
    const reader = new FileReader();
    reader.onload = () => setField('featuredImage', reader.result);
    reader.readAsDataURL(file);
  };

  const updateBody = (value, record = true) => {
    if (record) {
      const currentHistory = bodyHistoryRef.current.slice(0, historyIndexRef.current + 1);
      if (currentHistory.at(-1) !== value) {
        currentHistory.push(value);
        bodyHistoryRef.current = currentHistory.slice(-100);
        historyIndexRef.current = bodyHistoryRef.current.length - 1;
        setHistoryVersion((version) => version + 1);
      }
    }
    setField('body', value);
  };

  const undoBody = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    updateBody(bodyHistoryRef.current[historyIndexRef.current], false);
    setHistoryVersion((version) => version + 1);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const redoBody = () => {
    if (historyIndexRef.current >= bodyHistoryRef.current.length - 1) return;
    historyIndexRef.current += 1;
    updateBody(bodyHistoryRef.current[historyIndexRef.current], false);
    setHistoryVersion((version) => version + 1);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.body.slice(start, end);
    updateBody(`${form.body.slice(0, start)}${before}${selected}${after}${form.body.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const canUndo = historyVersion >= 0 && historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < bodyHistoryRef.current.length - 1;

  return (
    <form ref={formRef} className="editor-form" onSubmit={submit} noValidate>
      <div className="editor-toolbar-card">
        <div>
          <p className="eyebrow">{mode === 'edit' ? 'Editing article' : 'Create content'}</p>
          <h2>{mode === 'edit' ? form.title || 'Untitled article' : 'Tell a story worth sharing'}</h2>
          <span className={dirty ? 'editor-save-note is-dirty' : 'editor-save-note'}><i aria-hidden="true" />{saveNote || (mode === 'edit' ? 'All changes synced' : 'Drafts save locally as you write')}</span>
        </div>
        <div className="editor-toolbar-card__actions">
          <div className="view-toggle" aria-label="Editor view">
            <button type="button" className={viewMode === 'edit' ? 'is-active' : ''} onClick={() => setViewMode('edit')}>Edit</button>
            <button type="button" className={viewMode === 'split' ? 'is-active' : ''} onClick={() => setViewMode('split')}>Split</button>
            <button type="button" className={viewMode === 'preview' ? 'is-active' : ''} onClick={() => setViewMode('preview')}><Eye size={15} /> Preview</button>
          </div>
          <button className="button button--secondary" type="button" onClick={() => navigate('/articles')}>Cancel</button>
          <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create article'}</button>
        </div>
      </div>

      <div className={`editor-workspace editor-workspace--${viewMode}`}>
        {viewMode !== 'preview' && (
          <div className="editor-fields">
            <section className="form-card">
              <div className="form-card__heading"><div><span>01</span><div><h3>Story details</h3><p>Give readers a clear reason to begin.</p></div></div></div>
              <div className="form-field">
                <div className="form-label-row"><label htmlFor="article-title">Title <em>*</em></label><span className={form.title.length > 110 ? 'is-danger' : ''}>{form.title.length}/110</span></div>
                <input id="article-title" className="input input--title" value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="A title that invites readers in" maxLength={120} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
                {errors.title && <p className="field-error" id="title-error">{errors.title}</p>}
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="article-author">Author <em>*</em></label>
                  <input id="article-author" className="input" value={form.author} onChange={(event) => setField('author', event.target.value)} placeholder="Author name" aria-invalid={!!errors.author} />
                  {errors.author && <p className="field-error">{errors.author}</p>}
                </div>
                <div className="form-field">
                  <label htmlFor="article-category">Category <em>*</em></label>
                  <select id="article-category" className="input" value={form.category} onChange={(event) => setField('category', event.target.value)} aria-invalid={!!errors.category}>
                    <option value="">Select a category</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  {errors.category && <p className="field-error">{errors.category}</p>}
                </div>
              </div>
            </section>

            <section className="form-card">
              <div className="form-card__heading"><div><span>02</span><div><h3>Article content</h3><p>Write with clarity. Your preview updates live.</p></div></div><small>{form.body.trim().split(/\s+/).filter(Boolean).length} words</small></div>
              <div className="rich-editor">
                <div className="rich-editor__toolbar" aria-label="Text formatting tools">
                  <button type="button" onClick={() => insertText('## ')} title="Heading"><Type size={17} /></button>
                  <i />
                  <button type="button" onClick={() => insertText('**', '**')} title="Bold"><Bold size={17} /></button>
                  <button type="button" onClick={() => insertText('_', '_')} title="Italic"><Italic size={17} /></button>
                  <button type="button" onClick={() => insertText('__', '__')} title="Underline"><Underline size={17} /></button>
                  <i />
                  <button type="button" onClick={() => insertText('\n• ')} title="List"><List size={18} /></button>
                  <button type="button" onClick={() => insertText('[', '](https://)')} title="Link"><Link2 size={17} /></button>
                  <span />
                  <button type="button" onClick={undoBody} title="Undo" aria-label="Undo content change" disabled={!canUndo}><Undo2 size={17} /></button>
                  <button type="button" onClick={redoBody} title="Redo" aria-label="Redo content change" disabled={!canRedo}><Redo2 size={17} /></button>
                </div>
                <label className="sr-only" htmlFor="article-body">Article content</label>
                <textarea ref={textareaRef} id="article-body" value={form.body} onChange={(event) => updateBody(event.target.value)} placeholder="Begin your story…\n\nUse short paragraphs to make your ideas easy to follow." rows={16} aria-invalid={!!errors.body} />
              </div>
              {errors.body && <p className="field-error">{errors.body}</p>}
            </section>

            <section className="form-card">
              <div className="form-card__heading"><div><span>03</span><div><h3>Publishing details</h3><p>Help your story find the right audience.</p></div></div></div>
              <div className="form-field">
                <label htmlFor="article-tags">Tags <span>(up to 8)</span></label>
                <div className="tags-input" onClick={() => document.getElementById('article-tags')?.focus()}>
                  {form.tags.map((tag) => <span key={tag}>#{tag}<button type="button" onClick={() => setField('tags', form.tags.filter((item) => item !== tag))} aria-label={`Remove ${tag} tag`}><X size={13} /></button></span>)}
                  <input id="article-tags" value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={handleTagKeyDown} onBlur={() => addTag()} placeholder={form.tags.length ? 'Add another…' : 'Type a tag and press Enter'} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="article-status">Status</label>
                  <select id="article-status" className="input" value={form.status} onChange={(event) => setField('status', event.target.value)}>
                    <option value="draft">Draft — visible to team</option>
                    <option value="published">Published — live to readers</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="article-image-url">Featured image URL</label>
                  <input id="article-image-url" className="input" type="text" value={form.featuredImage?.startsWith('data:') ? '' : form.featuredImage} onChange={(event) => setField('featuredImage', event.target.value)} placeholder="https://example.com/image.jpg" aria-invalid={!!errors.featuredImage} />
                  {errors.featuredImage && <p className="field-error">{errors.featuredImage}</p>}
                </div>
              </div>
              <div
                className={`image-drop ${dragging ? 'is-dragging' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); handleImage(event.dataTransfer.files[0]); }}
              >
                {form.featuredImage ? <img src={form.featuredImage} alt="Featured preview" /> : <div className="image-drop__placeholder"><FileImage size={24} /></div>}
                <div><UploadCloud size={20} /><span><strong>Drop an image here</strong><small>PNG, JPG, WEBP or SVG · max 2 MB</small></span></div>
                <input ref={fileRef} type="file" accept="image/*" onChange={(event) => handleImage(event.target.files[0])} className="sr-only" />
                <button className="button button--secondary button--small" type="button" onClick={() => fileRef.current?.click()}><Plus size={15} /> Browse</button>
                {form.featuredImage && <button className="image-drop__remove" type="button" onClick={() => setField('featuredImage', '')} aria-label="Remove featured image"><Trash2 size={15} /></button>}
              </div>
            </section>
          </div>
        )}

        {viewMode !== 'edit' && (
          <aside className={`live-preview live-preview--${device}`} aria-label="Live article preview">
            <div className="live-preview__topbar">
              <div><span className="live-dot" /> Live preview</div>
              <div>
                <button type="button" className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview"><Monitor size={16} /></button>
                <button type="button" className={device === 'mobile' ? 'is-active' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={16} /></button>
              </div>
            </div>
            <div className="live-preview__canvas"><PreviewPane article={previewArticle} compact /></div>
          </aside>
        )}
      </div>
      <div className="editor-mobile-actions">
        <button className="button button--secondary" type="button" onClick={() => navigate('/articles')}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save article'}</button>
      </div>
    </form>
  );
}
