import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart as CartIcon, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  CreditCard,
  MapPin,
  Phone,
  User,
  CheckCircle
} from 'lucide-react';
import { useShopping } from '../contexts/ShoppingContext';
import { ShippingInfo, PaymentInfo } from '../types/shopping';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    shippingInfo,
    setShippingInfo
  } = useShopping();
  
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [currency, setCurrency] = useState<'naira' | 'dollar'>('naira');
  const [formData, setFormData] = useState<ShippingInfo>({
    receiverName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingInfo(formData);
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate Paystack payment
    const paymentData: PaymentInfo = {
      email: 'user@example.com',
      amount: getTotalPrice(currency) * (currency === 'naira' ? 100 : 100), // Convert to kobo/cents
      currency: currency === 'naira' ? 'NGN' : 'USD',
      reference: `ref_${Date.now()}`
    };

    try {
      // In a real implementation, you would integrate with Paystack
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStep('success');
      clearCart();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCart = () => {
    setStep('cart');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-medical-primary to-medical-secondary text-white">
                <div className="flex items-center">
                  <CartIcon className="h-5 w-5 mr-2" />
                  <h2 className="text-lg font-semibold">
                    {step === 'cart' && 'Shopping Cart'}
                    {step === 'shipping' && 'Shipping Info'}
                    {step === 'payment' && 'Payment'}
                    {step === 'success' && 'Order Complete'}
                  </h2>
                </div>
                <button
                  onClick={step === 'success' ? resetCart : onClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {step === 'cart' && (
                  <div className="p-4">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-12">
                        <CartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Currency Toggle */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">Currency:</span>
                          <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => setCurrency('naira')}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                currency === 'naira' 
                                  ? 'bg-medical-primary text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              ₦ NGN
                            </button>
                            <button
                              onClick={() => setCurrency('dollar')}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                currency === 'dollar' 
                                  ? 'bg-medical-primary text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              $ USD
                            </button>
                          </div>
                        </div>

                        {/* Cart Items */}
                        {cartItems.map((item) => (
                          <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800 text-sm">{item.name}</h3>
                                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                <div className="flex items-center mt-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.type === 'medicine' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {item.type}
                                  </span>
                                  <span className="ml-2 font-semibold text-medical-primary">
                                    {currency === 'naira' ? '₦' : '$'}{item.price[currency].toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="font-semibold text-gray-800">
                                {currency === 'naira' ? '₦' : '$'}{(item.price[currency] * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-medical-primary">
                              {currency === 'naira' ? '₦' : '$'}{getTotalPrice(currency).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 'shipping' && (
                  <div className="p-4">
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <User className="h-4 w-4 inline mr-1" />
                          Receiver Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.receiverName}
                          onChange={(e) => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Phone className="h-4 w-4 inline mr-1" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          placeholder="080XXXXXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Address
                        </label>
                        <textarea
                          required
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary h-20 resize-none"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-medical-primary to-medical-secondary text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                      >
                        Continue to Payment
                      </button>
                    </form>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="p-4">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-800 mb-2">Order Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Items ({cartItems.length}):</span>
                          <span>{currency === 'naira' ? '₦' : '$'}{getTotalPrice(currency).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery:</span>
                          <span>Free</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-semibold">
                          <span>Total:</span>
                          <span className="text-medical-primary">
                            {currency === 'naira' ? '₦' : '$'}{getTotalPrice(currency).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-800 mb-2">Delivery Address</h3>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{shippingInfo?.receiverName}</p>
                        <p>{shippingInfo?.phoneNumber}</p>
                        <p>{shippingInfo?.address}</p>
                        <p>{shippingInfo?.city}, {shippingInfo?.state}</p>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay with Paystack
                        </>
                      )}
                    </button>
                  </div>
                )}

                {step === 'success' && (
                  <div className="p-4 text-center">
                    <div className="mb-6">
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                      <p className="text-gray-600 mb-4">Thank you for your order. Your items are on the way!</p>
                      
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>Follow up:</strong> Call 09055557312 for delivery updates
                        </p>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Order will be delivered to:</p>
                        <p className="font-medium">{shippingInfo?.receiverName}</p>
                        <p>{shippingInfo?.address}</p>
                        <p>{shippingInfo?.city}, {shippingInfo?.state}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {step === 'cart' && cartItems.length > 0 && (
                <div className="border-t p-4">
                  <button
                    onClick={() => setStep('shipping')}
                    className="w-full bg-gradient-to-r from-medical-primary to-medical-secondary text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}

              {step === 'shipping' && (
                <div className="border-t p-4">
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="border-t p-4">
                  <button
                    onClick={() => setStep('shipping')}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back to Shipping
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;