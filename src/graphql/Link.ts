import { Prisma } from "@prisma/client";
import {
  arg,
  enumType,
  extendType,
  inputObjectType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({
            where: { id: parent.id },
          })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve(parent, args, context, info) {
        return context.prisma.link
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .voters();
      },
    });
    t.nonNull.dateTime("createdAt");
  },
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link });
    t.nonNull.int("count");
    t.id("id");
  },
});

export const FeedQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filterStr: stringArg(),
        skip: intArg(),
        take: intArg(),
        // only works for one input
        // orderBy: LinkOrderByInput,
        // Actually what we want is a list of several options (or nothing)
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },
      async resolve(parent, args, context, info) {
        let filterParams = {};
        if (args.filterStr) {
          filterParams = {
            OR: [
              {
                url: {
                  contains: args.filterStr,
                },
              },
              {
                description: {
                  contains: args.filterStr,
                },
              },
            ],
          };
        }

        const linksPromise = context.prisma.link.findMany({
          where: { ...filterParams },
          skip: args.skip ?? undefined,
          take: args.take ?? undefined,
          orderBy: args.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const countPromise = await context.prisma.link.count({
          where: {
            ...filterParams,
          },
        });

        const [links, count] = await Promise.all([linksPromise, countPromise]);

        return {
          links,
          count,
          id: "test-id",
        };
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
        const { userId } = context;

        if (!userId) {
          throw new Error("Creating link error - no user");
        }

        const link = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } },
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

        const link = await context.prisma.link.update({
          where: {
            id,
          },
          data: {
            ...changedLink,
          },
        });

        return link;
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
