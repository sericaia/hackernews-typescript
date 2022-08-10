import { ApolloServer } from "apollo-server";
import { schema } from "./schema";

const PORT = 3000;

export const server = new ApolloServer({
    schema,
});

server.listen({port: PORT}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});