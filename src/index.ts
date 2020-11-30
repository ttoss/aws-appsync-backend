import 'cross-fetch/polyfill';
import WebSocket from 'ws';

(global as any).WebSocket = WebSocket;

import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { createAuthLink, AuthOptions, AUTH_TYPE } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

import { getRegionFromUrl } from './getRegionFromUrl';

export { AUTH_TYPE };

export type { AuthOptions };

export { default as gql } from 'graphql-tag';

export const AwsAppSyncBackend = ({
  url,
  auth,
}: {
  url: string;
  auth: AuthOptions;
}) => {
  const fetchPolicy = 'no-cache';
  const region = getRegionFromUrl(url);
  const httpLink = createHttpLink({ uri: url });
  const appSyncLink = createAuthLink({ url, region, auth });
  const appSyncSubscriptionLink = createSubscriptionHandshakeLink(
    url,
    httpLink
  );
  const link = ApolloLink.from([appSyncLink, appSyncSubscriptionLink]);
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    queryDeduplication: false,
    defaultOptions: {
      watchQuery: { fetchPolicy },
      query: { fetchPolicy },
      mutate: { fetchPolicy },
    },
  });
};
