import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { listItems } from "../../../context";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const items = await listItems.execute();
        return { statusCode: 200, body: JSON.stringify(items) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
};