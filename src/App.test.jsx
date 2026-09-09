// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { CmsProvider } from './context/CmsContext';

const article = {
  id: 'smoke-1',
  title: 'A smoke-tested story',
  body: 'This article has enough representative content for the application smoke test.',
  author: 'Maya Chen',
  category: 'Design',
  tags: ['testing'],
  status: 'published',
  featuredImage: '/images/editorial-1.svg',
  createdAt: '2026-08-15T10:00:00.000Z',
  updatedAt: '2026-08-16T10:00:00.000Z',
};

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CmsProvider><App /></CmsProvider>
    </MemoryRouter>,
  );
}

describe('Storyline CMS smoke test', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [article],
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('loads and renders the dashboard from the API', async () => {
    renderApp('/');
    expect((await screen.findAllByText('A smoke-tested story')).length).toBeGreaterThan(0);
    expect(screen.getByText('Total articles')).toBeTruthy();
    expect(screen.getByText('Storyline CMS')).toBeTruthy();
    expect(screen.queryByText('Storyline Pro')).toBeNull();
  });

  it('renders the article library route', async () => {
    renderApp('/articles');
    expect(await screen.findByText('A smoke-tested story')).toBeTruthy();
    expect(screen.getByText('Every story, in one place')).toBeTruthy();
  });

  it('selects table rows and reveals bulk workflow actions', async () => {
    renderApp('/articles');
    await screen.findByText('A smoke-tested story');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select A smoke-tested story' }));
    expect(screen.getByText('selected')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Move to drafts' })).toBeTruthy();
  });

  it.each([
    ['/categories', 'Shape your publication'],
    ['/users', 'Your editorial team'],
    ['/settings', 'Publication details'],
    ['/articles/new', 'Tell a story worth sharing'],
    ['/articles/smoke-1/edit', 'A smoke-tested story'],
    ['/articles/smoke-1/preview', 'Previewing'],
  ])('renders %s without a runtime error', async (path, visibleText) => {
    renderApp(path);
    expect((await screen.findAllByText(visibleText)).length).toBeGreaterThan(0);
  });

  it('applies appearance choices and persists publication settings', async () => {
    renderApp('/settings');
    await screen.findByText('Publication details');
    fireEvent.click(screen.getByRole('button', { name: /Ivory/i }));
    fireEvent.click(screen.getByRole('button', { name: /Large/i }));
    expect(document.documentElement.dataset.theme).toBe('warm');
    expect(document.documentElement.dataset.size).toBe('large');
    fireEvent.change(screen.getByLabelText('Publication name'), { target: { value: 'Field Notes' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('storyline-workspace-settings')).publicationName).toBe('Field Notes'));
  });

  it('undoes and redoes content changes in the article editor', async () => {
    renderApp('/articles/new');
    const editor = await screen.findByLabelText('Article content');
    fireEvent.change(editor, { target: { value: 'First version' } });
    fireEvent.change(editor, { target: { value: 'Second version' } });
    fireEvent.click(screen.getByRole('button', { name: 'Undo content change' }));
    expect(editor.value).toBe('First version');
    fireEvent.click(screen.getByRole('button', { name: 'Redo content change' }));
    expect(editor.value).toBe('Second version');
  });

  it('changes a team member role and persists the team', async () => {
    renderApp('/users');
    await screen.findByText('Your editorial team');
    fireEvent.click(screen.getByRole('button', { name: 'Manage Jon Bell' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Administrator' }));
    expect(screen.getAllByText('Administrator').length).toBeGreaterThan(0);
    await waitFor(() => expect(JSON.parse(localStorage.getItem('storyline-team-members')).find((member) => member.email === 'jon@storyline.studio').role).toBe('Administrator'));
  });
});
