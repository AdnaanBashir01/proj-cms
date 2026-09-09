import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ArticleEditorPage from './pages/ArticleEditorPage';
import ArticlePreviewPage from './pages/ArticlePreviewPage';
import ArticlesPage from './pages/ArticlesPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/new" element={<ArticleEditorPage mode="create" />} />
        <Route path="articles/:id/edit" element={<ArticleEditorPage mode="edit" />} />
        <Route path="articles/:id/preview" element={<ArticlePreviewPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
