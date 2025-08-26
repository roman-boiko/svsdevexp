import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamodbItemRepository } from "./adapters/out/DynamodbItemRepository";
import { CreateItem } from "./application/use-cases/CreateItem";
import { DeleteItem } from "./application/use-cases/DeleteItem";
import { GetItem } from "./application/use-cases/GetItem";
import { ListItems } from "./application/use-cases/ListItems";
import { UpdateItem } from "./application/use-cases/UpdateItem";

const client = new DynamoDBClient({ region: "us-east-1" });
const tableName = process.env.TABLE_NAME ?? "items";
const itemRepository = new DynamodbItemRepository(client, tableName);

const createItem = new CreateItem(itemRepository);
const deleteItem = new DeleteItem(itemRepository);
const getItem = new GetItem(itemRepository);
const listItems = new ListItems(itemRepository);
const updateItem = new UpdateItem(itemRepository);

export { createItem, deleteItem, getItem, listItems, updateItem };