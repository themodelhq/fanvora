import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import {
  Crown,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Lock,
  Image,
  Video,
  Check,
  ChevronLeft,
  Gift,
  Eye
} from 'lucide-react'

const CreatorProfile = () => {
  const { username } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const { fetchCreator, fetchCreatorPosts, purchasePost } = useDataStore()

  const [creator, setCreator] = useState(null)
  const [posts, setPosts] = useState([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [tipAmount, setTipAmount] = useState('')
  const [tipMessage, setTipMessage] = useState('')
  const [purchasedPosts, setPurchasedPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const isOwnProfile = user?.username === username

  useEffect(() => {
    loadCreator()
  }, [username])

  const loadCreator = async () => {
    setIsLoading(true)
    const creatorData = await fetchCreator(username)
    if (creatorData) {
      setCreator(creatorData)
      const postsData = await fetchCreatorPosts(creatorData.user?.id || creatorData.id)
      setPosts(postsData)
    }
    setIsLoading(false)
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    try {
      const result = await useDataStore.getState().subscribe(creator.id, {
        // PayStack payment would be initiated here
        reference: `sub_${Date.now()}`
      })
      setIsSubscribed(true)
    } catch (error) {
      alert(error.message)
    }
  }

  const handlePurchase = async (postId) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    try {
      await purchasePost(postId)
      setPurchasedPosts([...purchasedPosts, postId])
      setShowPurchaseModal(false)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleTip = async () => {
    if (!isAuthenticated || !tipAmount) return
    try {
      await useDataStore.getState().sendTip(creator.id, parseFloat(tipAmount), tipMessage)
      setShowTipModal(false)
      setTipAmount('')
      setTipMessage('')
    } catch (error) {
      alert(error.message)
    }
  }

  const canViewPost = (post) => {
    if (!post.isPpv) return true
    if (isOwnProfile) return true
    if (isSubscribed) return true
    if (purchasedPosts.includes(post.id)) return true
    return false
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold mb-2">Creator not found</h2>
          <Link to="/" className="text-primary hover:text-primary-light">Go back home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="relative">
        <div
          className="h-64 md:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${creator.banner || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20 relative">
            <img
              src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.displayName}&background=5A0F4D&color=fff&size=200`}
              alt=""
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-bg object-cover"
            />

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl font-bold">{creator.displayName}</h1>
                {creator.isVerified && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-gray-400">@{creator.username}</p>
            </div>

            <div className="flex items-center gap-3 pb-4">
              <button
                onClick={() => setShowTipModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Tip
              </button>
              <button className="btn-secondary p-3">
                <Share2 className="w-5 h-5" />
              </button>
              {!isOwnProfile && (
                <button onClick={handleSubscribe} className="btn-primary">
                  {isSubscribed ? 'Subscribed' : `Subscribe $${creator.subscriptionPrice}/mo`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="font-accent text-4xl font-bold gradient-text">
                  ${creator.subscriptionPrice}
                </div>
                <div className="text-gray-400">per month</div>
              </div>

              {!isOwnProfile && !isSubscribed && (
                <button onClick={handleSubscribe} className="btn-primary w-full mb-6">
                  Subscribe Now
                </button>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>{creator.totalSubscribers?.toLocaleString() || 0} subscribers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span>{posts.length} posts</span>
                </div>
              </div>

              <div className="border-t border-dark-border pt-6">
                <h3 className="font-semibold mb-3">About</h3>
                <p className="text-gray-400 text-sm">
                  {creator.bio || 'No bio available'}
                </p>
              </div>

              {creator.socialLinks && (
                <div className="border-t border-dark-border pt-6 mt-6">
                  <h3 className="font-semibold mb-3">Social Links</h3>
                  <div className="space-y-2">
                    {creator.socialLinks.twitter && (
                      <a href={creator.socialLinks.twitter} className="block text-primary hover:text-primary-light text-sm">
                        Twitter
                      </a>
                    )}
                    {creator.socialLinks.instagram && (
                      <a href={creator.socialLinks.instagram} className="block text-primary hover:text-primary-light text-sm">
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold">Posts</h2>
              <span className="text-gray-400">{posts.length} posts</span>
            </div>

            {posts.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Crown className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-400 text-sm">
                  {isOwnProfile ? 'Create your first post to get started' : 'Check back later for content'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="card overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.displayName}&background=5A0F4D&color=fff`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <Link to={`/creator/${username}`} className="font-semibold hover:text-primary">
                              {creator.displayName}
                            </Link>
                            <div className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {post.isPpv && (
                          <span className="badge badge-accent flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            ${post.ppvPrice}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-300 mb-4">{post.content}</p>

                      {/* Media */}
                      {post.mediaUrls?.length > 0 && (
                        canViewPost(post) ? (
                          <div className={`media-grid ${post.mediaUrls.length === 1 ? 'single' : post.mediaUrls.length >= 3 ? 'three-plus' : ''}`}>
                            {post.mediaUrls.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt=""
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        ) : (
                          <div
                            className="relative h-64 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => { setSelectedPost(post); setShowPurchaseModal(true) }}
                          >
                            <img
                              src={post.mediaUrls[0]}
                              alt=""
                              className="w-full h-full object-cover blur-lg"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-bg/80">
                              <Lock className="w-10 h-10 text-gray-400 mb-3" />
                              <p className="font-semibold mb-1">Locked Content</p>
                              <p className="text-sm text-gray-400">
                                Purchase for ${post.ppvPrice}
                              </p>
                              {isSubscribed && (
                                <p className="text-xs text-primary mt-2">
                                  As a subscriber, you can purchase this at a discount
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}

                      <div className="flex items-center gap-4 pt-4 mt-4 border-t border-dark-border">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors">
                          <Heart className="w-5 h-5" />
                          {post.likeCount || 0}
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPost && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-4">Unlock Content</h2>

            <div className="flex items-center gap-4 p-4 bg-dark-bg rounded-xl mb-6">
              <Lock className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">This content is locked</p>
                <p className="text-sm text-gray-400">
                  {isSubscribed
                    ? `As a subscriber, get 50% off: $${(selectedPost.ppvPrice * 0.5).toFixed(2)}`
                    : `Price: $${selectedPost.ppvPrice}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePurchase(selectedPost.id)}
                className="btn-primary w-full"
              >
                Purchase for ${isSubscribed ? (selectedPost.ppvPrice * 0.5).toFixed(2) : selectedPost.ppvPrice}
              </button>
              {!isSubscribed && (
                <button onClick={handleSubscribe} className="btn-secondary w-full">
                  Subscribe Instead
                </button>
              )}
              <button onClick={() => setShowPurchaseModal(false)} className="w-full py-2 text-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="modal-overlay" onClick={() => setShowTipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold mb-4">Send a Tip</h2>

            <div className="text-center mb-6">
              <img
                src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.displayName}&background=5A0F4D&color=fff`}
                alt=""
                className="w-16 h-16 rounded-full mx-auto mb-3"
              />
              <h3 className="font-semibold">{creator.displayName}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="input-field"
                  placeholder="5.00"
                  step="0.01"
                />
              </div>

              <div className="flex gap-2">
                {[5, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      tipAmount === amount ? 'bg-primary' : 'bg-dark-border hover:bg-primary/30'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message (optional)</label>
                <textarea
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  className="input-field h-20 resize-none"
                  placeholder="Leave a nice message..."
                />
              </div>

              <button onClick={handleTip} className="btn-accent w-full">
                Send Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatorProfile
