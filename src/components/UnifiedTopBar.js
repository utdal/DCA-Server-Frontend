
import React from 'react';
import { Link } from 'react-router-dom';
import './UnifiedTopBar.css';

const UnifiedTopBar = () => {
  return (
    <header className="unified-header">
      <div className="logo-area">
        <Link to="/" className="site-title">Coevolutionary Tools</Link>
      </div>
      <nav className="nav-links-utb">
        {/* <a href="https://morcoslaboratory.org/">Morcos Lab</a> */}
        <a href="https://morcoslaboratory.org/?page_id=38">Research</a>
        <Link to="/publications">Publications</Link>
        {/* <Link to="/lab-team">Directory</Link> */}
        <Link to="/guide-for-biologists">Guide</Link>
        <Link to="/tasks">Tasks</Link>
      </nav>
    </header>
  );
};

export default UnifiedTopBar;
