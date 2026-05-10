import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Heart, MessageCircle, Share2, Lock, ArrowLeft, MoreHorizontal } from 'lucide-react'

const PostDetail = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulated post data - in production, fetch from API
    setTimeout(() => {
      setPost({
        id,
        content: 'This is a sample post content with some interesting updates about what I have been working on lately. Thank you all for your support!',
        mediaUrls: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'
        ],
        likeCount: 234,
        commentCount: 45,
        isPpv: false,
        ppvPrice: 0,
        createdAt: new Date().toISOString(),
        creator: {
          id: '1',
          username: 'sophia_arts',
          displayName: 'Sophia Arts',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
        }
      })
      setIsLoading(false)
    }, 500)
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold mb-2">Post not found</h2>
          <Link to="/" className="text-primary hover:text-primary-light">Go back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-dark-border rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold">Post</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="card overflow-hidden">
          {/* Creator Info */}
          <div className="p-6 flex items-center justify-between">
            <Link to={`/creator/${post.creator.username}`} className="flex items-center gap-3">
              <img
                src={post.creator.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold hover:text-primary transition-colors">
                  {post.creator.displayName}
                </div>
                <div className="text-sm text-gray-500">@{post.creator.username}</div>
              </div>
            </Link>
            <button className="p-2 hover:bg-dark-border rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Media */}
          {post.mediaUrls?.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {post.mediaUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full max-h-[600px] object-contain bg-dark-bg"
                />
              ))}
            </div>
          )}

          {/* Post Content */}
          <div className="p-6">
            <p className="text-lg mb-4 whitespace-pre-wrap">{post.content}</p>

            <div className="text-sm text-gray-500 mb-4">
              {new Date(post.createdAt).toLocaleString()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 py-4 border-t border-b border-dark-border">
              <button className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors">
                <Heart className="w-6 h-6" />
                <span className="font-accent">{post.likeCount}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                <MessageCircle className="w-6 h-6" />
                <span className="font-accent">{post.commentCount}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors ml-auto">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Comments</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=5A0F4D&color=fff'}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      className="input-field resize-none"
                      placeholder="Write a comment..."
                      rows={2}
                    />
                    <button className="btn-primary mt-2">Post Comment</button>
                  </div>
                </div>

                {/* Sample Comments */}
                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">john_fan</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-gray-300 mt-1">Amazing content! Keep it up!</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop"
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">creative_soul</span>
                        <span className="text-xs text-gray-500">5 hours ago</span>
                      </div>
                      <p className="text-gray-300 mt-1">This is exactly what I was looking for!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetail
