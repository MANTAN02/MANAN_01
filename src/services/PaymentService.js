import { callBackendFunction } from '../AuthContext';

class PaymentService {
  constructor() {
    this.supportedGateways = ['razorpay', 'stripe', 'upi'];
    this.defaultCurrency = 'INR';
  }

  // Initialize payment with any gateway
  async initializePayment(paymentData) {
    try {
      const response = await callBackendFunction('initializePayment', 'POST', {
        swapId: paymentData.swapId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        gateway: paymentData.gateway || 'razorpay',
        currency: paymentData.currency || this.defaultCurrency
      });

      return this.handleGatewayResponse(response, paymentData.gateway);
    } catch (error) {
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  // Handle different gateway responses
  handleGatewayResponse(response, gateway) {
    switch (gateway) {
      case 'razorpay':
        return this.handleRazorpayResponse(response);
      case 'stripe':
        return this.handleStripeResponse(response);
      case 'upi':
        return this.handleUPIResponse(response);
      default:
        return response;
    }
  }

  // Razorpay integration
  async handleRazorpayResponse(response) {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: response.amount * 100, // Razorpay expects amount in paise
      currency: response.currency,
      name: 'Swapin',
      description: 'Item Swap Payment',
      order_id: response.gatewayOrderId,
      handler: (paymentResponse) => {
        this.verifyPayment(paymentResponse, 'razorpay');
      },
      prefill: {
        name: response.userName,
        email: response.userEmail,
        contact: response.userPhone
      },
      theme: {
        color: '#3B82F6'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  // Stripe integration
  async handleStripeResponse(response) {
    const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    
    const { error } = await stripe.confirmPayment({
      elements: response.elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // UPI integration
  async handleUPIResponse(response) {
    // Generate UPI deep link
    const upiUrl = `upi://pay?pa=${response.upiId}&pn=Swapin&am=${response.amount}&cu=${response.currency}`;
    
    // Try to open UPI app
    window.location.href = upiUrl;
    
    // Fallback for web
    return {
      type: 'upi',
      url: upiUrl,
      qrCode: response.qrCode
    };
  }

  // Verify payment
  async verifyPayment(paymentResponse, gateway) {
    try {
      const response = await callBackendFunction('verifyPayment', 'POST', {
        paymentId: paymentResponse.paymentId,
        gateway: gateway,
        gatewayResponse: paymentResponse
      });

      return response;
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const response = await callBackendFunction('getPaymentStatus', 'GET', {}, `?paymentId=${paymentId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  // Process refund
  async processRefund(paymentId, amount, reason) {
    try {
      const response = await callBackendFunction('processRefund', 'POST', {
        paymentId,
        amount,
        reason
      });
      return response;
    } catch (error) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  // Get payment history
  async getPaymentHistory(userId, page = 1, limit = 10) {
    try {
      const response = await callBackendFunction('getPaymentHistory', 'GET', {}, 
        `?userId=${userId}&page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  // Calculate net amount for swap
  calculateNetAmount(itemOfferedPrice, itemRequestedPrice) {
    const netAmount = itemRequestedPrice - itemOfferedPrice;
    return {
      amount: Math.abs(netAmount),
      type: netAmount > 0 ? 'receiver_pays' : 'offerer_pays',
      currency: this.defaultCurrency
    };
  }

  // Format amount for display
  formatAmount(amount, currency = this.defaultCurrency) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Validate payment method
  validatePaymentMethod(method) {
    const validMethods = ['card', 'upi', 'netbanking', 'wallet', 'emi'];
    return validMethods.includes(method);
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
      { id: 'upi', name: 'UPI', icon: '📱' },
      { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
      { id: 'wallet', name: 'Digital Wallet', icon: '👛' },
      { id: 'emi', name: 'EMI', icon: '📅' }
    ];
  }
}

export default new PaymentService(); 