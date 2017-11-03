const accountModel = require('../models/accountModel');
  AUTH_HEADER = 'authorization',
  DEFAULT_AUTH_SCHEME = 'Bearer',
  SECRET_FIELD = 'secret';

const auth = async (req, res, next) => {
  res.user = {};
  const authStr = req.headers[AUTH_HEADER];
  const token = authStr ? getBearer(authStr) : null;

  if(!token)
    return next();

  user = await findKey(token)

  if (user)
    res.user = fillUpUser(user)

  next();
}

const getBearer = authStr => {
  const regex = new RegExp(`^${DEFAULT_AUTH_SCHEME}\\s+(.*)$`, 'i');
  const match = authStr.match(regex);
  return  match ? match[1] : null;
};

const findKey = token => accountModel.findOne({[SECRET_FIELD]: token});

const fillUpUser = user => ({
  address: user.address
});

module.exports = auth;
