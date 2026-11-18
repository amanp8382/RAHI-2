import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/departmentApi';
import './TourismDepartment.css';
export default function TourismPublicInfo() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('state') || '';
  const [state, setState] = useState(selected);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!selected) return undefined;
    const controller = new AbortController();
    setLoading(true); setError(''); setData(null);
    api.publicInfo(selected, controller.signal).then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selected]);
  return <main className="td-workspace"><div className="td-main">
    <header className="td-topbar"><Link to="/">RAAHI Home</Link><span>Department-published travel information</span></header>
    <section className="td-heading"><div><p className="td-eyebrow">Travel with current information</p><h1>{data?.state || 'State travel information'}</h1><p>Published advisories, destination details and department-approved services.</p></div></section>
    <form className="td-filters" onSubmit={e => { e.preventDefault(); setParams({ state: state.trim() }); }}><label>State / union territory<input required value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Uttar Pradesh" /></label><button className="td-primary">View information</button></form>
    {loading && <p role="status">Loading published information...</p>}{error && <p role="alert" className="td-error">{error}</p>}
    {data && <>
      <section className="td-panel"><h2>Current travel advisories</h2>{data.advisories.length ? data.advisories.map(row => <article className="td-public-record" key={row._id}><span className="td-badge">{row.severity}</span><h3>{row.title}</h3><p>{row.description}</p><p>{[row.city, row.district].filter(Boolean).join(', ') || 'State-wide'} / Source: {row.source}</p>{row.sourceUrl && <a href={row.sourceUrl} rel="noreferrer" target="_blank">View official source</a>}<small>Published: {row.publishedAt ? new Date(row.publishedAt).toLocaleString('en-IN') : 'Not recorded'}</small></article>) : <p className="td-empty">No current published advisories. This does not mean all travel conditions are safe.</p>}</section>
      <section className="td-panel"><h2>Destinations and facilities</h2>{data.destinations.length ? data.destinations.map(row => <article className="td-public-record" key={row._id}><span className="td-badge">{row.status}</span><h3>{row.title}</h3><p>{row.description}</p><p>{row.openingHours || 'Contact the destination for opening hours'} / {row.entryFee != null ? `Entry: INR ${row.entryFee}` : 'Fee not provided'}</p><p>Facilities: {row.facilities || 'Not provided'}</p><p>Accessibility: {row.accessibility || 'Not provided'}</p></article>) : <p className="td-empty">No destination records published yet.</p>}</section>
      <section className="td-panel"><h2>Verified services directory</h2>{data.services.length ? data.services.map(row => <article className="td-public-record" key={row._id}><span className="td-badge td-positive">{row.serviceType} / department approved</span><h3>{row.title}</h3><p>{row.description}</p><p>{row.address || [row.city, row.district].filter(Boolean).join(', ')}</p>{row.phone && <p>Contact: {row.phone}</p>}{row.website && <a href={row.website} rel="noreferrer" target="_blank">Provider website</a>}</article>) : <p className="td-empty">No approved providers published yet.</p>}</section>
      <p className="td-footnote">Up to {data.limitPerSection} records per section. Check directly with providers before booking.</p>
    </>}
  </div></main>;
}
