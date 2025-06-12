/* eslint-disable no-bitwise */
import safeStringify from 'fast-safe-stringify';
import { isString } from 'lodash';
import validator from 'validator';

import { generateUUID } from './miscUtils';

export function equalsIgnoreCase(
  a: string | undefined | null,
  b: string | undefined | null,
): boolean {
  return a?.toUpperCase() === b?.toUpperCase();
}

const STRINGIFY_REPLACER = {
  bufferToHex: (key: string, value: any) => {
    if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
      return value.toString('hex');
    }
    // Handle serialized Buffer objects with {data: number[], type: "Buffer"}
    if (
      value &&
      typeof value === 'object' &&
      'type' in value &&
      'data' in value
    ) {
      const valueLikeBuffer = value as {
        type: 'Buffer';
        data: number[];
      };
      if (
        valueLikeBuffer &&
        valueLikeBuffer.type === 'Buffer' &&
        valueLikeBuffer.data &&
        Array.isArray(valueLikeBuffer.data) &&
        valueLikeBuffer.data.every((item) => typeof item === 'number')
      ) {
        return Buffer.from(valueLikeBuffer.data).toString('hex');
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  },
};

export function stableStringify(
  value: any,
  replacer?: ((key: string, value: any) => any) | null,
  space?: string | number,
  options?: { depthLimit: number | undefined; edgesLimit: number | undefined },
): string {
  return safeStringify.stableStringify(
    value,
    replacer ?? undefined,
    space,
    options,
  );
}

function randomString(
  length: number,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
) {
  let result = '';
  // eslint-disable-next-line no-plusplus
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// capitalizeWords("hello world") => "Hello World"
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (match) => match.toUpperCase());
}

export function isPrintableASCII(buffer: Buffer): boolean {
  return (
    buffer && buffer.every((element) => element >= 0x20 && element <= 0x7e)
  );
}

export function isUTF8(buf: Buffer): boolean {
  if (!buf) return false;

  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0x00) {
      // 0xxxxxxx
      // eslint-disable-next-line no-plusplus
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}
function isValidEmail(email: string): boolean {
  if (!email || !isString(email)) {
    return false;
  }
  return validator.isEmail(email);
}

export default {
  STRINGIFY_REPLACER,
  generateUUID,
  validator,
  isValidEmail,
  stableStringify,
  randomString,
  equalsIgnoreCase,
  capitalizeWords,
  isPrintableASCII,
  isUTF8,
};
