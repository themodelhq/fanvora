import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import {
  Home,
  FileText,
  Users,
  DollarSign,
  MessageCircle,
  Settings,
  LogOut,
  Plus,
  Eye,
  Heart,
  TrendingUp,
  User,
  Search,
  Bell,
  ChevronDown,
  X,
  Image,
  Video,
  Lock,
  Check,
  Gift,
  Send
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { formatNaira, MIN_WITHDRAWAL_NGN } from '../lib/money'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    posts,
    subscriptions,
    conversations,
    analytics,
    earnings,
    fetchFeed,
    fetchSubscriptions,
    fetchConversations,
    fetchAnalytics,
    fetchEarnings,
    createPost
  } = useDataStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [showPostModal, setShowPostModal] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [postData, setPostData] = useState({ content: '', mediaUrls: [], isPpv: false, ppvPrice: '' })
  const [tipData, setTipData] = useState({ amount: '', message: '' })
  const [chatUser, setChatUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  const isCreator = user?.role === 'creator'

  useEffect(() => {
    if (user) {
      fetchFeed()
      fetchSubscriptions()
      fetchConversations()
      if (isCreator) {
        fetchAnalytics()
        fetchEarnings()
      }
    }
  }, [user, isCreator])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCreatePost = async () => {
    try {
      await createPost({
        content: postData.content,
        mediaUrls: postData.mediaUrls,
        isPpv: postData.isPpv,
        ppvPrice: postData.isPpv ? parseFloat(postData.ppvPrice) : 0
      })
      setShowPostModal(false)
      setPostData({ content: '', mediaUrls: [], isPpv: false, ppvPrice: '' })
      fetchFeed()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleSendTip = async () => {
    if (!selectedCreator || !tipData.amount) return
    try {
      const result = await useDataStore.getState().sendTip(
        selectedCreator.id,
        parseFloat(tipData.amount),
        tipData.message
      )
      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl
      } else {
        alert('Could not start payment — no authorization URL returned')
      }
    } catch (error) {
      alert(error.message)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatUser) return
    try {
      const msg = await useDataStore.getState().sendMessage(chatUser.id, newMessage)
      setMessages([...messages, msg])
      setNewMessage('')
    } catch (error) {
      alert(error.message)
    }
  }

  const navItems = isCreator
    ? [
        { id: 'overview', icon: Home, label: 'Overview' },
        { id: 'content', icon: FileText, label: 'Content' },
        { id: 'subscribers', icon: Users, label: 'Subscribers' },
        { id: 'earnings', icon: DollarSign, label: 'Earnings' },
        { id: 'messages', icon: MessageCircle, label: 'Messages' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ]
    : [
        { id: 'overview', icon: Home, label: 'Feed' },
        { id: 'subscriptions', icon: Users, label: 'Subscriptions' },
        { id: 'messages', icon: MessageCircle, label: 'Messages' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-card/90 backdrop-blur-lg border-b border-dark-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-heading text-xl font-bold gradient-text">Fanvora</span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-dark-border rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link to={`/creator/${user?.username}`} className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName}&background=5A0F4D&color=fff`}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden md:block text-sm font-medium">{user?.displayName}</span>
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-dark-border rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 bg-dark-card border-r border-dark-border p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-dark-border text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">
                  {isCreator ? 'Dashboard Overview' : 'Your Feed'}
                </h1>
                {!isCreator && (
                  <Link to="/" className="btn-secondary flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Discover Creators
                  </Link>
                )}
              </div>

              {/* Stats Cards (Creator) */}
              {isCreator && analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="font-accent text-3xl font-bold">{analytics.totalSubscribers || 0}</div>
                    <div className="text-gray-400 text-sm">Total Subscribers</div>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-accent" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="font-accent text-3xl font-bold">{formatNaira(analytics.totalEarnings || 0)}</div>
                    <div className="text-gray-400 text-sm">Total Earnings</div>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <div className="font-accent text-3xl font-bold">{analytics.totalViews || 0}</div>
                    <div className="text-gray-400 text-sm">Post Views</div>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-400" />
                      </div>
                    </div>
                    <div className="font-accent text-3xl font-bold">{analytics.totalLikes || 0}</div>
                    <div className="text-gray-400 text-sm">Total Likes</div>
                  </div>
                </div>
              )}

              {/* Recent Posts */}
              <div>
                <h2 className="font-heading text-xl font-semibold mb-4">
                  {isCreator ? 'Recent Posts' : 'Latest from Subscriptions'}
                </h2>
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No posts yet</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {isCreator ? 'Create your first post to get started' : 'Subscribe to creators to see their posts'}
                      </p>
                      {isCreator && (
                        <button onClick={() => setShowPostModal(true)} className="btn-primary">
                          Create Post
                        </button>
                      )}
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.creator?.avatar || `https://ui-avatars.com/api/?name=${post.creator?.displayName}&background=5A0F4D&color=fff`}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <Link to={`/creator/${post.creator?.username}`} className="font-semibold hover:text-primary">
                                {post.creator?.displayName}
                              </Link>
                              <div className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {post.isPpv && (
                            <span className="badge badge-accent flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {formatNaira(post.ppvPrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-4">{post.content}</p>
                        {post.mediaUrls?.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {post.mediaUrls.slice(0, 4).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt=""
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 pt-4 border-t border-dark-border">
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Tab (Creator) */}
          {activeTab === 'content' && isCreator && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">Content Management</h1>
                <button onClick={() => setShowPostModal(true)} className="btn-primary flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Post
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {posts.filter(p => p.creator?.id === user.id).length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No posts yet</h3>
                      <p className="text-gray-400 text-sm mb-4">Create your first post to engage with subscribers</p>
                      <button onClick={() => setShowPostModal(true)} className="btn-primary">
                        Create Post
                      </button>
                    </div>
                  ) : (
                    posts.filter(p => p.creator?.id === user.id).map((post) => (
                      <div key={post.id} className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          {post.isPpv && (
                            <span className="badge badge-accent">PPV — {formatNaira(post.ppvPrice)}</span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-4">{post.content}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" /> {post.likeCount || 0} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" /> {post.viewCount || 0} views
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Posts</span>
                        <span className="font-accent font-semibold">{posts.filter(p => p.creator?.id === user.id).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">PPV Posts</span>
                        <span className="font-accent font-semibold">{posts.filter(p => p.creator?.id === user.id && p.isPpv).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Likes</span>
                        <span className="font-accent font-semibold">{posts.filter(p => p.creator?.id === user.id).reduce((acc, p) => acc + (p.likeCount || 0), 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Content Tips</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5" />
                        Post consistently to keep subscribers engaged
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5" />
                        Use PPV for exclusive premium content
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5" />
                        Reply to comments to build community
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscribers Tab (Creator) */}
          {activeTab === 'subscribers' && isCreator && (
            <div className="space-y-6">
              <h1 className="font-heading text-2xl font-bold">Your Subscribers</h1>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-dark-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-accent text-2xl font-bold">{analytics?.totalSubscribers || 0}</div>
                      <div className="text-gray-400 text-sm">Total Subscribers</div>
                    </div>
                    <div>
                      <div className="font-accent text-2xl font-bold text-green-400">
                        {formatNaira(analytics?.monthlyRevenue || 0)}
                      </div>
                      <div className="text-gray-400 text-sm">Monthly Revenue (net)</div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-dark-border">
                  {subscriptions.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No subscribers yet</h3>
                      <p className="text-gray-400 text-sm">Share your profile to get more subscribers</p>
                    </div>
                  ) : (
                    subscriptions.map((sub) => (
                      <div key={sub.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.fan?.avatar || `https://ui-avatars.com/api/?name=${sub.fan?.displayName}&background=5A0F4D&color=fff`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold">{sub.fan?.displayName}</div>
                            <div className="text-xs text-gray-500">@{sub.fan?.username}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`badge ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {sub.status}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Since {new Date(sub.startedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Tab (Fan) */}
          {activeTab === 'subscriptions' && !isCreator && (
            <div className="space-y-6">
              <h1 className="font-heading text-2xl font-bold">My Subscriptions</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.filter(s => s.status === 'active').length === 0 ? (
                  <div className="col-span-full glass rounded-2xl p-12 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No active subscriptions</h3>
                    <p className="text-gray-400 text-sm mb-4">Subscribe to creators to see their exclusive content</p>
                    <Link to="/" className="btn-primary">Discover Creators</Link>
                  </div>
                ) : (
                  subscriptions.filter(s => s.status === 'active').map((sub) => (
                    <div key={sub.id} className="card overflow-hidden">
                      <Link to={`/creator/${sub.creator?.username}`} className="block">
                        <div className="h-24 bg-gradient-to-r from-primary to-primary-light" />
                        <div className="px-4 pb-4 -mt-10">
                          <img
                            src={sub.creator?.avatar || `https://ui-avatars.com/api/?name=${sub.creator?.displayName}&background=5A0F4D&color=fff`}
                            alt=""
                            className="w-16 h-16 rounded-full border-4 border-dark-card object-cover"
                          />
                          <h3 className="font-semibold mt-2">{sub.creator?.displayName}</h3>
                          <p className="text-sm text-gray-400">@{sub.creator?.username}</p>
                        </div>
                      </Link>
                      <div className="px-4 pb-4 flex items-center justify-between border-t border-dark-border pt-3">
                        <span className="badge bg-green-500/20 text-green-400">Active</span>
                        <button
                          onClick={() => { setSelectedCreator(sub.creator); setShowTipModal(true) }}
                          className="btn-secondary text-sm py-2"
                        >
                          <Gift className="w-4 h-4 mr-1" />
                          Tip
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Earnings Tab (Creator) */}
          {activeTab === 'earnings' && isCreator && (
            <div className="space-y-6">
              <h1 className="font-heading text-2xl font-bold">Earnings & Revenue</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-6">
                  <div className="text-gray-400 mb-2">Total Earnings (net 70%)</div>
                  <div className="font-accent text-4xl font-bold text-green-400">
                    {formatNaira(earnings?.total || 0)}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="text-gray-400 mb-2">Available Balance</div>
                  <div className="font-accent text-4xl font-bold text-accent">
                    {formatNaira(earnings?.available || 0)}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="text-gray-400 mb-2">Pending</div>
                  <div className="font-accent text-4xl font-bold text-gray-400">
                    {formatNaira(earnings?.pending || 0)}
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-dark-border">
                  <h3 className="font-semibold">Revenue Breakdown</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">Subscriptions</div>
                          <div className="text-sm text-gray-400">{earnings?.subscriptionCount || 0} subscribers</div>
                        </div>
                      </div>
                      <div className="font-accent font-semibold text-green-400">
                        {formatNaira(earnings?.fromSubscriptions || 0)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <div className="font-semibold">PPV Sales</div>
                          <div className="text-sm text-gray-400">{earnings?.ppvCount || 0} sales</div>
                        </div>
                      </div>
                      <div className="font-accent font-semibold text-green-400">
                        {formatNaira(earnings?.fromPpv || 0)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <div className="font-semibold">Tips</div>
                          <div className="text-sm text-gray-400">{earnings?.tipCount || 0} tips</div>
                        </div>
                      </div>
                      <div className="font-accent font-semibold text-green-400">
                        {formatNaira(earnings?.fromTips || 0)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-dark-border space-y-2">
                  <button
                    className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(earnings?.available || 0) < MIN_WITHDRAWAL_NGN}
                  >
                    Withdraw to Bank Account
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Revenue split: creators keep 70%, platform fee 30%. Minimum withdrawal:{' '}
                    {formatNaira(MIN_WITHDRAWAL_NGN)}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h1 className="font-heading text-2xl font-bold">Messages</h1>

              <div className="glass rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="flex h-full">
                  {/* Conversation List */}
                  <div className="w-80 border-r border-dark-border overflow-y-auto">
                    <div className="p-4 border-b border-dark-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                    <div className="divide-y divide-dark-border">
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                          <MessageCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No conversations yet</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <button
                            key={conv.user.id}
                            onClick={() => {
                              setChatUser(conv.user)
                              useDataStore.getState().fetchMessages(conv.user.id).then(setMessages)
                            }}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-dark-border transition-colors ${
                              chatUser?.id === conv.user.id ? 'bg-dark-border' : ''
                            }`}
                          >
                            <img
                              src={conv.user.avatar || `https://ui-avatars.com/api/?name=${conv.user.displayName}&background=5A0F4D&color=fff`}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{conv.user.displayName}</div>
                              <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
                            </div>
                            {conv.unread > 0 && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs">
                                {conv.unread}
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col">
                    {chatUser ? (
                      <>
                        <div className="p-4 border-b border-dark-border flex items-center gap-3">
                          <img
                            src={chatUser.avatar || `https://ui-avatars.com/api/?name=${chatUser.displayName}&background=5A0F4D&color=fff`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold">{chatUser.displayName}</div>
                            <div className="text-xs text-gray-500">@{chatUser.username}</div>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`chat-bubble ${msg.senderId === user.id ? 'sent ml-auto' : 'received'}`}
                            >
                              {msg.content}
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-dark-border flex items-center gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="input-field flex-1"
                          />
                          <button onClick={handleSendMessage} className="btn-primary p-3">
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Select a conversation</h3>
                          <p className="text-gray-400 text-sm">Choose a conversation from the list</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="font-heading text-2xl font-bold">Settings</h1>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.displayName}&background=5A0F4D&color=fff`}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <button className="btn-secondary text-sm mb-2">Change Avatar</button>
                      <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                      <input type="text" defaultValue={user?.displayName} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Username</label>
                      <input type="text" defaultValue={user?.username} className="input-field" disabled />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Bio</label>
                    <textarea
                      defaultValue={user?.bio || ''}
                      className="input-field h-24 resize-none"
                      placeholder="Tell your fans about yourself..."
                    />
                  </div>

                  {isCreator && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Subscription Price (₦/month)</label>
                        <input type="number" defaultValue={user?.subscriptionPrice || 4500} className="input-field" min="500" step="100" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Category</label>
                        <select className="input-field">
                          <option value="art">Art</option>
                          <option value="fitness">Fitness</option>
                          <option value="music">Music</option>
                          <option value="gaming">Gaming</option>
                          <option value="tech">Tech</option>
                          <option value="food">Food</option>
                          <option value="travel">Travel</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button className="btn-primary">Save Changes</button>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Payment Settings</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Manage your payment methods and payout preferences
                </p>
                <button className="btn-secondary">Configure PayStack</button>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-red-400">Danger Zone</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Once you delete your account, there is no going back.
                </p>
                <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-3 px-6 rounded-xl transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">Create Post</h2>
              <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-dark-border rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                <textarea
                  value={postData.content}
                  onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                  className="input-field h-32 resize-none"
                  placeholder="What do you want to share?"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Media URLs (one per line)</label>
                <textarea
                  value={postData.mediaUrls.join('\n')}
                  onChange={(e) => setPostData({ ...postData, mediaUrls: e.target.value.split('\n').filter(Boolean) })}
                  className="input-field h-24 resize-none"
                  placeholder="https://example.com/image1.jpg"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postData.isPpv}
                    onChange={(e) => setPostData({ ...postData, isPpv: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-dark-card text-primary"
                  />
                  <span className="text-sm">This is paid content (PPV)</span>
                </label>
              </div>

              {postData.isPpv && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price (₦)</label>
                  <input
                    type="number"
                    value={postData.ppvPrice}
                    onChange={(e) => setPostData({ ...postData, ppvPrice: e.target.value })}
                    className="input-field"
                    placeholder="2500"
                    min="100"
                    step="100"
                  />
                </div>
              )}

              <button onClick={handleCreatePost} className="btn-primary w-full">
                Publish Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && selectedCreator && (
        <div className="modal-overlay" onClick={() => setShowTipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">Send Tip</h2>
              <button onClick={() => setShowTipModal(false)} className="p-2 hover:bg-dark-border rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <img
                src={selectedCreator.avatar || `https://ui-avatars.com/api/?name=${selectedCreator.displayName}&background=5A0F4D&color=fff`}
                alt=""
                className="w-16 h-16 rounded-full mx-auto mb-3"
              />
              <h3 className="font-semibold">{selectedCreator.displayName}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (₦)</label>
                <input
                  type="number"
                  value={tipData.amount}
                  onChange={(e) => setTipData({ ...tipData, amount: e.target.value })}
                  className="input-field"
                  placeholder="1000"
                  min="100"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message (optional)</label>
                <textarea
                  value={tipData.message}
                  onChange={(e) => setTipData({ ...tipData, message: e.target.value })}
                  className="input-field h-20 resize-none"
                  placeholder="Leave a nice message..."
                />
              </div>

              <div className="flex gap-2">
                {[1000, 2500, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipData({ ...tipData, amount })}
                    className="flex-1 py-2 rounded-lg bg-dark-border hover:bg-primary/30 transition-colors"
                  >
                    {formatNaira(amount)}
                  </button>
                ))}
              </div>

              <button onClick={handleSendTip} className="btn-accent w-full">
                Send Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
