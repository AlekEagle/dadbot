import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://58a414172fb8f68c35d3e19eed1f41d8@o238460.ingest.us.sentry.io/4509722245595136',
  sendDefaultPii: true,
});

console.log('Sentry Initialized!');
