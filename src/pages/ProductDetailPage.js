import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Removed unused import
import { useCart } from '../components/CartContext';
import Button from '../components/Button';
import { FaArrowLeft, FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct({
            id: productDoc.id,
            ...productData,
            // Ensure all required fields are present
            category: productData.category || 'Uncategorized',
            condition: productData.condition || 'Not specified',
            price: productData.price || 0,
            images: productData.images || [productData.image || 'https://via.placeholder.com/500x500?text=No+Image'],
            seller: productData.seller || { name: 'Unknown', rating: 0, reviews: 0 },
            specifications: productData.specifications || {},
            reviews: productData.reviews || []
          });
        } else {
          setProduct(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="product-detail-grid">
          <div className="product-images">
            <img 
              src={product.image} 
              alt={product.name} 
              className="main-image"
            />
            <div className="image-gallery">
              {product.images?.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`${product.name} ${index + 1}`}
                  className="thumbnail"
                />
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            
            <div className="product-meta">
              <span className="category-badge">{product.category}</span>
              <span className={`condition-badge condition-${product.condition?.toLowerCase().replace(' ', '-')}`}>
                {product.condition}
              </span>
            </div>

            <div className="price-section">
              <span className="current-price">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="discount-badge">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <div className="seller-info">
              <p>Sold by: {product.seller.name}</p>
              <div className="seller-rating">
                <FaStar /> {product.seller.rating} ({product.seller.reviews} reviews)
              </div>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="specifications">
              <h3>Specifications</h3>
              <ul>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            <div className="action-buttons">
              <Button onClick={handleAddToCart} variant="secondary">
                <FaShoppingCart /> Add to Cart
              </Button>
              <Button onClick={handleBuyNow} variant="primary">
                Buy Now
              </Button>
              <button 
                className="wishlist-btn" 
                onClick={() => setLiked(!liked)}
              >
                <FaHeart color={liked ? "red" : "gray"} />
              </button>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h3>Customer Reviews</h3>
          {product.reviews.map(review => (
            <div key={review.id} className="review">
              <div className="review-header">
                <strong>{review.user}</strong>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color={i < review.rating ? "gold" : "gray"} />
                  ))}
                </div>
              </div>
              <p>{review.comment}</p>
              <small>{review.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
