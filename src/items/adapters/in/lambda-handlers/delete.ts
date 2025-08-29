import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deleteItem } from "../../../context";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    console.log(id);
    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ message: "Id is required" }) };
    }
    try {
        await deleteItem.execute(id);
        return { statusCode: 204, body: JSON.stringify({ message: "Item deleted" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error instanceof Error ? error.message : "Internal server error" }) };
    }
};