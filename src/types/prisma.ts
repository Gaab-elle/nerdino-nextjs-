import { Prisma } from '@prisma/client';

// Helper type para remover null/undefined
type NonNull<T> = {
  [K in keyof T]: Exclude<T[K], null | undefined>;
};

// Tipos seguros para Prisma com NonNullable
export type User = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.user.findUnique>>>;
export type UserWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.user.findUnique<{
  where: { id: string };
  include: {
    githubAccount: true;
    projects: true;
    posts: true;
    comments: true;
    likes: true;
    followers: true;
    following: true;
  };
}>>>>;

export type Project = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.project.findUnique>>>;
export type ProjectWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.project.findUnique<{
  where: { id: string };
  include: {
    user: true;
    tags: {
      include: {
        tag: true;
      };
    };
    likes: true;
    comments: true;
  };
}>>>>;

export type Post = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.post.findUnique>>>;
export type PostWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.post.findUnique<{
  where: { id: string };
  include: {
    user: true;
    tags: {
      include: {
        tag: true;
      };
    };
    likes: true;
    comments: {
      include: {
        user: true;
        replies: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>>>>;

export type Comment = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.comment.findUnique>>>;
export type CommentWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.comment.findUnique<{
  where: { id: string };
  include: {
    user: true;
    post: true;
    replies: {
      include: {
        user: true;
      };
    };
    likes: true;
  };
}>>>>;

export type JobOpportunity = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.jobOpportunity.findUnique>>>;
export type JobOpportunityWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.jobOpportunity.findUnique<{
  where: { id: string };
  include: {
    technologies: {
      include: {
        technology: true;
      };
    };
    applications: true;
    favorites: true;
  };
}>>>>;

export type Notification = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.notification.findUnique>>>;
export type NotificationWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.notification.findUnique<{
  where: { id: string };
  include: {
    user: true;
    post: true;
    comment: true;
  };
}>>>>;

export type Conversation = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.conversation.findUnique>>>;
export type ConversationWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.conversation.findUnique<{
  where: { id: string };
  include: {
    participants: {
      include: {
        user: true;
      };
    };
    messages: {
      include: {
        sender: true;
      };
    };
  };
}>>>>;

export type Message = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.message.findUnique>>>;
export type MessageWithRelations = NonNullable<Awaited<ReturnType<typeof import('@/lib/prisma').prisma.message.findUnique<{
  where: { id: string };
  include: {
    sender: true;
    conversation: {
      include: {
        participants: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>>>>;

// Tipos para arrays (quando findMany retorna array)
export type UserArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.user.findMany>>;
export type ProjectArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.project.findMany>>;
export type PostArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.post.findMany>>;
export type CommentArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.comment.findMany>>;
export type JobOpportunityArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.jobOpportunity.findMany>>;
export type NotificationArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.notification.findMany>>;
export type ConversationArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.conversation.findMany>>;
export type MessageArray = Awaited<ReturnType<typeof import('@/lib/prisma').prisma.message.findMany>>;

// Tipos para operações de criação
export type CreateUserData = Prisma.UserCreateInput;
export type CreateProjectData = Prisma.ProjectCreateInput;
export type CreatePostData = Prisma.PostCreateInput;
export type CreateCommentData = Prisma.CommentCreateInput;
export type CreateJobOpportunityData = Prisma.JobOpportunityCreateInput;
export type CreateNotificationData = Prisma.NotificationCreateInput;
export type CreateConversationData = Prisma.ConversationCreateInput;
export type CreateMessageData = Prisma.MessageCreateInput;

// Tipos para operações de atualização
export type UpdateUserData = Prisma.UserUpdateInput;
export type UpdateProjectData = Prisma.ProjectUpdateInput;
export type UpdatePostData = Prisma.PostUpdateInput;
export type UpdateCommentData = Prisma.CommentUpdateInput;
export type UpdateJobOpportunityData = Prisma.JobOpportunityUpdateInput;
export type UpdateNotificationData = Prisma.NotificationUpdateInput;
export type UpdateConversationData = Prisma.ConversationUpdateInput;
export type UpdateMessageData = Prisma.MessageUpdateInput;

// Tipos seguros usando NonNull helper
export type UserSafe = NonNull<User>;
export type ProjectSafe = NonNull<Project>;
export type PostSafe = NonNull<Post>;
export type CommentSafe = NonNull<Comment>;
export type JobOpportunitySafe = NonNull<JobOpportunity>;
export type NotificationSafe = NonNull<Notification>;
export type ConversationSafe = NonNull<Conversation>;
export type MessageSafe = NonNull<Message>;

// Tipos para where clauses
export type UserWhereInput = Prisma.UserWhereInput;
export type ProjectWhereInput = Prisma.ProjectWhereInput;
export type PostWhereInput = Prisma.PostWhereInput;
export type CommentWhereInput = Prisma.CommentWhereInput;
export type JobOpportunityWhereInput = Prisma.JobOpportunityWhereInput;
export type NotificationWhereInput = Prisma.NotificationWhereInput;
export type ConversationWhereInput = Prisma.ConversationWhereInput;
export type MessageWhereInput = Prisma.MessageWhereInput;
