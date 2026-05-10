import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import { formatNaira } from '../lib/money'

const PaymentSuccess = () => {
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const verifyPayment = useDataStore(s => s.verifyPayment)

  // PayStack appends ?reference=… (and a duplicate ?trxref=…) on redirect.
  const reference = params.get('reference') || params.get('trxref')

  const [status, setStatus] = useState(reference ? 'verifying' : 'no-reference')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!reference || !isAuthenticated) return

    let cancelled = false
    ;(async () => {
      try {
        const data = await verifyPayment(reference)
        if (cancelled) return
        if (data.verified) {
          setResult(data)
          setStatus('success')
        } else {
          setError(data.message || `Payment status: ${data.status || 'unknown'}`)
          setStatus('failed')
        }
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        setStatus('failed')
      }
    })()

    return () => { cancelled = true }
  }, [reference, isAuthenticated, verifyPayment])

  // Resolve a friendly label for what the user just paid for.
  const productLabel = (() => {
    if (!result) return 'Payment'
    if (result.type === 'subscription') return 'Subscription'
    if (result.type === 'ppv') return 'Premium content'
    if (result.type === 'tip') return 'Tip'
    return 'Payment'
  })()

  const isVerifying = status === 'verifying'
  const isSuccess = status === 'success'
  const isFailed = status === 'failed'
  const noRef = status === 'no-reference'

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSuccess ? 'bg-green-500/20'
            : isFailed ? 'bg-red-500/20'
            : 'bg-primary/20'
        }`}>
          {isVerifying && <Loader2 className="w-12 h-12 text-primary animate-spin" />}
          {isSuccess && <CheckCircle className="w-12 h-12 text-green-400" />}
          {(isFailed || noRef) && <AlertCircle className="w-12 h-12 text-red-400" />}
        </div>

        {isVerifying && (
          <>
            <h1 className="font-heading text-3xl font-bold mb-4">Verifying payment…</h1>
            <p className="text-gray-400 mb-8">
              Hang tight — confirming your transaction with PayStack.
            </p>
          </>
        )}

        {isSuccess && (
          <>
            <h1 className="font-heading text-3xl font-bold mb-4">Payment successful</h1>
            <p className="text-gray-400 mb-8">
              {result?.alreadyFulfilled
                ? 'This payment was already confirmed. You\'re all set.'
                : `Thanks! Your ${productLabel.toLowerCase()} is now active.`}
            </p>
          </>
        )}

        {isFailed && (
          <>
            <h1 className="font-heading text-3xl font-bold mb-4">Payment couldn't be confirmed</h1>
            <p className="text-gray-400 mb-8">
              {error || 'PayStack reported an unsuccessful charge. No funds have been captured.'}
            </p>
          </>
        )}

        {noRef && (
          <>
            <h1 className="font-heading text-3xl font-bold mb-4">No payment to verify</h1>
            <p className="text-gray-400 mb-8">
              We didn't find a PayStack reference in this URL. If you just paid,
              try opening the link from your email again.
            </p>
          </>
        )}

        {(isSuccess || isFailed) && (
          <div className="glass rounded-2xl p-6 mb-8 text-left text-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Status</span>
              <span className={`badge ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isSuccess ? 'Completed' : 'Failed'}
              </span>
            </div>
            {result?.amount != null && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">Amount</span>
                <span className="font-accent">{formatNaira(result.amount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Reference</span>
              <span className="font-accent text-xs break-all">{reference}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date</span>
              <span className="font-accent">{new Date().toLocaleString('en-NG')}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/" className="btn-secondary w-full flex items-center justify-center gap-2">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
