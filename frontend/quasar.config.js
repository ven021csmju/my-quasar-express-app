// quasar.config.js (ESM)
import 'dotenv/config';
import { configure } from 'quasar/wrappers';

export default configure(function () {
  return {
    // ...

    env: {
      API_URL: process.env.API_URL || 'http://localhost:4000',
    },

    // ...
  };
});
