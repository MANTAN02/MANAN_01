import React from 'react';
import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaShieldAlt, FaTruck, FaUsers, FaHeart, FaStar } from 'react-icons/fa';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-secondary-200">Swapin</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            India's Premier Consumer-to-Consumer Barter & Swap Platform
          </p>
          <p className="text-lg text-primary-200 mt-4 max-w-2xl mx-auto">
            Connecting people through sustainable exchanges, one item at a time
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              To revolutionize the way people exchange goods by creating a secure, 
              efficient, and sustainable platform that promotes circular economy 
              while building meaningful connections between consumers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-primary-50">
              <FaExchangeAlt className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Exchanges</h3>
              <p className="text-gray-600">
                Intelligent matching system that calculates fair value exchanges 
                and handles price differences automatically.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-secondary-50">
              <FaShieldAlt className="text-4xl text-secondary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Built with enterprise-grade security, protecting your data and 
                ensuring safe transactions every time.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary-50">
              <FaTruck className="text-4xl text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Delivery</h3>
              <p className="text-gray-600">
                Professional third-party delivery service with item verification 
                and secure handover processes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in Mumbai, India, Swapin was born from a simple observation: 
                people have valuable items they no longer need, while others are 
                looking for exactly those items.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We realized that traditional buying and selling often leaves both 
                parties dissatisfied. That's why we created a platform that focuses 
                on fair exchanges, where everyone wins.
              </p>
              <p className="text-lg text-gray-600">
                Today, Swapin is more than just a trading platform - it's a community 
                of conscious consumers who believe in sustainable consumption and 
                meaningful connections.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Why Swapin?</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <FaStar className="text-yellow-300 mr-3" />
                  <span>Items valued at ₹1000+ only</span>
                </li>
                <li className="flex items-center">
                  <FaStar className="text-yellow-300 mr-3" />
                  <span>No personal contact sharing</span>
                </li>
                <li className="flex items-center">
                  <FaStar className="text-yellow-300 mr-3" />
                  <span>Professional delivery service</span>
                </li>
                <li className="flex items-center">
                  <FaStar className="text-yellow-300 mr-3" />
                  <span>Item quality verification</span>
                </li>
                <li className="flex items-center">
                  <FaStar className="text-yellow-300 mr-3" />
                  <span>Secure payment handling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Swapin by the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Growing community of conscious consumers
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-600 mb-2">5K+</div>
              <div className="text-gray-600">Successful Exchanges</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">₹50L+</div>
              <div className="text-gray-600">Total Value Exchanged</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-600 mb-2">4.8★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate individuals dedicated to revolutionizing consumer exchanges
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUsers className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Development Team</h3>
              <p className="text-gray-600">
                Expert engineers building secure, scalable solutions
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaHeart className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Success</h3>
              <p className="text-gray-600">
                Dedicated support team ensuring your satisfaction
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaShieldAlt className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Team</h3>
              <p className="text-gray-600">
                Protecting your data and transactions 24/7
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Swapping?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying the benefits of 
            smart, secure exchanges on Swapin.
          </p>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/browse"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 