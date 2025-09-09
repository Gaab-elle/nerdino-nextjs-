// Types for Community API

export interface Post {
  id: string;
  content: string;
  type: 'text' | 'project' | 'image' | 'link' | 'question';
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_image?: string;
  is_public: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
    bio?: string;
  };
  tags: Array<{
    id: string;
    post_id: string;
    tag_id: string;
    tag: {
      id: string;
      name: string;
      color?: string;
      description?: string;
    };
  }>;
  likes: Array<{
    id: string;
    user_id: string;
    user?: {
      id: string;
      name: string;
      username: string;
      avatar_url?: string;
      image?: string;
    };
  }>;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar_url?: string;
      image?: string;
    };
    likes: Array<{
      id: string;
      user_id: string;
    }>;
    _count: {
      likes: number;
      replies: number;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id?: string;
  project_id?: string;
  parent_id?: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
  };
  post?: {
    id: string;
    content: string;
    type: string;
  };
  parent?: {
    id: string;
    content: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar_url?: string;
      image?: string;
    };
  };
  likes: Array<{
    id: string;
    user_id: string;
    user?: {
      id: string;
      name: string;
      username: string;
      avatar_url?: string;
      image?: string;
    };
  }>;
  replies: Array<Comment>;
  _count: {
    likes: number;
    replies: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  created_at: string;
  posts: Array<{
    id: string;
    post_id: string;
    tag_id: string;
  }>;
  _count: {
    posts: number;
  };
}

export interface Like {
  id: string;
  created_at: string;
  user_id: string;
  post_id?: string;
  project_id?: string;
  comment_id?: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface TagsResponse {
  tags: Tag[];
}

export interface FeedResponse {
  posts: Post[];
  pagination: Pagination;
  type: 'following' | 'trending' | 'recommended';
}

export interface LikeResponse {
  message: string;
  liked: boolean;
}

export interface LikeStatusResponse {
  liked: boolean;
  likeId: string | null;
}

// Request types
export interface CreatePostRequest {
  content: string;
  type?: 'text' | 'project' | 'image' | 'link' | 'question';
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_image?: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  content: string;
  type?: 'text' | 'project' | 'image' | 'link' | 'question';
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_image?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagRequest {
  name: string;
  color?: string;
  description?: string;
}

// Query parameters
export interface PostsQuery {
  page?: number;
  limit?: number;
  type?: 'text' | 'project' | 'image' | 'link' | 'question';
  tag?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
  search?: string;
}

export interface CommentsQuery {
  page?: number;
  limit?: number;
  parentId?: string;
}

export interface TagsQuery {
  search?: string;
  limit?: number;
}

export interface FeedQuery {
  page?: number;
  limit?: number;
  type?: 'following' | 'trending' | 'recommended';
}
