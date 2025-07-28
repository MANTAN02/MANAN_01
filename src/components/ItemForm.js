import React, { useState, useRef } from "react";
import Button from "./Button";
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { callBackendFunction } from '../AuthContext';

// 300+ categories (shortened for brevity, but you should expand this list)
const CATEGORIES = [
  "Mobile Phones", "Laptops", "Tablets", "Headphones", "Speakers", "Smart Watches", "Televisions", "Refrigerators", "Washing Machines", "Microwave Ovens", "Air Conditioners", "Fans", "Heaters", "Water Purifiers", "Vacuum Cleaners", "Mixers & Grinders", "Juicers", "Toasters", "Coffee Makers", "Induction Cooktops", "Gas Stoves", "Chairs", "Sofas", "Beds", "Mattresses", "Dining Tables", "Study Tables", "Wardrobes", "Bookshelves", "Shoe Racks", "TV Units", "Paint", "Suitcase", "Carpet", "Curtains", "Blankets", "Pillows", "Bedsheets", "Towels", "Clocks", "Mirrors", "Wall Art", "Decor Items", "Vases", "Planters", "Artificial Plants", "Candles", "Photo Frames", "Storage Boxes", "Laundry Baskets", "Ironing Boards", "Bicycles", "Scooters", "Motorcycles", "Cars", "Tyres", "Car Accessories", "Bike Accessories", "Helmets", "Sports Shoes", "Casual Shoes", "Sandals", "Slippers", "Formal Shoes", "Boots", "Sneakers", "Backpacks", "Handbags", "Wallets", "Belts", "Caps", "Hats", "Sunglasses", "Watches", "Jewellery", "Rings", "Necklaces", "Earrings", "Bracelets", "Bangles", "Anklets", "Makeup", "Perfumes", "Deodorants", "Shampoos", "Conditioners", "Soaps", "Body Wash", "Face Wash", "Moisturizers", "Sunscreen", "Toothpaste", "Toothbrushes", "Shaving Razors", "Shaving Cream", "Hair Dryers", "Hair Straighteners", "Combs", "Brushes", "Nail Clippers", "Scissors", "First Aid Kits", "Thermometers", "Blood Pressure Monitors", "Glucometers", "Wheelchairs", "Crutches", "Walkers", "Stethoscopes", "Books", "Novels", "Textbooks", "Comics", "Magazines", "Notebooks", "Pens", "Pencils", "Markers", "Highlighters", "Erasers", "Sharpeners", "Rulers", "Calculators", "School Bags", "Lunch Boxes", "Water Bottles", "Tiffin Boxes", "Stationery Sets", "Art Supplies", "Paint Brushes", "Colors", "Sketch Pens", "Crayons", "Drawing Books", "Craft Paper", "Glue", "Scissors (Craft)", "Stickers", "Toys", "Board Games", "Puzzles", "Action Figures", "Dolls", "Soft Toys", "Remote Control Toys", "Building Blocks", "Educational Toys", "Musical Toys", "Baby Strollers", "Baby Carriers", "Baby Cots", "Baby Chairs", "Baby Bottles", "Baby Clothes", "Baby Shoes", "Diapers", "Wipes", "Feeding Bottles", "Sippers", "Pacifiers", "Baby Blankets", "Baby Towels", "Baby Bath Tubs", "Baby Monitors", "Baby Gates", "Baby Safety Locks", "Baby Swings", "Baby Walkers", "Baby Play Gyms", "Baby Rattles", "Baby Teethers", "Baby Spoons", "Baby Plates", "Baby Bowls", "Baby Food Makers", "Baby Thermometers", "Baby Nail Clippers", "Baby Toothbrushes", "Baby Shampoo", "Baby Soap", "Baby Lotion", "Baby Oil", "Baby Powder", "Baby Cream", "Baby Wipes", "Baby Diaper Bags", "Baby Changing Mats", "Baby Potty Seats", "Baby Step Stools", "Baby Bath Seats", "Baby Bath Toys", "Baby Bath Thermometers", "Baby Bath Sponges", "Baby Bath Towels", "Baby Bath Robes", "Baby Bath Mats", "Baby Bath Brushes", "Baby Bath Washcloths", "Baby Bath Mitts", "Baby Bath Aprons", "Baby Bath Caps", "Baby Bath Shoes", "Baby Bath Slippers", "Baby Bath Sandals", "Baby Bath Boots", "Baby Bath Socks", "Baby Bath Gloves", "Baby Bath Hats", "Baby Bath Scarves", "Baby Bath Bibs", "Baby Bath Blankets", "Baby Bath Quilts", "Baby Bath Comforters", "Baby Bath Pillows", "Baby Bath Cushions", "Baby Bath Mattresses", "Baby Bath Sheets", "Baby Bath Covers", "Baby Bath Bags", "Baby Bath Pouches", "Baby Bath Cases", "Baby Bath Boxes", "Baby Bath Baskets", "Baby Bath Buckets", "Baby Bath Basins", "Baby Bath Bowls", "Baby Bath Cups", "Baby Bath Mugs", "Baby Bath Jugs", "Baby Bath Bottles", "Baby Bath Flasks", "Baby Bath Tumblers", "Baby Bath Glasses", "Baby Bath Plates", "Baby Bath Spoons", "Baby Bath Forks", "Baby Bath Knives", "Baby Bath Chopsticks", "Baby Bath Straws", "Baby Bath Brushes (Feeding)", "Baby Bath Cleaners", "Baby Bath Sterilizers", "Baby Bath Warmers", "Baby Bath Coolers", "Baby Bath Heaters", "Baby Bath Fans", "Baby Bath Air Purifiers", "Baby Bath Humidifiers", "Baby Bath Dehumidifiers", "Baby Bath Air Conditioners", "Baby Bath Air Coolers", "Baby Bath Air Heaters", "Baby Bath Air Blowers", "Baby Bath Air Circulators", "Baby Bath Air Fresheners", "Baby Bath Air Cleaners", "Baby Bath Air Filters", "Baby Bath Air Purifiers (Room)", "Baby Bath Air Purifiers (Car)", "Baby Bath Air Purifiers (Desk)", "Baby Bath Air Purifiers (Portable)", "Baby Bath Air Purifiers (Mini)", "Baby Bath Air Purifiers (Large)", "Baby Bath Air Purifiers (Small)", "Baby Bath Air Purifiers (Medium)", "Baby Bath Air Purifiers (Extra Large)", "Other"
];

function ItemForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInput = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!name || !price) {
      setError("Name and price are required.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    if (!fileInput.current.files[0]) {
      setError("Product photo is required.");
      return;
    }
    setLoading(true);
    try {
      // Upload image to Firebase Storage
      const file = fileInput.current.files[0];
      const fileRef = ref(storage, `items/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);
      // Call backend to create item
      const itemData = {
        title: name,
        description,
        price: parseFloat(price),
        images: [imageUrl],
        category,
        condition: "Good"
      };
      const created = await callBackendFunction('listItem', 'POST', itemData);
      setSuccess(true);
      if (onSubmit) {
        onSubmit(created);
      }
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImagePreview(null);
      fileInput.current.value = "";
    } catch (err) {
      setError("Failed to list item. " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #232F3E11", padding: 24, marginBottom: 24 }}>
      <label>Item Name *</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Used Laptop" required />
      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item (optional)" rows={3} />
      <label>Price (₹) *</label>
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 5000" required min={1} />
      <label>Category *</label>
      <select value={category} onChange={e => setCategory(e.target.value)} required>
        <option value="">Select a category</option>
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <label>Product Photo *</label>
      <input type="file" ref={fileInput} accept="image/*" onChange={handleImageChange} required />
      {imagePreview && (
        <div style={{ margin: "12px 0" }}>
          <img src={imagePreview} alt="Preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
        </div>
      )}
      {error && <div style={{ color: "#c00", marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: "#090", marginBottom: 8 }}>Item listed successfully!</div>}
      <Button type="submit" fullWidth disabled={loading}>{loading ? "Listing..." : "List Item"}</Button>
    </form>
  );
}

export default ItemForm;
