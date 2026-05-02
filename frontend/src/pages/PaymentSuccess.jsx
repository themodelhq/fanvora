import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>

        <h1 className="font-heading text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">
          Your payment has been processed successfully. You now have access to all the exclusive content!
        </p>

        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Status</span>
            <span className="badge bg-green-500/20 text-green-400">Completed</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Transaction ID</span>
            <span className="font-accent text-sm">TXN_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Date</span>
            <span className="font-accent text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

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
