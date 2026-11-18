import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/departmentApi';
import { sections, statuses, fields, formFor, payloadFor } from './departmentConfig';
import './TourismDepartment.css';

const formatDate = value => value ? new Date(value).toLocaleString('en-IN') : 'Not recorded';
const display = value => value == null ? 'No data' : value;
function Stat({ label, value, detail }) {
  return <article className="td-stat"><span>{label}</span><strong>{display(value)}</strong><small>{detail}</small></article>;
}
function Bars({ rows, nameKey, empty }) {
  const max = Math.max(1, ...rows.map(row => row.count));
  return rows.length ? <div className="td-bars">{rows.map(row => <div className="td-bar-row" key={row[nameKey]}>
    <span>{row[nameKey]}</span><div><i style={{ width: `${row.count / max * 100}%` }} /></div><strong>{row.count}</strong>
  </div>)}</div> : <p className="td-empty">{empty}</p>;
}
function RecordEditor({ editor, onClose, onSave, saving, error }) {
  const ref = useRef(null);
  const [form, setForm] = useState(() => formFor(editor.kind, editor.record));
  useEffect(() => { ref.current.showModal(); }, []);
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const input = ([key, label, type = 'text']) => <label key={key} className={type === 'textarea' || type === 'checkbox' ? 'td-full' : ''}>
    <span>{label}</span>
    {Array.isArray(type) ? <select value={form[key] || type[0]} onChange={e => change(key, e.target.value)}>{type.map(value => <option key={value}>{value}</option>)}</select>
      : type === 'textarea' ? <textarea maxLength={key === 'description' ? 4000 : 1200} rows="3" value={form[key] || ''} onChange={e => change(key, e.target.value)} />
        : type === 'checkbox' ? <input type="checkbox" checked={Boolean(form[key])} onChange={e => change(key, e.target.checked)} />
          : <input required={key === 'title'} type={type} step={type === 'number' ? 'any' : undefined} value={form[key] ?? ''} maxLength={key === 'title' ? 160 : 1000} onChange={e => change(key, e.target.value)} />}
  </label>;
  return <dialog className="td-editor" ref={ref} onCancel={e => { e.preventDefault(); if (!saving) onClose(); }}>
    <form onSubmit={e => { e.preventDefault(); onSave(payloadFor(editor.kind, form)); }}>
      <header><div><p className="td-eyebrow">Department record</p><h2>{editor.record ? 'Edit' : 'Add'} {editor.kind === 'cases' ? 'case' : editor.kind.slice(0, -1)}</h2></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close editor">Close</button></header>
      <div className="td-form-grid">
        {input(['title', 'Title / name'])}{input(['status', 'Status', statuses[editor.kind]])}
        {input(['city', 'City / area'])}{input(['district', 'District'])}{input(['description', 'Details (do not enter Aadhaar or medical records)', 'textarea'])}
        {fields[editor.kind].map(input)}
      </div>
      {error && <p role="alert" className="td-error">{error}</p>}
      {editor.kind === 'cases' && <p className="td-muted">Records a handoff only. Contact the receiving unit through your established emergency channel.</p>}
      <footer><button type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="td-primary" disabled={saving}>{saving ? 'Saving...' : 'Save record'}</button></footer>
    </form>
  </dialog>;
}

export default function TourismDepartment() {
  const { stateSlug } = useParams();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [tourists, setTourists] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [version, setVersion] = useState(0);
  const assignedSlug = user?.location?.trim().toLowerCase().replace(/\s+/g, '-');
  const statePage = `/tourism-department/${assignedSlug}`;
  const authorized = user?.role === 'tourist_department';
  const matchingPage = authorized && stateSlug === assignedSlug;
  const isRecords = Boolean(statuses[active]);

  useEffect(() => {
    if (!matchingPage) return undefined;
    const controller = new AbortController();
    let disposed = false;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const result = await api.overview(controller.signal);
        if (!disposed) setOverview(result.overview);
        if (active === 'tourists') {
          const list = await api.tourists({ page, q: query }, controller.signal);
          if (!disposed) { setTourists(list.tourists); setTotal(list.total); }
        }
        if (statuses[active]) {
          const list = await api.list(active, { page, q: query, ...(status ? { status } : {}) }, controller.signal);
          if (!disposed) { setRecords(list.records); setTotal(list.total); }
        }
      } catch (e) { if (!disposed && e.name !== 'AbortError') setError(e.message); }
      finally { if (!disposed) setLoading(false); }
    };
    const timer = setTimeout(load, query ? 300 : 0);
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [matchingPage, active, page, query, status, version]);
  useEffect(() => {
    if (!matchingPage) return undefined;
    const timer = setInterval(() => setVersion(value => value + 1), ['overview', 'tourists', 'crowd'].includes(active) ? 10000 : 60000);
    return () => clearInterval(timer);
  }, [matchingPage, active]);

  if (!isLoading && (!isAuthenticated || !authorized)) return <Navigate to="/login" replace />;
  if (isLoading && !user) return <main className="td-workspace"><p>Loading department workspace...</p></main>;
  if (authorized && assignedSlug && stateSlug !== assignedSlug) return <Navigate to={statePage} replace />;
  const current = sections.find(section => section.id === active);
  const choose = id => { setActive(id); setQuery(''); setStatus(''); setPage(1); setRecords([]); setTourists([]); setTotal(0); setNotice(''); setError(''); };
  const edit = record => { setEditor({ kind: active, record }); setFormError(''); };
  const save = async data => {
    setSaving(true); setFormError('');
    try { await api.save(editor.kind, data, editor.record?._id); setEditor(null); setNotice('Record saved to MongoDB.'); setVersion(value => value + 1); }
    catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };
  const download = async () => {
    setExporting(true); setError('');
    try {
      const blob = await api.report(); const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `tourism-${overview?.state || 'department'}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e.message); }
    finally { setExporting(false); }
  };
  const metrics = overview || {};
  return <main className="td-workspace">
    <aside className="td-sidebar">
      <Link to="/" className="td-brand">RAAHI<span>TOURISM OPERATIONS</span></Link>
      <div className="td-jurisdiction"><small>ASSIGNED JURISDICTION</small><strong>{overview?.state || user?.location || 'State not assigned'}</strong></div>
      <nav aria-label="Department sections">{sections.map((section, index) => <button key={section.id} className={active === section.id ? 'td-selected' : ''} onClick={() => choose(section.id)}><span>{String(index + 1).padStart(2, '0')}</span>{section.label}</button>)}</nav>
      <p>State-scoped records<br />MongoDB-backed workspace</p>
    </aside>
    <div className="td-main">
      <header className="td-topbar"><span>{user?.fullName || 'Tourism Department'}</span><div><Link to={`/tourism-information?state=${encodeURIComponent(overview?.state || user?.location || '')}`}>Public travel information</Link><button onClick={() => setVersion(value => value + 1)} disabled={loading}>Refresh data</button><button onClick={() => { void logout().catch(() => {}); }}>Sign out</button></div></header>
      <section className="td-heading"><div><p className="td-eyebrow">Tourism department / {overview?.state || 'Your state'}</p><h1>{current.label}</h1><p>{current.detail}</p></div>
        {isRecords ? <button className="td-primary" onClick={() => edit(null)}>+ Add {active === 'cases' ? 'case' : 'record'}</button> : <button className="td-primary" disabled={exporting || !overview} onClick={download}>{exporting ? 'Preparing...' : 'Export report (CSV)'}</button>}
      </section>
      {error && <p role="alert" className="td-error">{error}</p>}{notice && <p role="status" className="td-notice">{notice}</p>}
      {loading && <p role="status" className="td-muted">Loading current records...</p>}
      {overview?.truncated && <p className="td-error">Travel-plan statistics are limited to the first 10,000 matching records.</p>}
      {active === 'overview' && <>
        <div className="td-stats"><Stat label="Registered travel plans" value={metrics.registrations} detail="Matched to your jurisdiction" /><Stat label="Managed destinations" value={metrics.destinations} detail="Excludes archived destinations" /><Stat label="Published advisories" value={metrics.activeAdvisories} detail="Active and unexpired" /><Stat label="Open complaints" value={metrics.openComplaints} detail="Awaiting resolution" /></div>
        <div className="td-two"><section className="td-panel"><h2>Popular planned destinations</h2><p>Based on registered destination choices.</p><Bars rows={metrics.popularDestinations || []} nameKey="name" empty="No matching travel plans yet." /></section>
          <section className="td-panel"><h2>Registration trend</h2><p>Last six months (UTC); these are registrations, not confirmed visits.</p><Bars rows={metrics.monthlyRegistrations || []} nameKey="month" empty="No registration data yet." /></section></div>
        <div className="td-stats"><Stat label="Average trip duration" value={metrics.averageTripDays != null ? `${metrics.averageTripDays} days` : null} detail="Declared trip plans" /><Stat label="Recent GPS updates" value={metrics.recentGPS} detail="Reported within two minutes" /><Stat label="Open assistance cases" value={metrics.openCases} detail="Police, medical and travel support" /><Stat label="Approved services" value={metrics.approvedServices} detail="Department-verified providers" /></div>
      </>}
      {active === 'tourists' && <section className="td-panel">
        <div className="td-filters"><label>Search tourists<input value={query} placeholder="Name, traveler ID or destination" onChange={e => { setQuery(e.target.value); setPage(1); }} /></label><span>{total} matching tourists</span></div>
        <p className="td-muted">Fetched directly from MongoDB every 10 seconds. A saved Goa destination appears in the Goa department automatically after profile setup. No manual import is needed.</p>
        {tourists.length ? <div className="td-table-wrap"><table><thead><tr><th>Traveler</th><th>Traveler ID</th><th>Destination</th><th>Trip duration</th><th>Registered</th><th>Profile updated</th></tr></thead><tbody>
          {tourists.map(tourist => <tr key={tourist.travelerId}><td><strong>{tourist.name || 'Traveler'}</strong></td><td>{tourist.travelerId}</td><td>{tourist.destination}</td><td>{tourist.tripDurationDays ? `${tourist.tripDurationDays} days` : 'Not provided'}</td><td>{formatDate(tourist.registeredAt)}</td><td>{formatDate(tourist.updatedAt)}</td></tr>)}
        </tbody></table></div> : !loading && <p className="td-empty">No matching tourists yet. They appear here after saving a destination in your state.</p>}
        <div className="td-pagination"><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 50))}</span><button disabled={page * 50 >= total || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>
      </section>}
      {active === 'crowd' && <>
        <div className="td-stats"><Stat label="Recent shared positions" value={metrics.recentGPS} detail="Travel plans assigned to this state" /><Stat label="Reportable coarse groups" value={metrics.crowdCells?.length} detail="At least three travelers per cell" /><Stat label="Hidden small groups" value={metrics.suppressedCrowdCells} detail="Individual positions are not disclosed" /></div>
        <section className="td-panel"><h2>Recent location clusters</h2><p>Approximate 0.1-degree grid cells. Counts cover app users with recent GPS, not total footfall or a safety assessment.</p>
          {metrics.crowdCells?.length ? <div className="td-table-wrap"><table><thead><tr><th>Coarse grid origin (latitude, longitude)</th><th>Recent app positions</th></tr></thead><tbody>{metrics.crowdCells.map(row => <tr key={row.cell}><td>{row.cell}</td><td>{row.count}</td></tr>)}</tbody></table></div> : <p className="td-empty">No groups of three or more recent positions are available. Small groups are hidden.</p>}
        </section>
      </>}
      {active === 'reports' && <>
        <div className="td-stats"><Stat label="Resolved complaints" value={metrics.resolvedComplaints} detail="Recorded resolutions" /><Stat label="Average tourist rating" value={metrics.averageRating != null ? `${metrics.averageRating}/5` : null} detail="Ratings logged with feedback" /><Stat label="Average first response" value={metrics.averageResponseMinutes != null ? `${metrics.averageResponseMinutes} min` : null} detail="Created to first referral/response" /><Stat label="Average trip duration" value={metrics.averageTripDays != null ? `${metrics.averageTripDays} days` : null} detail="Declared duration" /></div>
        <div className="td-two"><section className="td-panel"><h2>Monthly registrations</h2><Bars rows={metrics.monthlyRegistrations || []} nameKey="month" empty="No data." /></section><section className="td-panel"><h2>Destination performance</h2><Bars rows={metrics.popularDestinations || []} nameKey="name" empty="No matching destination data." /></section></div>
        <section className="td-panel"><h2>Export department report</h2><p>CSV includes summary metrics, monthly registrations, destination popularity and department record statuses. No individual GPS positions or traveler identity details are exported.</p><button className="td-primary" disabled={exporting || !overview} onClick={download}>Download CSV</button></section>
      </>}
      {isRecords && <section className="td-panel">
        <div className="td-filters"><label>Search titles<input value={query} placeholder="Search records..." onChange={e => { setQuery(e.target.value); setPage(1); }} /></label><label>Status<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{statuses[active].map(value => <option key={value}>{value}</option>)}</select></label><span>{total} records</span></div>
        {active === 'advisories' && <p className="td-muted">Draft notices can be published after source verification. Expired notices are excluded from the active count. Published, source-verified notices appear on the public travel information page.</p>}
        {active === 'complaints' && <p className="td-muted">Log feedback received through help desks, calls or other channels. Assign a team and record the response; existing tourist pages are unchanged.</p>}
        {active === 'cases' && <p className="td-muted">Record referrals to police or medical units and track their status. This board does not dispatch emergency calls or messages.</p>}
        {active === 'services' && <p className="td-muted">Approval requires checked verification evidence. Keep provider details current and suspend outdated entries.</p>}
        {records.length ? <div className="td-table-wrap"><table><thead><tr><th>Record</th><th>Location</th><th>Status</th><th>Details</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{records.map(record => <tr key={record._id}>
          <td><strong>{record.title}</strong><small>{record.description}</small></td><td>{[record.city, record.district].filter(Boolean).join(', ') || 'State-wide'}</td>
          <td><span className={`td-badge ${['published', 'approved', 'resolved', 'open'].includes(record.status) ? 'td-positive' : ''}`}>{record.status}</span>{record.expiresAt && <small>Expires {formatDate(record.expiresAt)}</small>}</td>
          <td>{active === 'destinations' ? <>{record.openingHours || 'Hours not set'}<small>{record.entryFee != null ? `INR ${record.entryFee}` : 'Fee not set'}</small><small>{record.accessibility}</small></>
            : active === 'complaints' ? <>{record.rating ? `${record.rating}/5` : 'No rating'}<small>{record.assignee || 'Unassigned'}</small><small>{record.resolution}</small></>
              : active === 'cases' ? <>{record.caseType}<small>{record.referredTo || 'Not referred'}</small><small>First response: {formatDate(record.firstResponseAt)}</small></>
                : active === 'services' ? <>{record.serviceType}<small>{record.phone}</small><small>{record.verified ? 'Evidence checked' : 'Unverified'}</small></>
                  : <>{record.severity}<small>{record.source}</small><small>{record.verified ? 'Source checked' : 'Unverified'}</small></>}</td>
          <td>{formatDate(record.updatedAt)}</td><td><button onClick={() => edit(record)}>Edit / update</button></td>
        </tr>)}</tbody></table></div> : !loading && <div className="td-empty"><h3>No {active} found</h3><p>Add a record or adjust your filters. Your other sections are unaffected.</p></div>}
        <div className="td-pagination"><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 50))}</span><button disabled={page * 50 >= total || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>
      </section>}
      <p className="td-footnote">{overview?.scopeNote || 'Your account must have an assigned state. Only department-scoped records are accessible.'}</p>
    </div>
    {editor && <RecordEditor key={`${editor.kind}-${editor.record?._id || 'new'}`} editor={editor} onClose={() => setEditor(null)} onSave={save} saving={saving} error={formError} />}
  </main>;
}
