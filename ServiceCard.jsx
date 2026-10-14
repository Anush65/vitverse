import React from 'react';

export default function ServiceCard({ icon, title, description, meta, actionLabel = 'Open service', onClick, featured = false }) {
  return (
    <article className={`vp-service-card ${featured ? 'vp-service-card--featured' : ''}`}>
      <div className="vp-service-icon" aria-hidden="true">{icon}</div>
      <div className="vp-service-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {meta && <small>{meta}</small>}
      </div>
      <button type="button" className="vp-button vp-button--secondary" onClick={onClick}>{actionLabel}</button>
    </article>
  );
}
