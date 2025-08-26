import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { updateItem } from "../../../context";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ message: "Id is required" }) };
    }
    const item = JSON.parse(event.body ?? "{}");
    try {
        await updateItem.execute(id, item);
        return { statusCode: 200, body: JSON.stringify(item) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
};