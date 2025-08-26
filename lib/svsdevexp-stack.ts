import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import  {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { Duration } from 'aws-cdk-lib';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SvsdevexpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    const commonFnProps = {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: { TABLE_NAME: table.tableName },
    };

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

    table.grantReadWriteData(getItemLambda);
    table.grantReadWriteData(createItemLambda);
    table.grantReadWriteData(deleteItemLambda);
    table.grantReadWriteData(listItemsLambda);
    table.grantReadWriteData(updateItemLambda);

    const api = new apigw.RestApi(this, 'ItemsApi', {
      restApiName: 'ItemsApi',
    });

    const itemsResource = api.root.addResource('items');
    itemsResource.addMethod('GET', new apigw.LambdaIntegration(getItemLambda));
    itemsResource.addMethod('POST', new apigw.LambdaIntegration(createItemLambda));
    itemsResource.addMethod('DELETE', new apigw.LambdaIntegration(deleteItemLambda));
    itemsResource.addMethod('GET', new apigw.LambdaIntegration(listItemsLambda));
    itemsResource.addMethod('PUT', new apigw.LambdaIntegration(updateItemLambda));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });

  }
}