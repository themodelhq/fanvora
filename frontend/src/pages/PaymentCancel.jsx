import { Link } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="font-heading text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8">
          Your payment was cancelled and no charges were made. You can try again whenever you're ready!
        </p>

        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4">What would you like to do?</h3>
          <div className="space-y-3 text-left">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-3 rounded-xl bg-dark-border hover:bg-primary/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-semibold">Go to Dashboard</div>
                <div className="text-xs text-gray-500">View your account</div>
              </div>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-border hover:bg-primary/20 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
              <div className="text-left">
                <div className="font-semibold">Try Again</div>
                <div className="text-xs text-gray-500">Return to payment</div>
              </div>
            </button>
          </div>
        </div>

        <div className="text-gray-500 text-sm">
          Need help? <a href="#" className="text-primary hover:text-primary-light">Contact Support</a>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel
