import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { listItems } from "../../../context";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const items = await listItems.execute();
        console.log(`Listing ${items.length} items`);
        return { statusCode: 200, body: JSON.stringify(items) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error instanceof Error ? error.message : "Internal server error" }) };
    }
};