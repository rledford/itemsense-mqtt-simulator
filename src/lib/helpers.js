function randInArray(arr = []) {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  randInArray
};
