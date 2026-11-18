export const sections = [
  { id: 'overview', label: 'Overview', detail: 'Your state at a glance' },
  { id: 'tourists', label: 'Registered tourists', detail: 'Tourists whose saved destination matches your state' },
  { id: 'destinations', label: 'Destinations', detail: 'Attractions and visitor facilities' },
  { id: 'crowd', label: 'Crowd monitoring', detail: 'Aggregated recent GPS activity' },
  { id: 'advisories', label: 'Travel advisories', detail: 'Verified notices and closures' },
  { id: 'complaints', label: 'Feedback & complaints', detail: 'Ratings, assignments and resolution' },
  { id: 'cases', label: 'Emergency coordination', detail: 'Police and medical handoffs' },
  { id: 'reports', label: 'Reports & analytics', detail: 'Trends and downloadable reports' },
  { id: 'services', label: 'Verified services', detail: 'Guides, hotels and help centres' }
];
export const statuses = {
  destinations: ['open', 'limited access', 'closed', 'archived'], advisories: ['draft', 'published', 'withdrawn', 'archived'],
  complaints: ['new', 'assigned', 'in progress', 'resolved', 'archived'], cases: ['open', 'referred', 'responding', 'resolved', 'archived'],
  services: ['pending verification', 'approved', 'suspended', 'archived']
};
export const fields = {
  destinations: [
    ['category', 'Category'], ['openingHours', 'Opening hours'], ['entryFee', 'Entry fee (INR)', 'number'],
    ['facilities', 'Facilities', 'textarea'], ['accessibility', 'Accessibility information', 'textarea'],
    ['lat', 'Latitude', 'number'], ['lng', 'Longitude', 'number'], ['dailyCapacity', 'Daily visitor capacity (if known)', 'number']
  ],
  advisories: [
    ['severity', 'Severity', ['information', 'watch', 'urgent']], ['source', 'Verified source / issuing authority'],
    ['sourceUrl', 'Source link (https://...)'], ['expiresAt', 'Expiry date', 'date'], ['verified', 'I checked the notice against the source', 'checkbox']
  ],
  complaints: [
    ['rating', 'Tourist rating (1-5, if provided)', 'number'], ['channel', 'Received via (help desk, phone, email...)'],
    ['reference', 'Complaint reference (avoid sensitive identifiers)'], ['assignee', 'Assigned staff/team'], ['resolution', 'Resolution / response', 'textarea']
  ],
  cases: [
    ['caseType', 'Assistance type', ['police', 'medical', 'travel assistance']], ['reference', 'Incident reference'],
    ['referredTo', 'Receiving police / medical unit'], ['assignee', 'Coordinating staff/team'], ['resolution', 'Case notes / resolution', 'textarea']
  ],
  services: [
    ['serviceType', 'Service type', ['guide', 'hotel', 'transport', 'help centre']], ['phone', 'Contact phone'],
    ['address', 'Service address', 'textarea'], ['website', 'Website (https://...)'], ['source', 'Verification evidence / licence reference'],
    ['verified', 'I checked the provider verification evidence', 'checkbox']
  ]
};
export function formFor(kind, record = {}) {
  const values = { title: '', description: '', city: '', district: '', status: statuses[kind][0], ...record };
  if (values.expiresAt) values.expiresAt = values.expiresAt.slice(0, 10);
  return values;
}
export function payloadFor(kind, form) {
  const result = {};
  for (const key of ['title', 'description', 'city', 'district', 'status']) result[key] = form[key] || '';
  for (const [key, , type] of fields[kind]) {
    const value = form[key];
    if (type === 'checkbox') result[key] = Boolean(value);
    else if (type === 'number') { if (value !== '' && value != null) result[key] = Number(value); }
    else if (value) result[key] = value;
  }
  return result;
}
