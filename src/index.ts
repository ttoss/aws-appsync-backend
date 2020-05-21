import 'cross-fetch/polyfill';
import WebSocket from 'ws';

(global as any).WebSocket = WebSocket;

import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { createAuthLink, AuthOptions, AUTH_TYPE } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

import { getRegionFromUrl } from './getRegionFromUrl';

export { AUTH_TYPE };

export type { AuthOptions };

export { default as gql } from 'graphql-tag';

const fullLog = (obj: any) => JSON.stringify(obj, null, 2);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach((graphQLError) =>
      console.error(`[GraphQL error]: \n${fullLog(graphQLError)} \n\n`)
    );
  if (networkError) console.error(`[Network error]: ${fullLog(networkError)}`);
});

export const AwsAppSyncBackend = ({
  url,
  auth,
}: {
  url: string;
  auth: AuthOptions;
}) => {
  const fetchPolicy = 'network-only';
  const region = getRegionFromUrl(url);
  const httpLink = createHttpLink({ uri: url });
  const appSyncLink = createAuthLink({ url, region, auth });
  const appSyncSubscriptionLink = createSubscriptionHandshakeLink(
    url,
    httpLink
  );
  const link = ApolloLink.from([
    errorLink,
    appSyncLink,
    appSyncSubscriptionLink,
  ]);
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
