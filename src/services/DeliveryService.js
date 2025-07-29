import { callBackendFunction } from '../AuthContext';

class DeliveryService {
  constructor() {
    this.deliveryPartners = {
      borzo: {
        name: 'Borzo',
        apiKey: process.env.REACT_APP_BORZO_API_KEY,
        baseUrl: 'https://api.borzo.com/v1'
      },
      dunzo: {
        name: 'Dunzo',
        apiKey: process.env.REACT_APP_DUNZO_API_KEY,
        baseUrl: 'https://api.dunzo.com/v1'
      },
      delhivery: {
        name: 'Delhivery',
        apiKey: process.env.REACT_APP_DELHIVERY_API_KEY,
        baseUrl: 'https://api.delhivery.com/v1'
      }
    };
  }

  // Create delivery request
  async createDelivery(deliveryData) {
    try {
      const response = await callBackendFunction('createDelivery', 'POST', {
        swapId: deliveryData.swapId,
        itemId: deliveryData.itemId,
        fromAddress: deliveryData.fromAddress,
        toAddress: deliveryData.toAddress,
        packageDetails: deliveryData.packageDetails,
        deliveryPartner: deliveryData.deliveryPartner || 'borzo',
        specialInstructions: deliveryData.specialInstructions
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to create delivery: ${error.message}`);
    }
  }

  // Get delivery status
  async getDeliveryStatus(deliveryId) {
    try {
      const response = await callBackendFunction('getDeliveryStatus', 'GET', {}, 
        `?deliveryId=${deliveryId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get delivery status: ${error.message}`);
    }
  }

  // Update delivery status
  async updateDeliveryStatus(deliveryId, status, updates = {}) {
    try {
      const response = await callBackendFunction('updateDeliveryStatus', 'POST', {
        deliveryId,
        status,
        ...updates
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to update delivery status: ${error.message}`);
    }
  }

  // Cancel delivery
  async cancelDelivery(deliveryId, reason) {
    try {
      const response = await callBackendFunction('cancelDelivery', 'POST', {
        deliveryId,
        reason
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to cancel delivery: ${error.message}`);
    }
  }

  // Get delivery history
  async getDeliveryHistory(userId, page = 1, limit = 10) {
    try {
      const response = await callBackendFunction('getDeliveryHistory', 'GET', {}, 
        `?userId=${userId}&page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get delivery history: ${error.message}`);
    }
  }

  // Calculate delivery cost
  async calculateDeliveryCost(fromAddress, toAddress, packageDetails) {
    try {
      const response = await callBackendFunction('calculateDeliveryCost', 'POST', {
        fromAddress,
        toAddress,
        packageDetails
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to calculate delivery cost: ${error.message}`);
    }
  }

  // Get available delivery partners
  async getAvailablePartners(fromLocation, toLocation) {
    try {
      const response = await callBackendFunction('getAvailablePartners', 'GET', {}, 
        `?fromLocation=${encodeURIComponent(JSON.stringify(fromLocation))}&toLocation=${encodeURIComponent(JSON.stringify(toLocation))}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get available partners: ${error.message}`);
    }
  }

  // Track delivery
  async trackDelivery(trackingNumber, partner = 'borzo') {
    try {
      const response = await callBackendFunction('trackDelivery', 'GET', {}, 
        `?trackingNumber=${trackingNumber}&partner=${partner}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to track delivery: ${error.message}`);
    }
  }

  // Schedule delivery
  async scheduleDelivery(deliveryId, scheduledTime) {
    try {
      const response = await callBackendFunction('scheduleDelivery', 'POST', {
        deliveryId,
        scheduledTime
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to schedule delivery: ${error.message}`);
    }
  }

  // Get delivery estimates
  async getDeliveryEstimates(fromAddress, toAddress, packageDetails) {
    try {
      const response = await callBackendFunction('getDeliveryEstimates', 'POST', {
        fromAddress,
        toAddress,
        packageDetails
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get delivery estimates: ${error.message}`);
    }
  }

  // Validate address
  async validateAddress(address) {
    try {
      const response = await callBackendFunction('validateAddress', 'POST', { address });
      return response;
    } catch (error) {
      throw new Error(`Failed to validate address: ${error.message}`);
    }
  }

  // Get delivery zones
  async getDeliveryZones() {
    try {
      const response = await callBackendFunction('getDeliveryZones', 'GET');
      return response;
    } catch (error) {
      throw new Error(`Failed to get delivery zones: ${error.message}`);
    }
  }

  // Create return delivery
  async createReturnDelivery(originalDeliveryId, returnReason) {
    try {
      const response = await callBackendFunction('createReturnDelivery', 'POST', {
        originalDeliveryId,
        returnReason
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to create return delivery: ${error.message}`);
    }
  }

  // Get delivery insurance
  async getDeliveryInsurance(deliveryId) {
    try {
      const response = await callBackendFunction('getDeliveryInsurance', 'GET', {}, 
        `?deliveryId=${deliveryId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get delivery insurance: ${error.message}`);
    }
  }

  // Purchase delivery insurance
  async purchaseDeliveryInsurance(deliveryId, insuranceAmount) {
    try {
      const response = await callBackendFunction('purchaseDeliveryInsurance', 'POST', {
        deliveryId,
        insuranceAmount
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to purchase delivery insurance: ${error.message}`);
    }
  }

  // Get delivery partner details
  getDeliveryPartnerDetails(partner) {
    return this.deliveryPartners[partner] || null;
  }

  // Format delivery status
  formatDeliveryStatus(status) {
    const statusMap = {
      'pending': { label: 'Pending', color: 'yellow', icon: '⏳' },
      'confirmed': { label: 'Confirmed', color: 'blue', icon: '✅' },
      'picked_up': { label: 'Picked Up', color: 'purple', icon: '📦' },
      'in_transit': { label: 'In Transit', color: 'orange', icon: '🚚' },
      'out_for_delivery': { label: 'Out for Delivery', color: 'green', icon: '🛵' },
      'delivered': { label: 'Delivered', color: 'green', icon: '🎉' },
      'failed': { label: 'Delivery Failed', color: 'red', icon: '❌' },
      'cancelled': { label: 'Cancelled', color: 'gray', icon: '🚫' },
      'returned': { label: 'Returned', color: 'orange', icon: '↩️' }
    };

    return statusMap[status] || { label: status, color: 'gray', icon: '❓' };
  }

  // Calculate delivery time
  calculateDeliveryTime(fromLocation, toLocation, partner = 'borzo') {
    // This would integrate with partner APIs for real-time estimates
    const baseTime = 2; // hours
    const distance = this.calculateDistance(fromLocation, toLocation);
    const estimatedTime = baseTime + (distance * 0.1); // 6 minutes per km
    
    return {
      estimated: Math.round(estimatedTime),
      range: {
        min: Math.round(estimatedTime * 0.8),
        max: Math.round(estimatedTime * 1.2)
      }
    };
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLon = this.deg2rad(point2.lng - point1.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Format delivery cost
  formatDeliveryCost(cost, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(cost);
  }

  // Get delivery instructions
  getDeliveryInstructions(itemType) {
    const instructions = {
      electronics: [
        'Pack item securely in original box if available',
        'Use bubble wrap for protection',
        'Include all accessories and manuals',
        'Mark as fragile'
      ],
      clothing: [
        'Fold items neatly',
        'Use plastic bag for protection',
        'Include size and brand information'
      ],
      furniture: [
        'Disassemble if possible',
        'Wrap corners and edges',
        'Use furniture blankets',
        'Mark as heavy item'
      ],
      books: [
        'Pack in cardboard box',
        'Use paper padding',
        'Avoid moisture'
      ]
    };

    return instructions[itemType] || [
      'Pack item securely',
      'Use appropriate padding',
      'Include item description'
    ];
  }

  // Validate package details
  validatePackageDetails(packageDetails) {
    const errors = [];

    if (!packageDetails.weight || packageDetails.weight <= 0) {
      errors.push('Weight must be greater than 0');
    }

    if (!packageDetails.dimensions) {
      errors.push('Dimensions are required');
    }

    if (packageDetails.weight > 50) {
      errors.push('Weight cannot exceed 50kg');
    }

    if (packageDetails.dimensions && 
        (packageDetails.dimensions.length > 200 || 
         packageDetails.dimensions.width > 200 || 
         packageDetails.dimensions.height > 200)) {
      errors.push('Dimensions cannot exceed 200cm');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new DeliveryService(); 