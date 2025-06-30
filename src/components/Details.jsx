import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../App.css';
import WishlistButton from "./WishlistButton";

function Details() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItem = async () => {
            const itemDocRef = doc(db, 'items', id);
            const itemSnap = await getDoc(itemDocRef);

            if (itemSnap.exists()) {
                setItem({ ...itemSnap.data(), id: itemSnap.id });

                if (auth.currentUser && itemSnap.data().userId === auth.currentUser.uid) {
                    setIsOwner(true);
                }
            } else {
                console.error("Item unavailable!");
            }
        };

        fetchItem();
    }, [id]);

    useEffect(() => {
        if (item && isEditing) {
            setForm({
                ...item,
                color: Array.isArray(item.color) ? item.color.join(', ') : item.color || '',
            });
        }
    }, [item, isEditing]);

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        const uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            formData.append('upload_preset', 'reclothes-sell');

            try {
                const res = await axios.post('https://api.cloudinary.com/v1_1/djlvpxr7a/image/upload', formData);
                uploadedImages.push(res.data.public_id);
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Image upload failed. Please try again.");
                return;
            }
        }

        setForm(prev => ({
            ...prev,
            images: [...(prev.images || []), ...uploadedImages],
        }));
    };

    const handleRemoveImage = (imageIdToRemove) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter(imageId => imageId !== imageIdToRemove),
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const itemDocRef = doc(db, 'items', id);
            await updateDoc(itemDocRef, {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                condition: form.condition,
                category: form.category,
                color: form.color.split(', ').map(color => color.trim()),
                size: form.size,
                brand: form.brand,
                images: form.images || [],
            });
            setItem({ ...form });
            setForm({});
            setIsEditing(false);
            console.log("Item updated successfully");
            alert("Item updated successfully");
            navigate(`/details/${id}`);
        } catch (error) {
            console.error("Error updating item:", error);
            alert("Failed to update item. Please try again.");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setForm({});
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'items', id));
            alert("Item deleted successfully");
            navigate(`/profile/${auth.currentUser.uid}`);
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item. Please try again.");
        }
    };

    if (!item) return <p>Loading...</p>

    return (
        <>
            {isEditing ? (
                <div>
                    <h2>Edit Item</h2>
                    <input type="text" name="name" value={form.name || item.name} onChange={handleChange} placeholder="Item Name" />
                    <textarea name="description" value={form.description || item.description} onChange={handleChange} placeholder="Description"></textarea>
                    <input type="number" name="price" value={form.price || item.price} onChange={handleChange} placeholder="Price" />
                    <input type="text" name="condition" value={form.condition || item.condition} onChange={handleChange} placeholder="Condition" />
                    <input type="text" name="category" value={form.category || item.category} onChange={handleChange} placeholder="Category" />
                    <input type="text" name="color" value={form.color || item.color} onChange={handleChange} placeholder="Color" />
                    <input type="text" name="size" value={form.size || item.size} onChange={handleChange} placeholder="Size" />
                    <input type="text" name="brand" value={form.brand || item.brand} onChange={handleChange} placeholder="Brand" />

                    <div>
                        <label>Images:
                            <input type="file" multiple onChange={handleImageUpload} />
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                            {form.images && form.images.map((imgId, idx) => (
                                <div key={idx} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
                                    <img
                                        src={`https://res.cloudinary.com/djlvpxr7a/image/upload/w_200,h_200,c_fill/${imgId}`}
                                        alt={`Preview ${idx}`}
                                        width='200'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(imgId)}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer'
                                        }}
                                    >x</button>
                                </div>
                            ))}

                        </div>
                    </div>

                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            ) : (
                <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p>Price: € {item.price}</p>
                    <p>Condition: {item.condition}</p>
                    <p>Category: {item.category}</p>
                    <p>Color: {Array.isArray(item.color) ? item.color.join(', ') : item.color}</p>
                    <p>Size: {item.size}</p>
                    <p>Brand:{item.brand}</p>
                    {item.images && item.images.map((imgId, idx) => (
                        <img key={idx} src={`https://res.cloudinary.com/djlvpxr7a/image/upload/w_200,h_200,c_fill/${imgId}`} alt={`Item ${item.name}`} width='200' style={{ marginRight: '10px' }} />
                    ))}
                    <p>Posted by: <Link to={`/profile/${item.userId}`}><strong>{item.userName}</strong></Link></p>

                    {auth.currentUser && auth.currentUser.uid !== item.userId && (
                        <button
                            onClick={() => navigate(`/checkout/${item.id}`)}
                            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >Buy this item
                        </button>
                    )}

                    {auth.currentUser && auth.currentUser.uid !== item.userId && (
                        <div style={{ marginTop: '10px' }}>
                            <WishlistButton itemId={item.id} />
                        </div>
                    )}

                    {isOwner && (
                        <div style={{ marginTop: '20px' }}>
                            <button onClick={() => setIsEditing(true)}>Edit</button>
                            <button onClick={handleDelete} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Details;