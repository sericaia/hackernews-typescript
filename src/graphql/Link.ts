import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.link.findMany();
      },
    });
  },
});

export const GetLinkByIdQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("link", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context, info) {
        const { id } = args;

        return context.prisma.link.findUnique({
          where: {
            id,
          },
        });
      },
    });
  },
});

export const AddLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("addLink", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve(parent, args, context, info) {
        const { description, url } = args;

        const link = context.prisma.link.create({
          data: {
            description,
            url,
          },
        });
        return link;
      },
    });
  },
});

export const UpdateLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      async resolve(parent, args, context, info) {
        const { id, description, url } = args;

        const changedLink = {
          id,
          description,
          url,
        };

        await context.prisma.link.update({
          where: {
            id,
          },
          data: {
            ...changedLink,
          },
        });

        return changedLink;
      },
    });
  },
});

export const DeleteLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(parent, args, context, info) {
        const { id } = args;

        const linkToDelete = await context.prisma.link.delete({
          where: {
            id,
          },
        });

        return linkToDelete;
      },
    });
  },
});
