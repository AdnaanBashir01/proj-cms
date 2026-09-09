import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { articleApi } from '../services/api';

const CmsContext = createContext(null);

function readStoredCategories() {
  try {
    const value = JSON.parse(localStorage.getItem('storyline-categories') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function CmsProvider({ children }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [customCategories, setCustomCategories] = useState(readStoredCategories);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('storyline-theme');
    if (stored === 'soft' || stored === 'snow') return 'pure';
    return ['warm', 'pure', 'cloud'].includes(stored) ? stored : 'pure';
  });
  const [uiSize, setUiSize] = useState(() => {
    const stored = localStorage.getItem('storyline-ui-size');
    return ['small', 'medium', 'large'].includes(stored) ? stored : 'medium';
  });

  const notify = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await articleApi.list();
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('storyline-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('storyline-categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    document.documentElement.dataset.size = uiSize;
    localStorage.setItem('storyline-ui-size', uiSize);
  }, [uiSize]);

  const createArticle = useCallback(async (payload) => {
    const created = await articleApi.create(payload);
    setArticles((items) => [created, ...items]);
    notify(`“${created.title}” was created`);
    return created;
  }, [notify]);

  const updateArticle = useCallback(async (id, payload) => {
    const updated = await articleApi.update(id, payload);
    setArticles((items) => items.map((item) => (item.id === id ? updated : item)));
    notify('Article changes saved');
    return updated;
  }, [notify]);

  const patchArticle = useCallback(async (id, updates) => {
    const updated = await articleApi.patch(id, updates);
    setArticles((items) => items.map((item) => (item.id === id ? updated : item)));
    notify(updated.status === 'published' ? 'Article published' : 'Article moved to drafts');
    return updated;
  }, [notify]);

  const deleteArticle = useCallback(async (id) => {
    const target = articles.find((item) => item.id === id);
    await articleApi.remove(id);
    setArticles((items) => items.filter((item) => item.id !== id));
    notify(target ? `“${target.title}” was deleted` : 'Article deleted', 'info');
  }, [articles, notify]);

  const bulkUpdateArticles = useCallback(async (ids, updates) => {
    const updatedItems = [];
    // Run sequentially because the local JSON API persists each mutation to disk.
    for (const id of ids) updatedItems.push(await articleApi.patch(id, updates));
    const updatedById = new Map(updatedItems.map((item) => [item.id, item]));
    setArticles((items) => items.map((item) => updatedById.get(item.id) || item));
    const action = updates.status === 'published' ? 'published' : 'moved to drafts';
    notify(`${ids.length} article${ids.length === 1 ? '' : 's'} ${action}`);
    return updatedItems;
  }, [notify]);

  const bulkDeleteArticles = useCallback(async (ids) => {
    for (const id of ids) await articleApi.remove(id);
    const idSet = new Set(ids);
    setArticles((items) => items.filter((item) => !idSet.has(item.id)));
    notify(`${ids.length} article${ids.length === 1 ? '' : 's'} deleted`, 'info');
  }, [notify]);

  const categories = useMemo(
    () => [...new Set([...articles.map((article) => article.category), ...customCategories].filter(Boolean))].sort(),
    [articles, customCategories],
  );

  const addCategory = useCallback((name) => {
    const normalized = name.trim();
    if (!normalized) return false;
    if (categories.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      notify('That category already exists', 'error');
      return false;
    }
    setCustomCategories((items) => [...items, normalized]);
    notify(`“${normalized}” category created`);
    return true;
  }, [categories, notify]);

  const value = useMemo(() => ({
    articles,
    loading,
    error,
    categories,
    toasts,
    theme,
    setTheme,
    uiSize,
    setUiSize,
    loadArticles,
    createArticle,
    updateArticle,
    patchArticle,
    deleteArticle,
    bulkUpdateArticles,
    bulkDeleteArticles,
    addCategory,
    notify,
    dismissToast,
  }), [articles, loading, error, categories, toasts, theme, uiSize, loadArticles, createArticle, updateArticle, patchArticle, deleteArticle, bulkUpdateArticles, bulkDeleteArticles, addCategory, notify, dismissToast]);

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) throw new Error('useCms must be used inside CmsProvider');
  return context;
}
