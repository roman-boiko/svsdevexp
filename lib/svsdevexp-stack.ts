import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import  {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { Duration } from 'aws-cdk-lib';
import { DatadogLambda } from "datadog-cdk-constructs-v2";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SvsdevexpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Observability: Datadog layers and configuration applied to all Lambdas below
    const datadogLambda = new DatadogLambda(this, "DatadogLambda", {
      nodeLayerVersion: 127,
      extensionLayerVersion: 84,
      site: "datadoghq.com",
      apiKeySecretArn: "arn:aws:secretsmanager:us-east-1:770341584863:secret:rb/lambda/monitoring/key-CfqEO5",
      enableColdStartTracing: true,
      captureLambdaPayload: true
  });

    // Persistence: single DynamoDB table to store items by primary key `id`
    const table = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Shared Lambda configuration (runtime, memory, env) used by all item handlers
    const commonFnProps = {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: { 
        TABLE_NAME: table.tableName,
        DD_TRACE_REMOVE_INTEGRATION_SERVICE_NAMES_ENABLED: "true",
        DD_SERVICE: "svsdevexp",
        DD_ENV: "prod",
        DD_VERSION: "0.1.0",
       },
    };

    // Inbound: Lambda functions implementing CRUD handlers for the Items API
    const getItemLambda = new NodejsFunction(this, 'GetItemLambda', {
      entry: path.join(__dirname, '../src/items/adapters/in/lambda-handlers/get.ts'),
      ...commonFnProps,
    });

    const createItemLambda = new NodejsFunction(this, 'CreateItemLambda', {
      entry: path.join(__dirname, '../src/items/adapters/in/lambda-handlers/create.ts'),
      ...commonFnProps,
    });

    const deleteItemLambda = new NodejsFunction(this, 'DeleteItemLambda', {
      entry: path.join(__dirname, '../src/items/adapters/in/lambda-handlers/delete.ts'),
      ...commonFnProps,
    });

    const listItemsLambda = new NodejsFunction(this, 'ListItemsLambda', {
      entry: path.join(__dirname, '../src/items/adapters/in/lambda-handlers/list.ts'),
      ...commonFnProps,
    });

    const updateItemLambda = new NodejsFunction(this, 'UpdateItemLambda', {
      entry: path.join(__dirname, '../src/items/adapters/in/lambda-handlers/update.ts'),
      ...commonFnProps,
    });

    // Allow Lambdas to read Datadog API key secret (Datadog extension fetches it)
    const secretsManagerPolicyStatement = new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    });

    getItemLambda.addToRolePolicy(secretsManagerPolicyStatement);
    createItemLambda.addToRolePolicy(secretsManagerPolicyStatement);
    deleteItemLambda.addToRolePolicy(secretsManagerPolicyStatement);
    listItemsLambda.addToRolePolicy(secretsManagerPolicyStatement);
    updateItemLambda.addToRolePolicy(secretsManagerPolicyStatement);

    // Explicitly deny direct CloudWatch Logs API calls from these roles
    // (logging should be handled by the Datadog integration)
    const cloudwatchLogsPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: ['*'],
    });

    getItemLambda.addToRolePolicy(cloudwatchLogsPolicyStatement);
    createItemLambda.addToRolePolicy(cloudwatchLogsPolicyStatement);
    deleteItemLambda.addToRolePolicy(cloudwatchLogsPolicyStatement);
    listItemsLambda.addToRolePolicy(cloudwatchLogsPolicyStatement);
    updateItemLambda.addToRolePolicy(cloudwatchLogsPolicyStatement);

    // Data access: grant least-privilege (read/write) to the items table for all handlers
    table.grantReadWriteData(getItemLambda);
    table.grantReadWriteData(createItemLambda);
    table.grantReadWriteData(deleteItemLambda);
    table.grantReadWriteData(listItemsLambda);
    table.grantReadWriteData(updateItemLambda);

    // Attach Datadog wrapper to all item Lambdas
    datadogLambda.addLambdaFunctions([getItemLambda, createItemLambda, deleteItemLambda, listItemsLambda, updateItemLambda]);

    // API Gateway: REST API exposing /items and /items/{id}
    const api = new apigw.RestApi(this, 'ItemsApi', {
      restApiName: 'ItemsApi',
    });

    const itemsResource = api.root.addResource('items');
    const itemResource = itemsResource.addResource('{id}');
    // /items/{id}
    itemResource.addMethod('GET', new apigw.LambdaIntegration(getItemLambda));
    itemResource.addMethod('DELETE', new apigw.LambdaIntegration(deleteItemLambda));
    itemResource.addMethod('PUT', new apigw.LambdaIntegration(updateItemLambda));

    // /items
    itemsResource.addMethod('POST', new apigw.LambdaIntegration(createItemLambda));
    itemsResource.addMethod('GET', new apigw.LambdaIntegration(listItemsLambda));


    // Stack output: base URL of the deployed API
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });

  }
}