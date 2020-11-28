# AWS AppSync Backend

[AWS AppSync](https://aws.amazon.com/appsync/) client for a NodeJS App. This package is a wrap of [this tutorial](https://docs.aws.amazon.com/appsync/latest/devguide/building-a-client-app-node.html).

This client is a [Apollo JavaScript client](https://github.com/apollographql/apollo-client) plus the authentication method that we need to access AWS AppSync URL (more details about authentication method can be found on the [AWS AppSync JavaScript SDK docs](https://github.com/awslabs/aws-mobile-appsync-sdk-js#using-authorization-and-subscription-links-with-apollo-client-no-offline-support)). Also, this backend client adds fetch polyfills and WebSocket to perform subscriptions.

---

## Installation

#### npm

```shell
npm install --save @ttoss/aws-appsync-backend
```

#### yarn

```shell
yarn add @ttoss/aws-appsync-backend
```

---

## Getting Started

**You must have AWS CLI installed and have the permissions to create AWS AppSync resources.**

_\*note: in this section, we'll use `AWSAppSyncBackendCoolChat` as the stack name, but you may choose any name you want._

### Deploy AWS AppSync API

We've provided a [simple chat example](example/cloudformation.yml) using a CloudFormation template which creates an AWS AppSync API with few GraphQL operations.

To deploy the API, run this command:

```shell
$ aws cloudformation deploy --stack-name AWSAppSyncBackendCoolChat --template-file ./path_to_template/cloudformation.yml
```

Also, you may clone this project and run the command:

```shell
$ npm run example:deploy
```

#### Get the URL and API key

After deployed, you can get the URL and API key accessing the AWS AppSync or the CloudFormation console and check the stack outputs.

Also, you can get them running the command:

```shell
$ aws cloudformation describe-stacks --stack-name AWSAppSyncBackendCoolChat --query 'Stacks[0].Outputs'
```

Which will return something like this:

```yml
- OutputKey: ApiKey
  OutputValue: da2-rvbbc6xzkXXXXXXX
- OutputKey: Url
  OutputValue: https://vnkglexXXXXX.appsync-api.us-east-1.amazonaws.com/graphql
```

### GraphQL operations

#### Create the client

```ts
import { AwsAppSyncBackend, AuthOptions, AUTH_TYPE, gql } from '@ttoss/aws-appsync-backend';

const url = ... // your URL here

const auth: AuthOptions = {
  type: AUTH_TYPE.API_KEY,
  apiKey: ... // your API key here
};

const awsAppSyncBackend = AwsAppSyncBackend({ url, auth });
```

#### Query

```ts
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
```

#### Mutation

```ts
const author = 'Pedro';
const content = 'Hello again!';

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
```

#### Subscription

```ts
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
```

#### Using the provided example

If you want to use the [example](example/example.ts) we've created, you just need to run these commands:

```shell
$ npm run example:query
$ npm run example:mutation -- --author Pedro --content "Hi"
$ npm run example:subscription
```

### Destroy AWS AppSync API

Finally, you may want to destroy the stack created running the command:

```shell
$ aws cloudformation destroy --stack-name AWSAppSyncBackendCoolChat
```

If you're using our example:

```shell
$ npm run destroy
```

## Author

- [Pedro Arantes](https://twitter.com/arantespp)

---

## License

[MIT](LICENSE)
