import apiService from '../services/api';
let records = [];
export const refreshTravelerRecords = async () => {
  const response = await apiService.travelers.list();
  records = response.travelers;
  return records;
};
export const getAllTravelerRecords = () => records;
export const getTravelerRecord = async id => (await apiService.travelers.get(id)).record;
export const verifyTravelerRecord = async id => {
  try { return { valid: true, record: await getTravelerRecord(id) }; }
  catch { return { valid: false, record: null }; }
};
export const getTravelerQrUrl = url => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

export const clearTravelerCache = () => { records = []; };
