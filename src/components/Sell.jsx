import React, { useState } from "react";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import {app , db} from "../firebaseConfig";
import './App.css';

const db = getFirestore(app);

function Sell() {
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        price: '',
        condition: '',
        category: '',
        color: '',
        size: '',
        brand: '',
        images: [],
    });

    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [secondSub, setSecondSub] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    const colors = [
        "Black", "White", "Gray", "Red", "Pink", "Orange", "Yellow", "Green",
        "Blue", "Purple", "Brown", "Beige", "Gold", "Silver", "Multi"
    ];

    const catMenu = {
        'Women': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Jewelry', 'Bags', 'Swimwear'],
        'Men': ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Jewelry', 'Bags', 'Swimwear'],
        'Children': {
            'Girls': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Swimwear'],
            'Boys': ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Swimwear'],
            'Babies': []
        },
        'Unisex': ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Jewelry', 'Bags']
    };

    const sizes = {
        'Adults': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32', '34', '36', '38', '40', '42', '44'],
        'Children': ['0-3 months', '3-6 months', '6-9 months', '9-12 months', '12-18 months', '1 year', '2-3 years', '4-5 years', '6-7 years', '8-9 years', '10-11 years', '12-13 years', '14-15 years']
    }

    const brandList = ['Zara', 'Mango', '& Other Stories', 'Puma', 'Bimba y Lola', 'Laagam', 'Nike', 'Adidas', 'H&M', 'Uniqlo', 'Pull & Bear', 'Abercrombie & Fitch',
        'Imago', 'Massimo Dutti', 'Shein', 'SuperDry', 'Vagabond', 'Other'];
    const brands = brandList
        .filter(brand => brand !== 'Other')
        .sort()
        .concat('Other');

    const [uploading, setUploading] = useState(false);

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const url = `https://api.cloudinary.com/v1_1/djlvpxr7a/upload`;
        const formData = new FormData();
        formData.append('file', file)
        formData.append('upload_preset', 'reclothes-sell');

        try {
            const res = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            setItemData(prev=> ({
                ...prev,
                images: [...prev.images, data.secure_url],
            }));
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
        
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setItemData(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        
    }

    return (
        <div>
            <div className="title-h2">Upload item</div>
            <p>Welcome to the selling page! Upload your clothing items describing them in a few easy steps!</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <h3>What are you selling?</h3>
                    <input type="text" name="name" placeholder="Item name" value={itemData.name} onChange={handleChange} required />
                </div>

                <div>
                    <h3>Now describe your item:</h3>
                    <input type="text" name="description" placeholder="Description" value={itemData.description} onChange={handleChange} required />
                </div>

                <div>
                    <h3>How much is it?</h3>
                    <input type="number" name="price" placeholder="Price" value={itemData.price} onChange={handleChange} required /> €
                </div>

                <div>
                    <h3>Is it in good condition?</h3>
                    <p>Please include pictures of any imperfections or usage marks</p>
                    {['newTags', 'newNoTags', 'great', 'good', 'okay'].map(cond => (
                        <label key={cond}>
                            <input
                                type="radio"
                                name="condition"
                                value={cond}
                                checked={itemData.condition === cond}
                                onChange={handleChange}
                            />
                            <strong>{cond === 'newTags' ? 'New with tags' : cond === 'newNoTags' ? 'New without tags' : cond.charAt(0).toUpperCase() + cond.slice(1)}</strong>
                        </label>
                    ))}
                </div>

                <div>
                    <h3>What type of item is it?</h3>
                    <div>
                        {Object.keys(catMenu).map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                    setCategory(cat);
                                    setSubCategory('');
                                    setSecondSub('');
                                }}
                                className={category === cat ? 'selected' : ''}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {category && typeof catMenu[category] === 'object' && !Array.isArray(catMenu[category]) ? (
                        <div>
                            {Object.keys(catMenu[category]).map((subcat) => (
                                <button
                                    key={subcat}
                                    type="button"
                                    onClick={() => {
                                        setSubCategory(subcat);
                                        setSecondSub('');
                                    }}
                                    className={subCategory === subcat ? 'selected' : ''}
                                >
                                    {subcat}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {category && subCategory && catMenu[category]?.[subCategory]?.length ? (
                        <div>
                            {catMenu[category][subCategory].map((secsub) => (
                                <button
                                    key={secsub}
                                    type="button"
                                    onClick={() => setSecondSub(secsub)}
                                    className={secondSub === secsub ? 'selected' : ''}
                                >
                                    {secsub}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div>
                    <h3>Color or predominant color:</h3>
                    {colors.map((color) => (
                        <button
                            key={color}
                            type='button'
                            onClick={() => setSelectedColor(color)}
                            className={selectedColor === color ? 'selected' : ''}
                        >
                            {color}
                        </button>
                    ))}
                </div>

                <div>
                    <h3>Size</h3>
                    {sizes.map((size) => (
                        <button
                            key={size}
                            type='button'
                            onClick={() => setItemData(prev => ({ ...prev, size }))}
                            className={itemData.size === size ? 'selected' : ''}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                <div>
                    <h3>What brand?</h3>
                    {brands.map((brand) => (
                    <button
                    key={brand}
                    type='button'
                    onClick={() => setItemData(prev=>({...prev, brand}))}
                    className={itemData.brand === brand ? 'selected' : ''}
                    >
                        {brand}
                    </button>
                ))}
                </div>

                <div>
                    <h3>Let's see that beauty!</h3>
                    <p>Show us pictures of the item, so people can see what does it look like and how it fits 😊</p>
                    <input type='file' onChange={handleFileChange}/>
                    {uploading && <p>Uploading image...</p>}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {itemData.images.map((image, index) => (
                            <img key = {index} src = {image} alt = {`uploaded-${index}`} style={{ maxWidth: '150px' }}/>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Sell;
