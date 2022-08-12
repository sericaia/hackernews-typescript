import { ApolloServer } from "apollo-server";
import { schema } from "./schema";
import { context } from "./context";

const PORT = process.env.PORT || 3000;

export const server = new ApolloServer({
    schema,
    context,
});

server.listen({port: PORT}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});