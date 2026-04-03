import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, "YOUR_SECRET_KEY", {
    expiresIn: '30d', // The user stays logged in for 30 days
  });
};

export default generateToken;