import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createItem } from "../../../context";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const item = JSON.parse(event.body ?? "{}");
    console.log(`Creating item: ${item}`);
    try {
        await createItem.execute(item);
        return { statusCode: 201, body: JSON.stringify(item) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error instanceof Error ? error.message : "Internal server error" }) };
    }
};