module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // this line help us to
    // get rid of catch block
  };
};
