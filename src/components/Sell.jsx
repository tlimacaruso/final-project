import React, { useState } from "react";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

function Sell() {
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        price: '',
        condition: '',
        category: '',
        color: [],
        size: '',
        brand: '',
        images: [],
    });

    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [secondSub, setSecondSub] = useState('');
    const [tempSelectedColor, setTempSelectedColor] = useState('');
    const [selectedSizeCategory, setSelectedSizeCategory] = useState('');
    const [secondSizeCat, setSecondSizeCat] = useState('');
    const [specificSize, setSpecificSize] = useState('');
    const [isLoadingImages, setIsLoadingImages] = useState(false);

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

    const sizeMenu = {
        'Adults': {
            'Clothing': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32', '34', '36', '38', '40', '42', '44'],
            'Shoes': [ '36', '37', '38', '39', '40', '41', '42', '43', '44']},
        
        'Children': {
            'Clothing' :['0-3 months', '3-6 months', '6-9 months', '9-12 months', '12-18 months', '1 year', '2-3 years', '4-5 years', '6-7 years', '8-9 years', '10-11 years', '12-13 years', '14-15 years'],
            'Shoes': ['26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37']   }
    }

    const brandList = ['Zara', 'Mango', '& Other Stories', 'Puma', 'Bimba y Lola', 'Laagam', 'Nike', 'Adidas', 'H&M', 'Uniqlo', 'Pull & Bear', 'Abercrombie & Fitch',
        'Imago', 'Massimo Dutti', 'Shein', 'SuperDry', 'Vagabond', 'Other'];
    const brands = brandList
        .filter(brand => brand !== 'Other')
        .sort()
        .concat('Other');



    const handleImageUpload = async (e) => {
        setIsLoadingImages(true); 
        const files = Array.from(e.target.files);
        const uploadedImages = [];

        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'reclothes-sell');
            formData.append('folder', 'reclothes/app');

            try {
                // Cloud Name 'djlvpxr7a'
                const res = await fetch('https://api.cloudinary.com/v1_1/djlvpxr7a/image/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Cloudinary upload failed: ${res.status} ${res.statusText} - ${errorText}`);
                }

                const data = await res.json();
                uploadedImages.push(data.public_id);
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                alert('Error uploading image. Please try again.');
                setIsLoadingImages(false); 
                return; 
            }
        }
        
        setItemData(prev => ({ ...prev, images: uploadedImages }));
        setIsLoadingImages(false);
        console.log('Uploaded image(s):', uploadedImages);
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setItemData(prev => ({ ...prev, [name]: value }));
    }

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setSubCategory('');
        setSecondSub('');
    };

    const handleSubCategoryChange = (e) => {
        setSubCategory(e.target.value);
        setSecondSub('');
    };

    const handleSecondSubChange = (e) => {
        setSecondSub(e.target.value);
    };

    const handleAddColor = () => {
        if (tempSelectedColor && itemData.color.length < 3 && !itemData.color.includes(tempSelectedColor)) {
            setItemData(prev => ({
                ...prev,
                color: [...prev.color, tempSelectedColor]
            }));
            setTempSelectedColor('');
        };
    };

    const handleRemoveColor = (colorToRemove) => {
        setItemData(prev => ({
            ...prev,
            color: prev.color.filter(color => color !== colorToRemove)
        }));
    };

    const handleSizeCategoryChange = (e) => {
        setSelectedSizeCategory(e.target.value);
        setSecondSizeCat('');
        setSpecificSize('');
    };

    const handleSecondSizeCatChange =(e) => {
        setSecondSizeCat(e.target.value);
        setSpecificSize('');
    };

    const handleSpecificSizeChange = (e) => {
        setSpecificSize(e.target.value);
        // Update the itemData.size with the selected size
        setItemData(prev => ({ ...prev, size: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            alert('You must be logged in to sell an item');
            return;
        }

        
        if (isLoadingImages) {
            alert('Please wait for images to finish uploading.');
            return;
        }
        if (itemData.images.length === 0) {
            alert('Please upload at least one image.');
            return;
        }

        const finalCategory = secondSub ? `${category} > ${subCategory} > ${secondSub}` : subCategory ? `${category} > ${subCategory}` : category;

        const completeUser = await getDoc(doc(db, 'users', user.uid));

        const itemToUpload = {
            ...itemData,
            category: finalCategory,
            timestamp: serverTimestamp(),
            userId: user.uid,
            userName: completeUser.data().displayName,
            isSold: false,
        };

        try {
            await addDoc(collection(db, 'items'), itemToUpload);
            alert('Item uploaded! Keep on shopping! :)');
            setItemData({
                name: '',
                description: '',
                price: '',
                condition: '',
                category: '',
                color: [],
                size: '',
                brand: '',
                images: [],
            });
            setCategory('');
            setSubCategory('');
            setSecondSub('');
            setTempSelectedColor('');
            setSelectedSizeCategory(''); 
            setSecondSizeCat('');
            setSpecificSize('');

        } catch (error) {
            console.error('Error adding piece:', error);
            alert('Error on the upload, please try again later :(');
        }
    };

    const currentSubCategories = catMenu[category];
    const currentSecondSubCategories = (category && subCategory && currentSubCategories && typeof currentSubCategories === 'object' && !Array.isArray(currentSubCategories))
        ? currentSubCategories[subCategory]
        : [];

    const currentSecondSizeCats = sizeMenu[selectedSizeCategory];
    const currentSpecificSizes = (selectedSizeCategory && secondSizeCat && currentSecondSizeCats && typeof currentSecondSizeCats === 'object' && !Array.isArray(currentSecondSizeCats))
        ? currentSecondSizeCats[secondSizeCat]
        : []; 


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
                    <select name='condition' value={itemData.condition} onChange={handleChange} required>
                        <option value=''>Select Condition</option>
                        <option value='newTags'>New with tags</option>
                        <option value='newNoTags'>New without tags</option>
                        <option value='great'>Great</option>
                        <option value='good'>Good</option>
                        <option value='okay'>Okay</option>
                    </select>
                </div>

                <div>
                    <h3>What type of item is it?</h3>
                    <div>
                        <label htmlFor='mainCategory'>Main Type</label>
                        <select id='mainCategory' value={category} onChange={handleCategoryChange} required>
                            <option value=''>Select a type:</option>
                            {Object.keys(catMenu).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {category && currentSubCategories && (
                        <div>
                            <label htmlFor='subCategory'>Subtype</label>
                            <select id='subCategory' value={subCategory} onChange={handleSubCategoryChange} required>
                                <option value=''>Select a subtype:</option>
                                {Array.isArray(currentSubCategories) ? (
                                    currentSubCategories.map((subcat) => (
                                        <option key={subcat} value={subcat}>{subcat}</option>
                                    ))
                                ) : (Object.keys(currentSubCategories).map((subcat) => (
                                    <option key={subcat} value={subcat}>{subcat}</option>
                                ))
                                )}
                            </select>
                        </div>
                    )}

                    {subCategory && currentSecondSubCategories && currentSecondSubCategories.length > 0 && (
                        <div>
                            <label htmlFor='secondSub'>Subtype</label>
                            <select id='secondSub' value={secondSub} onChange={handleSecondSubChange} required>
                                <option value=''>Select a subtype:</option>
                                {currentSecondSubCategories.map((secsub) => (
                                    <option key={secsub} value={secsub}>{secsub}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div>
                    <h3>Color or predominant color:</h3>
                    <p>Choose up to 3</p>
                    <select
                        value={tempSelectedColor}
                        onChange={(e) => setTempSelectedColor(e.target.value)}
                        disabled={itemData.color.length >= 3}
                    >
                        <option value=''>Select a color to add</option>
                        {colors.filter(color => !itemData.color.includes(color)).map((color) => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                    <button type='button' onClick={handleAddColor} disabled={!tempSelectedColor || itemData.color.length >= 3}>
                        Add colors
                    </button>

                    <div>
                        {itemData.color.map((color) => (
                            <span key={color} onClick={() => handleRemoveColor(color)}>
                                {color} &times;
                            </span>
                        ))}
                    </div>
                    {itemData.color.length === 0 && <p>Add at least one color</p>}
                </div>

                <div>
                    <h3>Size</h3>
                    <div>
                        <label htmlFor='size'>Size Group</label>
                        <select id='size' value={selectedSizeCategory} onChange={handleSizeCategoryChange} required>
                            <option value=''>Adults or kids?</option>
                            {Object.keys(sizeMenu).map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    {selectedSizeCategory && currentSecondSizeCats && (
                        <div>
                            <label htmlFor='secondSizeCat'>Clothes or shoes?</label>
                            <select id='secondSizeCat' value={secondSizeCat} onChange={handleSecondSizeCatChange} required>
                                <option value=''>Select:</option>
                                {Object.keys(currentSecondSizeCats).map((secondsize) => (
                                    <option key={secondsize} value={secondsize}>{secondsize}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {secondSizeCat && currentSpecificSizes.length > 0 && (
                        <div>
                            <label htmlFor='specificSize'>Size</label>
                            <select id='specificSize' value={specificSize} onChange={handleSpecificSizeChange} required>
                                <option value=''>Select a size:</option>
                                {currentSpecificSizes.map((specific) => (
                                    <option key={specific} value={specific}>{specific}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div>
                    <h3>What brand?</h3>
                    <select name='brand' value={itemData.brand} onChange={handleChange} required>
                        <option value=''>Select a brand</option>
                        {brands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3>Let's see that beauty!</h3>
                    <p>Show us pictures of the item, so people can see what does it look like and how it fits 😊</p>
                    <input type='file' accept="image/*" multiple onChange={handleImageUpload} />
                    {isLoadingImages && <p>Uploading images...</p>}
                </div>

                <button type='submit' disabled={isLoadingImages || itemData.images.length === 0}>
                    {isLoadingImages ? 'Uploading...' : 'Upload Item'}
                </button>
            </form>
        </div>
    );
}

export default Sell;