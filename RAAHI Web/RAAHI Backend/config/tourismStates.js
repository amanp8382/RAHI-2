const { STATES, stateFor } = require('../utils/tourism');
const legacy = { 'Uttar Pradesh': 'up', Maharashtra: 'mh', Rajasthan: 'rj', Kerala: 'kl', Goa: 'ga', 'Himachal Pradesh': 'hp', 'Tamil Nadu': 'tn', Karnataka: 'ka', 'West Bengal': 'wb', Gujarat: 'gj' };
const states = STATES.slice(0, 28).map(name => ({ name, slug: name.toLowerCase().replace(/ /g, '-'), email: legacy[name] ? `tourist.department.${legacy[name]}@gmail.com` : `tourist.department.${name.toLowerCase().replace(/ /g, '-')}@raahi.local` }));
module.exports = { states, findState: value => states.find(item => item.name === stateFor({ location: value })) };
