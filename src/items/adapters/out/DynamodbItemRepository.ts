import { ItemRepository } from "../../application/ports/ItemRepository";
import { Item } from "../../domain/Item";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export class DynamodbItemRepository implements ItemRepository {
    private readonly doc: DynamoDBDocumentClient;
    constructor(client: DynamoDBClient, private readonly tableName: string) {
      this.doc = DynamoDBDocumentClient.from(client);
    }
  
    async findById(id: string): Promise<Item | null> {
        const cmd = new GetCommand({
            TableName: this.tableName,
            Key: { id },
        });
        const res = await this.doc.send(cmd);
        return res.Item ? new Item(res.Item.id, res.Item.name, res.Item.price) : null;
    }

    async list(): Promise<Item[]> {
        const cmd = new ScanCommand({
            TableName: this.tableName,
        });
        const res = await this.doc.send(cmd);
        return res.Items?.map((i) => new Item(i.id, i.name, i.price)) ?? [];
    }

    async save(item: Item): Promise<void> {
        const cmd = new PutCommand({
            TableName: this.tableName,
            Item: item,
        });
        await this.doc.send(cmd);
    }

    async update(id: string, item: Item): Promise<void> {
        const cmd = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },
            UpdateExpression: "set #name = :name, price = :price",
            ExpressionAttributeNames: {
                "#name": "name",
            },
            ExpressionAttributeValues: {
                ":name": item.name,
                ":price": item.price,
            },
        });
        await this.doc.send(cmd);
    }

    async delete(id: string): Promise<void> {
        const cmd = new DeleteCommand({
            TableName: this.tableName,
            Key: { id },
        });

        await this.doc.send(cmd);
    }
}