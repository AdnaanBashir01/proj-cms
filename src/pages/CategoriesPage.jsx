import { ArrowRight, Folder, FolderPlus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { useCms } from '../context/CmsContext';

const palettes = ['green', 'terracotta', 'blue', 'violet', 'sand', 'rose'];

export default function CategoriesPage() {
  const { categories, articles, loading, addCategory } = useCms();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const closeModal = () => {
    setModalOpen(false);
    setName('');
    setError('');
  };

  const createCategory = () => {
    if (name.trim().length < 2) {
      setError('Use at least 2 characters for the category name.');
      return;
    }
    if (addCategory(name)) closeModal();
  };

  return (
    <div>
      <section className="page-heading">
        <div><p className="eyebrow">Taxonomy</p><h2>Shape your publication</h2><p>Organize stories into clear, useful collections.</p></div>
        <button className="button button--primary" type="button" onClick={() => setModalOpen(true)}><Plus size={17} /> New category</button>
      </section>
      <div className="category-card-grid">
        {categories.map((category, index) => {
          const items = articles.filter((article) => article.category === category);
          const published = items.filter((article) => article.status === 'published').length;
          return (
            <article className="category-card" key={category}>
              <div className={`category-card__art category-card__art--${palettes[index % palettes.length]}`}><Folder size={25} /><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div><h3>{category}</h3><p>{items.length} article{items.length !== 1 ? 's' : ''} · {published} published</p></div>
              <div className="category-card__bar"><i style={{ width: `${(published / Math.max(items.length, 1)) * 100}%` }} /></div>
              <Link to={`/articles?category=${encodeURIComponent(category)}`}>View articles <ArrowRight size={15} /></Link>
            </article>
          );
        })}
        {!loading && !categories.length && <p>No categories yet.</p>}
      </div>

      <Modal
        open={modalOpen}
        title="Create a category"
        confirmLabel="Create category"
        onConfirm={createCategory}
        onClose={closeModal}
        tone="brand"
        icon={FolderPlus}
      >
        <p>Categories make your publication easier to explore. You can assign this category from any article form.</p>
        <div className="modal-form-field">
          <label htmlFor="new-category">Category name</label>
          <input
            id="new-category"
            className="input"
            value={name}
            maxLength={32}
            placeholder="e.g. Photography"
            onChange={(event) => { setName(event.target.value); setError(''); }}
            onKeyDown={(event) => event.key === 'Enter' && createCategory()}
            aria-invalid={!!error}
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </div>
      </Modal>
    </div>
  );
}
