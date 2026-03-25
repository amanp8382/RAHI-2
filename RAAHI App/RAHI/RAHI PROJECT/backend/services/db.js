let mongoAvailable = false;

const setMongoAvailable = (value) => {
  mongoAvailable = Boolean(value);
};

const isMongoAvailable = () => mongoAvailable;

module.exports = {
  setMongoAvailable,
  isMongoAvailable
};
