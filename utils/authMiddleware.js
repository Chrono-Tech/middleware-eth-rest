const accountModel = require('../models/accountModel');

const AUTH_HEADER = 'authorization';
const DEFAULT_AUTH_SCHEME = 'Bearer';

const auth = async (req, res, next) => {
	res.user = {};
	const authStr = req.headers[AUTH_HEADER];
	const token = getBearer(authStr);

	if(!token)
		return next();

	user = await findKey(token)

	if (user)
		res.user.address = user.address;

	next();
}

const getBearer = authStr => {
	const regex = new RegExp(`^${DEFAULT_AUTH_SCHEME}\\s+(.*)$`, 'i');
	const match = authStr.match(regex);
	return  match ? match[1] : null;
};

const findKey = token => accountModel.findOne({secret:token});

module.exports = auth;
