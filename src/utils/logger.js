//   src/utils/logger.js

// ----- Main -----
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

export const logger = {
  debug: (...args) => currentLevel <= LOG_LEVELS.DEBUG && console.debug('[DEBUG]', ...args),
  info: (...args) => currentLevel <= LOG_LEVELS.INFO && console.info('[INFO]', ...args),
  warn: (...args) => currentLevel <= LOG_LEVELS.WARN && console.warn('[WARN]', ...args),
  error: (...args) => currentLevel <= LOG_LEVELS.ERROR && console.error('[ERROR]', ...args),
};