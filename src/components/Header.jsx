import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const routeTitles = {
  "/": "Dashboard",
  "/articles": "Articles",
  "/categories": "Categories",
  "/users": "Team",
  "/settings": "Settings",
};

export default function Header({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const title = location.pathname.includes("/edit")
    ? "Edit article"
    : location.pathname === "/articles/new"
      ? "New article"
      : location.pathname.includes("/preview")
        ? "Article preview"
        : routeTitles[location.pathname] || "Storyline";

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (location.pathname === "/articles") {
      window.dispatchEvent(
        new CustomEvent("storyline:article-search", { detail: term }),
      );
    }
    navigate(`/articles${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <header className="topbar">
      <div className="topbar__title">
        <button
          className="icon-button topbar__menu"
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <h1>{title}</h1>
      </div>
      <form className="global-search" role="search" onSubmit={submitSearch}>
        <Search size={19} aria-hidden="true" />
        <label className="sr-only" htmlFor="global-search">
          Search all articles
        </label>
        <input
          id="global-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles, authors, or tags"
        />
      </form>
      <div className="topbar__actions">
        <div className="profile-chip">
          <span className="avatar avatar--green">AB</span>
          <div>
            <strong>Adnan Bashir</strong>
            <span>Editor</span>
          </div>
        </div>
      </div>
    </header>
  );
}
