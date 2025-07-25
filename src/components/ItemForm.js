import React, { useState, useRef } from "react";
import Button from "./Button";
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ItemForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const fileInput = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError("Name and price are required.");
      return;
    }
    setError("");

    let imageUrl = "";
    if (fileInput.current.files[0]) {
      const itemDoc = await addDoc(collection(db, 'items'), {
        name,
        description,
        price: parseFloat(price),
      });
      const fileRef = ref(storage, `items/${itemDoc.id}/main.jpg`);
      await uploadBytes(fileRef, fileInput.current.files[0]);
      imageUrl = await getDownloadURL(fileRef);
      // Update item with image URL
      await addDoc(collection(db, 'items'), {
        name,
        description,
        price: parseFloat(price),
        image: imageUrl,
      });
    }

    if (onSubmit) {
      onSubmit({
        id: Date.now(),
        name,
        description,
        price: parseFloat(price),
        image: imagePreview // This is a base64 string
      });
    }
    setName("");
    setDescription("");
    setPrice("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #232F3E11", padding: 24, marginBottom: 24 }}>
      <label>Item Name *</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Used Laptop" required />
      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item (optional)" rows={3} />
      <label>Price (₹) *</label>
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 5000" required min={1} />
      <label>Product Photo *</label>
      <input type="file" ref={fileInput} accept="image/*" onChange={handleImageChange} required />
      {imagePreview && (
        <div style={{ margin: "12px 0" }}>
          <img src={imagePreview} alt="Preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
        </div>
      )}
      {error && <div style={{ color: "#c00", marginBottom: 8 }}>{error}</div>}
      <Button type="submit" fullWidth>List Item</Button>
    </form>
  );
}

export default ItemForm;
