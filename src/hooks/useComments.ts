import { useState, useEffect } from 'react';
import { Comment, CommentsResponse, CreateCommentRequest, UpdateCommentRequest, CommentsQuery } from '@/types/api';

// Hook para gerenciar comentários de um post
export function useComments(postId: string, query: CommentsQuery = {}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.parentId) params.append('parentId', query.parentId);

      const response = await fetch(`/api/posts/${postId}/comments?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data: CommentsResponse = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, query.page, query.limit, query.parentId]);

  const createComment = async (commentData: CreateCommentRequest): Promise<Comment | null> => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const newComment = await response.json();
      
      if (commentData.parent_id) {
        // Se é uma resposta, adicionar aos replies do comentário pai
        setComments(prev => prev.map(comment => {
          if (comment.id === commentData.parent_id) {
            return {
              ...comment,
              replies: [...comment.replies, newComment],
              _count: {
                ...comment._count,
                replies: comment._count.replies + 1,
              },
            };
          }
          return comment;
        }));
      } else {
        // Se é um comentário de primeiro nível, adicionar à lista
        setComments(prev => [newComment, ...prev]);
      }
      
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      return null;
    }
  };

  const updateComment = async (id: string, commentData: UpdateCommentRequest): Promise<Comment | null> => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      
      // Atualizar comentário na lista
      setComments(prev => prev.map(comment => {
        if (comment.id === id) {
          return updatedComment;
        }
        // Atualizar também nos replies
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === id ? updatedComment : reply
          ),
        };
      }));
      
      return updatedComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      return null;
    }
  };

  const deleteComment = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remover comentário da lista
      setComments(prev => prev.filter(comment => {
        if (comment.id === id) {
          return false;
        }
        // Remover também dos replies
        comment.replies = comment.replies.filter(reply => reply.id !== id);
        return true;
      }));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      return false;
    }
  };

  const likeComment = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/comments/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      const result = await response.json();
      
      // Atualizar o comentário na lista
      setComments(prev => prev.map(comment => {
        if (comment.id === id) {
          const isLiked = result.liked;
          const likeCount = comment._count.likes + (isLiked ? 1 : -1);
          
          return {
            ...comment,
            _count: {
              ...comment._count,
              likes: likeCount,
            },
          };
        }
        // Atualizar também nos replies
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === id) {
              const isLiked = result.liked;
              const likeCount = reply._count.likes + (isLiked ? 1 : -1);
              
              return {
                ...reply,
                _count: {
                  ...reply._count,
                  likes: likeCount,
                },
              };
            }
            return reply;
          }),
        };
      }));

      return result.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment');
      return false;
    }
  };

  return {
    comments,
    loading,
    error,
    pagination,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    refetch: fetchComments,
  };
}

// Hook para um comentário específico
export function useComment(id: string) {
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/comments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comment');
      }

      const data = await response.json();
      setComment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComment();
    }
  }, [id]);

  const likeComment = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/comments/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      const result = await response.json();
      
      if (comment) {
        const isLiked = result.liked;
        const likeCount = comment._count.likes + (isLiked ? 1 : -1);
        
        setComment({
          ...comment,
          _count: {
            ...comment._count,
            likes: likeCount,
          },
        });
      }

      return result.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment');
      return false;
    }
  };

  return {
    comment,
    loading,
    error,
    likeComment,
    refetch: fetchComment,
  };
}
