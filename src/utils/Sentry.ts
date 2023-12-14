import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://81fb39c6a5904886ba26a90e2a6ea8aa@o238460.ingest.sentry.io/1407724',
  tracesSampleRate: 1.0,
});

console.log('Sentry Initialized!');
