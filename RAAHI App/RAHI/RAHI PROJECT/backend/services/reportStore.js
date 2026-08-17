const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const reportsFile = path.join(dataDir, 'emergency-reports.json');

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(reportsFile);
  } catch {
    await fs.writeFile(reportsFile, '[]', 'utf8');
  }
};

const readReports = async () => {
  await ensureStore();
  const raw = await fs.readFile(reportsFile, 'utf8');
  return JSON.parse(raw);
};

const writeReports = async (reports) => {
  await ensureStore();
  await fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), 'utf8');
};

const createReport = async ({ userId, type, description, location }) => {
  const reports = await readReports();
  const report = {
    id: crypto.randomUUID(),
    userId,
    type,
    description,
    location: location || null,
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'pending',
    notes: 'Report stored locally while MongoDB is unavailable'
  };
  reports.push(report);
  await writeReports(reports);
  return report;
};

const findReportById = async (reportId) => {
  const reports = await readReports();
  return reports.find((report) => report.id === reportId) || null;
};

module.exports = {
  createReport,
  findReportById
};
