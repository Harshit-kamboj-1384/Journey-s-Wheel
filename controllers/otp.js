const crypto = require('crypto');

function generator(length)
{
    if (length <= 0) {
        throw new Error('Length must be a positive integer');
    }

    // Generate a random buffer
    const buffer = crypto.randomBytes(length);
    
    // Convert the buffer to a hex string and ensure it's numeric
    const otp = parseInt(buffer.toString('hex'), 16) % Math.pow(10, length);

    // Format OTP to be exactly 6 digits
    return otp.toString().padStart(length, '0');
    };
    
const otp = generator(6)
module.exports = otp;