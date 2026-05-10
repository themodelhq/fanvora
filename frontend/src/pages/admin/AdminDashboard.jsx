import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, LogOut, Users, Award, Link as LinkIcon, AlertTriangle,
  FileText, Activity, Search, Check, Ban, ShieldCheck, Crown,
  Copy, ExternalLink, Loader2, Send, Inbox, MessageCircle, X
} from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { formatNaira } from '../../lib/money'

const TABS = [
  { id: 'overview',    label: 'Overview',     Icon: Activity },
  { id: 'users',       label: 'Users',        Icon: Users },
  { id: 'ambassadors', label: 'Ambassadors',  Icon: Award },
  { id: 'referrals',   label: 'Referrals',    Icon: LinkIcon },
  { id: 'disputes',    label: 'Disputes',     Icon: AlertTriangle },
  { id: 'support',     label: 'Support inbox', Icon: Inbox },
  { id: 'log',         label: 'Audit log',    Icon: FileText }
]

const AdminDashboard = () => {
  const navigate = useNavigate()
  const {
    admin, logout, stats, users, ambassadors, referrals, disputes, log, supportInbox,
    unreadSupportCount,
    fetchStats, fetchUsers, fetchAmbassadors, fetchReferrals, fetchDisputes, fetchLog,
    fetchSupportInbox, fetchUnreadSupportCount
  } = useAdminStore()

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (activeTab === 'overview') fetchStats().catch(() => {})
    if (activeTab === 'users') fetchUsers().catch(() => {})
    if (activeTab === 'ambassadors') fetchAmbassadors().catch(() => {})
    if (activeTab === 'referrals') fetchReferrals().catch(() => {})
    if (activeTab === 'disputes') fetchDisputes().catch(() => {})
    if (activeTab === 'support') fetchSupportInbox().catch(() => {})
    if (activeTab === 'log') fetchLog().catch(() => {})
  }, [activeTab])

  // Background poll every 30s for unread support replies. Runs regardless of
  // active tab so the badge stays current. Cleared on unmount (e.g. logout).
  useEffect(() => {
    fetchUnreadSupportCount()
    const id = setInterval(() => fetchUnreadSupportCount(), 30000)
    return () => clearInterval(id)
  }, [fetchUnreadSupportCount])

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <div className="font-heading font-bold leading-tight">
                Fanvora {admin?.role === 'owner' ? 'Owner' : 'Admin'}
              </div>
              <div className="text-xs text-gray-500">
                Signed in as {admin?.email} · <span className="capitalize">{admin?.role}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-dark-border"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => {
            const showSupportBadge = id === 'support' && unreadSupportCount > 0
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
                {showSupportBadge && (
                  <span
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold"
                    aria-label={`${unreadSupportCount} unread`}
                  >
                    {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview'    && <Overview stats={stats} />}
        {activeTab === 'users'       && <UsersPanel users={users} />}
        {activeTab === 'ambassadors' && <AmbassadorsPanel ambassadors={ambassadors} users={users} />}
        {activeTab === 'referrals'   && <ReferralsPanel referrals={referrals} />}
        {activeTab === 'disputes'    && <DisputesPanel disputes={disputes} />}
        {activeTab === 'support'     && <SupportInboxPanel inbox={supportInbox} />}
        {activeTab === 'log'         && <LogPanel log={log} />}
      </main>
    </div>
  )
}

// ─── Overview ──────────────────────────────────────────────────────────────

function Overview({ stats }) {
  if (!stats) return <Loading label="Loading platform stats…" />
  const { users, content, transactions, disputes } = stats

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Platform overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total users" value={users.total} />
        <Stat label="Creators" value={users.creator} />
        <Stat label="Fans" value={users.fan} />
        <Stat label="Ambassadors" value={users.ambassadors} accent />
        <Stat label="Suspended" value={users.suspended} />
        <Stat label="Posts" value={content.posts} />
        <Stat label="Subscriptions" value={transactions.subscriptions} />
        <Stat label="Open disputes" value={disputes.open} accent={disputes.open > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Gross revenue (lifetime)" value={formatNaira(transactions.grossRevenue)} large />
        <Stat label="Platform cut (30%)" value={formatNaira(transactions.platformCut)} large />
        <Stat label="Ambassador commission paid" value={formatNaira(transactions.ambassadorCommissionPaid)} large />
      </div>

      <p className="text-xs text-gray-500">
        Platform cut is gross × 30%. Ambassador commission (5% of gross by default for
        eligible referrals) is paid out of that 30%, so the platform's true net is
        (gross × 30%) − ambassador commission.
      </p>
    </div>
  )
}

// ─── Users ─────────────────────────────────────────────────────────────────

function UsersPanel({ users }) {
  const { admin, fetchUsers, suspendUser, setRole } = useAdminStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [busy, setBusy] = useState(null)
  const isOwner = admin?.role === 'owner'

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers({ search, role: roleFilter }).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [search, roleFilter])

  const handleSuspend = async (u) => {
    if (busy) return
    setBusy(u.id)
    const reason = u.isSuspended ? '' : (prompt('Reason for suspension (optional):') || '')
    try { await suspendUser(u.id, !u.isSuspended, reason) } catch {}
    setBusy(null)
  }

  const handleRole = async (u, newRole) => {
    if (busy) return
    if (!confirm(`Change ${u.username}'s role to ${newRole}?`)) return
    setBusy(u.id)
    try { await setRole(u.id, newRole) } catch {}
    setBusy(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <h2 className="font-heading text-2xl font-bold flex-1">Users</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, username, name"
              className="input-field pl-10 w-72"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All roles</option>
            <option value="fan">Fans</option>
            <option value="creator">Creators</option>
            <option value="admin">Admins</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark-bg/40">
            <tr className="text-left text-gray-400 border-b border-dark-border">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className={u.isSuspended ? 'opacity-60' : ''}>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.displayName}</div>
                  <div className="text-xs text-gray-500">@{u.username} · {u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3 space-x-1">
                  {u.isAmbassador && <span className="badge badge-accent">Ambassador</span>}
                  {u.isSuspended && <span className="badge bg-red-500/20 text-red-400">Suspended</span>}
                  {u.isDeleted && <span className="badge bg-gray-500/20 text-gray-400">Deleted</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  {/* Suspend: never on owner / system; admin only by owner; never self */}
                  {u.role !== 'owner' && u.role !== 'system' && u.id !== admin?.id && (
                    <button
                      onClick={() => handleSuspend(u)}
                      disabled={busy === u.id || (u.role === 'admin' && !isOwner)}
                      title={u.role === 'admin' && !isOwner ? 'Only the owner can suspend an admin' : ''}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-40"
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}

                  {/* Promote/demote between fan and creator (any admin) */}
                  {(u.role === 'fan' || u.role === 'creator') && (
                    <button
                      onClick={() => handleRole(u, u.role === 'creator' ? 'fan' : 'creator')}
                      disabled={busy === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-dark-border hover:bg-primary/30 disabled:opacity-40"
                    >
                      {u.role === 'creator' ? 'Demote to fan' : 'Promote to creator'}
                    </button>
                  )}

                  {/* Owner-only: grant admin to a creator, or revoke admin */}
                  {isOwner && u.role === 'creator' && (
                    <button
                      onClick={() => handleRole(u, 'admin')}
                      disabled={busy === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 disabled:opacity-40"
                    >
                      Grant admin
                    </button>
                  )}
                  {isOwner && u.role === 'admin' && u.id !== admin?.id && (
                    <button
                      onClick={() => handleRole(u, 'creator')}
                      disabled={busy === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 disabled:opacity-40"
                    >
                      Revoke admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Ambassadors ───────────────────────────────────────────────────────────

function AmbassadorsPanel({ ambassadors }) {
  const { setAmbassador, fetchUsers, fetchAmbassadors } = useAdminStore()
  const [busy, setBusy] = useState(null)

  // Lightweight inline picker for promoting any creator to ambassador
  const [promoteEmail, setPromoteEmail] = useState('')
  const [rate, setRate] = useState(5)

  const promote = async () => {
    if (!promoteEmail.trim()) return
    setBusy('promote')
    try {
      await fetchUsers({ search: promoteEmail.trim() })
      const found = useAdminStore.getState().users.find(
        u => u.email === promoteEmail.trim() || u.username === promoteEmail.trim()
      )
      if (!found) { alert('No matching user found.'); setBusy(null); return }
      if (found.role !== 'creator') { alert('Only creators can be promoted to ambassador.'); setBusy(null); return }
      await setAmbassador(found.id, true, rate / 100)
      setPromoteEmail('')
      await fetchAmbassadors()
    } catch (e) {
      alert(e.message)
    }
    setBusy(null)
  }

  const demote = async (a) => {
    if (!confirm(`Revoke ambassador status for ${a.username}? Their existing referrals stay linked but no further commission accrues.`)) return
    setBusy(a.id)
    try { await setAmbassador(a.id, false) } catch (e) { alert(e.message) }
    setBusy(null)
  }

  const updateRate = async (a) => {
    const input = prompt(`New commission rate (%) for ${a.username}:`,
      String(((a.ambassadorCommissionRate || 0.05) * 100)))
    if (input == null) return
    const pct = Number(input)
    if (Number.isNaN(pct) || pct < 0 || pct > 30) { alert('Enter a number between 0 and 30.'); return }
    setBusy(a.id)
    try { await setAmbassador(a.id, true, pct / 100) } catch (e) { alert(e.message) }
    setBusy(null)
  }

  const copyLink = (code) => {
    const url = `${window.location.origin}/register?ref=${code}`
    navigator.clipboard?.writeText(url)
  }

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl font-bold">Ambassadors</h2>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Promote a creator</h3>
        <p className="text-sm text-gray-400 mb-3">
          Enter the email or username of an existing creator. They'll get a unique referral
          code and start earning commission on every referred creator's revenue.
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="creator email or username"
            className="input-field flex-1"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Rate</label>
            <input
              type="number"
              min="0" max="30" step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="input-field w-20"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>
          <button
            onClick={promote}
            disabled={busy === 'promote'}
            className="btn-primary"
          >
            {busy === 'promote' ? 'Promoting…' : 'Promote'}
          </button>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark-bg/40">
            <tr className="text-left text-gray-400 border-b border-dark-border">
              <th className="px-4 py-3">Ambassador</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Referred</th>
              <th className="px-4 py-3 text-right">Commission</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {ambassadors.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No ambassadors yet</td></tr>
            )}
            {ambassadors.map(a => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4 text-accent" />
                    {a.displayName}
                  </div>
                  <div className="text-xs text-gray-500">@{a.username}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{a.referralCode}</td>
                <td className="px-4 py-3 text-right">
                  {((a.ambassadorCommissionRate || 0.05) * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right">{a.activeReferredCount} / {a.referredCount}</td>
                <td className="px-4 py-3 text-right text-green-400">{formatNaira(a.totalCommission)}</td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => copyLink(a.referralCode)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-dark-border hover:bg-primary/30"
                    title="Copy referral link"
                  >
                    <Copy className="w-3 h-3 inline mr-1" />Copy link
                  </button>
                  <button
                    onClick={() => updateRate(a)}
                    disabled={busy === a.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-dark-border hover:bg-primary/30 disabled:opacity-40"
                  >
                    Set rate
                  </button>
                  <button
                    onClick={() => demote(a)}
                    disabled={busy === a.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-40"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Referrals ─────────────────────────────────────────────────────────────

function ReferralsPanel({ referrals }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl font-bold">Referral payouts</h2>
      <p className="text-sm text-gray-400">
        Every commission credited to an ambassador, in reverse-chronological order.
      </p>
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark-bg/40">
            <tr className="text-left text-gray-400 border-b border-dark-border">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Ambassador</th>
              <th className="px-4 py-3">Referred creator</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 text-right">Gross</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {referrals.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No payouts yet</td></tr>
            )}
            {referrals.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleString('en-NG')}
                </td>
                <td className="px-4 py-3">@{p.ambassador?.username}</td>
                <td className="px-4 py-3">@{p.referredCreator?.username}</td>
                <td className="px-4 py-3 capitalize">{p.sourceType}</td>
                <td className="px-4 py-3 text-right">{formatNaira(p.gross)}</td>
                <td className="px-4 py-3 text-right">{(p.rate * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-green-400">{formatNaira(p.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Disputes ──────────────────────────────────────────────────────────────

function DisputesPanel({ disputes }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl font-bold">Disputes</h2>
      <div className="space-y-3">
        {disputes.length === 0 && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center text-gray-500">
            No disputes have been raised.
          </div>
        )}
        {disputes.map(d => <DisputeCard key={d.id} dispute={d} />)}
      </div>
    </div>
  )
}

function DisputeCard({ dispute: d }) {
  const { resolveDispute } = useAdminStore()
  const [resolving, setResolving] = useState(false)

  const handleResolve = async (status) => {
    const resolution = prompt(`Resolution note for dispute ${d.id.slice(0, 8)}:`) || ''
    setResolving(true)
    try { await resolveDispute(d.id, status, resolution) } catch (e) { alert(e.message) }
    setResolving(false)
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${
              d.status === 'open' ? 'bg-yellow-500/20 text-yellow-400'
              : d.status === 'resolved' ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-500/20 text-gray-400'
            }`}>{d.status}</span>
            <span className="badge badge-primary capitalize">{d.type}</span>
            <span className="text-xs text-gray-500">ref {d.id.slice(0, 8)}</span>
          </div>
          <div className="text-sm text-gray-300">
            <strong>@{d.raisedByUser?.username || '—'}</strong>
            {' raised against '}
            <strong>@{d.againstUser?.username || '—'}</strong>
          </div>
          {d.transactionRef && (
            <div className="text-xs text-gray-500 mt-1">Tx ref: {d.transactionRef}</div>
          )}
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(d.createdAt).toLocaleDateString()}
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{d.summary}</p>

      {d.resolution && (
        <div className="text-sm bg-dark-bg/40 border border-dark-border rounded-lg p-3 mb-3">
          <div className="text-xs text-gray-500 mb-1">Resolution</div>
          {d.resolution}
        </div>
      )}

      {d.status === 'open' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleResolve('resolved')}
            disabled={resolving}
            className="text-sm px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-40"
          >
            <Check className="w-3 h-3 inline mr-1" /> Mark resolved
          </button>
          <button
            onClick={() => handleResolve('rejected')}
            disabled={resolving}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-40"
          >
            <Ban className="w-3 h-3 inline mr-1" /> Reject
          </button>
        </div>
      )}

      {/* Full Fanvora-Support ↔ reporter conversation, with inline reply box.
          Stays available after resolution so the channel can keep going. */}
      <SupportThread userId={d.raisedBy} title={`Conversation with @${d.raisedByUser?.username || 'reporter'}`} />
    </div>
  )
}

// Reusable thread view + reply box. Used inside DisputeCard and from the
// Support Inbox detail modal. Re-fetches itself after every reply so the
// admin sees their message land immediately.
function SupportThread({ userId, title }) {
  const { fetchSupportThread, replyToUserAsSupport } = useAdminStore()
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sentAt, setSentAt] = useState(null)
  const [replyError, setReplyError] = useState('')

  const load = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await fetchSupportThread(userId)
      setThread(data)
    } catch {
      setThread(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [userId])

  const send = async () => {
    setReplyError('')
    const trimmed = reply.trim()
    if (trimmed.length < 2) {
      setReplyError('Type a message before sending.')
      return
    }
    setSending(true)
    try {
      await replyToUserAsSupport(userId, trimmed)
      setReply('')
      setSentAt(new Date())
      setTimeout(() => setSentAt(null), 4000)
      await load()
    } catch (e) {
      setReplyError(e.message || 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t border-dark-border pt-4 mt-1">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary-light" />
        <span className="text-xs font-semibold text-gray-300">{title || 'Conversation'}</span>
        <button
          onClick={load}
          className="ml-auto text-xs text-gray-500 hover:text-white"
          aria-label="Refresh thread"
        >
          Refresh
        </button>
      </div>

      <div className="bg-dark-bg/40 border border-dark-border rounded-lg p-3 mb-3 max-h-72 overflow-y-auto space-y-2">
        {loading && (
          <div className="text-center text-gray-500 text-xs py-4">
            <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Loading thread…
          </div>
        )}
        {!loading && (!thread?.messages || thread.messages.length === 0) && (
          <div className="text-center text-gray-500 text-xs py-4">
            No messages in this thread yet.
          </div>
        )}
        {!loading && thread?.messages?.map(m => (
          <ThreadBubble key={m.id} message={m} />
        ))}
      </div>

      <textarea
        value={reply}
        onChange={(e) => { setReply(e.target.value); setReplyError('') }}
        placeholder="Reply as Fanvora Support — message will arrive in the user's inbox."
        maxLength={4000}
        rows={3}
        disabled={sending}
        className="input-field w-full resize-none text-sm"
      />
      <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
        <div className="text-xs">
          {replyError && <span className="text-red-400">{replyError}</span>}
          {sentAt && !replyError && (
            <span className="text-green-400 inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Sent
            </span>
          )}
          {!sentAt && !replyError && (
            <span className="text-gray-500">{reply.length}/4000</span>
          )}
        </div>
        <button
          onClick={send}
          disabled={sending || reply.trim().length < 2}
          className="text-sm px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-white disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          {sending
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Send className="w-3 h-3" />}
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

function ThreadBubble({ message }) {
  const isOutbound = message.direction === 'outbound' // sent by Fanvora Support
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
        isOutbound
          ? 'bg-primary/30 text-white'
          : 'bg-dark-card border border-dark-border text-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-0.5 text-xs opacity-70">
          <span className="font-semibold">
            {isOutbound ? 'Fanvora Support' : 'User'}
          </span>
          <span>·</span>
          <span>{new Date(message.createdAt).toLocaleString('en-NG')}</span>
        </div>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  )
}

// ─── Support inbox ─────────────────────────────────────────────────────────

function SupportInboxPanel({ inbox }) {
  const [activeUserId, setActiveUserId] = useState(null)
  const active = inbox.find(t => t.userId === activeUserId)

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
        <Inbox className="w-6 h-6" />
        Support inbox
      </h2>
      <p className="text-sm text-gray-400">
        Replies users have sent to <strong>Fanvora Support</strong>, newest first. Click a
        thread to read the full conversation and reply.
      </p>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {inbox.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            No replies yet. As users message Fanvora Support, their threads will appear here.
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {inbox.map(t => (
              <button
                key={t.userId}
                onClick={() => setActiveUserId(t.userId)}
                className="w-full text-left px-4 py-4 hover:bg-dark-border/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={t.user?.avatar || `https://ui-avatars.com/api/?name=${t.user?.displayName || 'User'}&background=5A0F4D&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">@{t.user?.username || '—'}</span>
                      <span className="text-xs text-gray-500">{t.user?.displayName}</span>
                      {t.relatedDisputes?.length > 0 && (
                        <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">
                          {t.relatedDisputes.length} open dispute{t.relatedDisputes.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 truncate">{t.lastInboundContent}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(t.lastInboundAt).toLocaleString('en-NG')} ·
                      {' '}{t.inboundCount} inbound · {t.totalCount} total
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal for the selected thread */}
      {active && (
        <div
          className="modal-overlay"
          onClick={() => setActiveUserId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={active.user?.avatar || `https://ui-avatars.com/api/?name=${active.user?.displayName || 'User'}&background=5A0F4D&color=fff`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-heading text-lg font-bold truncate">
                    @{active.user?.username}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{active.user?.displayName}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveUserId(null)}
                className="p-2 hover:bg-dark-border rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {active.relatedDisputes?.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">Related disputes</div>
                <div className="flex flex-wrap gap-2">
                  {active.relatedDisputes.map(d => (
                    <span
                      key={d.id}
                      className={`text-xs px-2 py-1 rounded-md font-mono ${
                        d.status === 'open' ? 'bg-yellow-500/20 text-yellow-400'
                        : d.status === 'resolved' ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }`}
                      title={`${d.type} · ${d.status}`}
                    >
                      {d.shortId} · {d.status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <SupportThread userId={active.userId} title="Conversation" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Audit log ─────────────────────────────────────────────────────────────

function LogPanel({ log }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl font-bold">Audit log</h2>
      <p className="text-sm text-gray-400">Every state-mutating admin action, newest first.</p>
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark-bg/40">
            <tr className="text-left text-gray-400 border-b border-dark-border">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {log.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No log entries yet</td></tr>
            )}
            {log.map(e => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString('en-NG')}
                </td>
                <td className="px-4 py-3">@{e.admin?.username || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{e.target?.slice(0, 12) || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {e.details ? JSON.stringify(e.details) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Reusable bits ─────────────────────────────────────────────────────────

function Stat({ label, value, accent, large }) {
  return (
    <div className={`bg-dark-card border ${accent ? 'border-primary-light/40' : 'border-dark-border'} rounded-2xl p-5`}>
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className={`font-accent font-bold ${large ? 'text-3xl' : 'text-2xl'} ${accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  const cls = role === 'owner' ? 'bg-accent/20 text-accent'
    : role === 'admin' ? 'bg-blue-500/20 text-blue-400'
    : role === 'creator' ? 'bg-primary/20 text-primary-light'
    : role === 'system' ? 'bg-purple-500/20 text-purple-300'
    : 'bg-gray-500/20 text-gray-400'
  return <span className={`badge ${cls} capitalize`}>{role}</span>
}

function Loading({ label }) {
  return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> {label}
    </div>
  )
}

export default AdminDashboard
