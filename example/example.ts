import yargs from 'yargs';

import { AwsAppSyncBackend, AuthOptions, AUTH_TYPE, gql } from '../src';

if (!process.env.URL || !process.env.API_KEY) {
  throw new Error('You must set URL and API_KEY.');
}

const url = process.env.URL;

const auth: AuthOptions = {
  type: AUTH_TYPE.API_KEY,
  apiKey: process.env.API_KEY,
};

const awsAppSyncBackend = AwsAppSyncBackend({ url, auth });

const query = () => {
  console.log('Running query...');

  awsAppSyncBackend
    .query({
      query: gql`
        query {
          oldMessages {
            author
            dateTime
            content
          }
        }
      `,
    })
    .then(({ data }) => {
      console.log(data.oldMessages);
    })
    .catch((err) => {
      console.error('Occurred an error.');
      console.log(err);
    });
};

const mutation = ({ author, content }: { author: string; content: string }) => {
  console.log('Running mutation...');
  console.log({ author, content });

  awsAppSyncBackend
    .mutate({
      mutation: gql`
        mutation sendMessageMutation($author: String!, $content: String!) {
          sendMessage(author: $author, content: $content) {
            author
            dateTime
            content
          }
        }
      `,
      variables: { author, content },
    })
    .then(({ data }) => {
      console.log(data.sendMessage);
    })
    .catch((err) => {
      console.error('Occurred an error.');
      console.log(err);
    });
};

const subscription = () => {
  console.log('Running subscription...');

  awsAppSyncBackend
    .subscribe({
      query: gql`
        subscription {
          sentMessage {
            author
            dateTime
            content
          }
        }
      `,
    })
    .subscribe({
      next: ({ data }) => console.log(data.sentMessage),
      error: (err) => {
        console.error('Occurred an error.');
        console.log(err);
      },
      complete: () => console.log('Completed.'),
    });
};

yargs
  .command({ command: 'query', handler: query })
  .command({
    command: 'mutation',
    builder: (yargs) =>
      yargs.options({
        author: {
          alias: 'a',
          demandOption: true,
          type: 'string',
        },
        content: {
          alias: 'c',
          demandOption: true,
          type: 'string',
        },
      }),
    handler: mutation,
  })
  .command({ command: 'subscription', handler: subscription })
  .demandCommand()
  .parse();
