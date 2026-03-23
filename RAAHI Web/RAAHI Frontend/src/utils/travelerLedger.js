const CHAIN_KEY = 'raahi_traveler_chain_v1';
const PUBLIC_RECORDS_KEY = 'raahi_public_travelers_v1';

const encoder = new TextEncoder();

const getChain = () => {
  try {
    const raw = localStorage.getItem(CHAIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to read traveler ledger:', error);
    return [];
  }
};

const setChain = (chain) => {
  localStorage.setItem(CHAIN_KEY, JSON.stringify(chain));
};

const getPublicRecords = () => {
  try {
    const raw = localStorage.getItem(PUBLIC_RECORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to read traveler public records:', error);
    return {};
  }
};

const setPublicRecords = (records) => {
  localStorage.setItem(PUBLIC_RECORDS_KEY, JSON.stringify(records));
};

const toHex = (buffer) => Array.from(new Uint8Array(buffer))
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('');

const sha256 = async (value) => {
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

const buildTravelerId = () => `RAAHI-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;

const buildPublicSnapshot = (user, travelerId, issuedAt) => ({
  travelerId,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  email: user.email || '',
  phone: user.phone || '',
  age: user.age || '',
  destination: user.destination || '',
  tripDurationDays: user.tripDurationDays || '',
  bloodGroup: user.bloodGroup || '',
  medicalConditions: user.medicalConditions || '',
  aadhaarMasked: user.aadhaarNumber ? `XXXX-XXXX-${String(user.aadhaarNumber).slice(-4)}` : '',
  aadhaarVerified: Boolean(user.aadhaarVerified),
  role: user.role || 'user',
  travelPreferences: Array.isArray(user.travelPreferences) ? user.travelPreferences : [],
  profilePhoto: user.profilePhoto || null,
  issuedAt,
  updatedAt: new Date().toISOString(),
  verificationStatus: 'Verified in local traveler ledger'
});

export const issueTravelerCredential = async (user) => {
  if (!user) return null;

  const chain = getChain();
  const publicRecords = getPublicRecords();
  const travelerId = user.travelerId || buildTravelerId();
  const previousRecord = publicRecords[travelerId];
  const issuedAt = previousRecord?.issuedAt || new Date().toISOString();
  const snapshot = buildPublicSnapshot(user, travelerId, issuedAt);
  const payloadHash = await sha256(JSON.stringify(snapshot));
  const previousHash = chain.length > 0 ? chain[chain.length - 1].blockHash : 'GENESIS';
  const index = chain.length;
  const timestamp = new Date().toISOString();
  const blockHash = await sha256(`${index}:${timestamp}:${previousHash}:${payloadHash}`);

  const block = {
    index,
    travelerId,
    timestamp,
    previousHash,
    payloadHash,
    blockHash
  };

  chain.push(block);
  setChain(chain);

  publicRecords[travelerId] = {
    ...snapshot,
    payloadHash,
    blockHash,
    ledgerIndex: index,
    publicCardPath: `/traveler/${travelerId}`
  };
  setPublicRecords(publicRecords);

  return {
    ...user,
    travelerId,
    credentialHash: blockHash,
    credentialIssuedAt: issuedAt,
    publicCardPath: publicRecords[travelerId].publicCardPath
  };
};

export const getTravelerRecord = (travelerId) => {
  const records = getPublicRecords();
  return records[travelerId] || null;
};

export const getAllTravelerRecords = () => {
  const records = getPublicRecords();
  return Object.values(records).sort((left, right) => (
    new Date(right.updatedAt || right.issuedAt || 0).getTime() -
    new Date(left.updatedAt || left.issuedAt || 0).getTime()
  ));
};

export const verifyTravelerRecord = async (travelerId) => {
  const record = getTravelerRecord(travelerId);
  if (!record) {
    return { valid: false, record: null };
  }

  const chain = getChain();
  let previousHash = 'GENESIS';

  for (let index = 0; index < chain.length; index += 1) {
    const block = chain[index];
    const computedHash = await sha256(`${block.index}:${block.timestamp}:${block.previousHash}:${block.payloadHash}`);
    if (block.index !== index || block.previousHash !== previousHash || computedHash !== block.blockHash) {
      return { valid: false, record };
    }
    previousHash = block.blockHash;
  }

  const latestBlock = [...chain].reverse().find((block) => block.travelerId === travelerId);
  return {
    valid: Boolean(latestBlock && latestBlock.blockHash === record.blockHash),
    record
  };
};

export const getTravelerQrUrl = (publicUrl) => (
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}`
);
