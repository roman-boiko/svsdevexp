import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getItem } from "../../../context";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ message: "Id is required" }) };
    }
    try {
        const item = await getItem.execute(id);
        return { statusCode: 200, body: JSON.stringify(item) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
};