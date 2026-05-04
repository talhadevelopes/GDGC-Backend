import { configDotenv } from 'dotenv';
configDotenv()
import crypto from 'crypto'

const ALGO = 'aes-256-gcm'

export const encrypt = (plainText) => {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(process.env.CRYPTO_KEY, 'hex')
    const cypher = crypto.createCipheriv(ALGO, key, iv);

    let cypherText = cypher.update(plainText, 'utf-8', 'hex');
    cypherText += cypher.final('hex');

    const tag = cypher.getAuthTag()

    return {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        cypherText
    }
}

export const decrypt = (cypherObject) => {
    const key = Buffer.from(process.env.CRYPTO_KEY, 'hex');
    const iv = Buffer.from(cypherObject.iv, 'hex');
    const tag = Buffer.from(cypherObject.tag, 'hex');

    const decypher = crypto.createDecipheriv(
        ALGO, 
        key, 
        iv
    );

    decypher.setAuthTag(tag);

    let decypherText = decypher.update(
        cypherObject.cypherText, 'hex', 'utf-8'
    );
    decypherText += decypher.final('utf-8');

    return decypherText;
}