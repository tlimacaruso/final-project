import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import ItemCard from './ItemCard';
import '../App.css';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: '',
        displayName: '',
        dateOfBirth: '',
        email: '',
        profilePicture: '',
        bio: '',
    });

    const [userItems, setUserItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    const navigate = useNavigate();

    const { userId: profileUserId } = useParams();

    useEffect(() => {

        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                const targetUserId = profileUserId && profileUserId !== currentUser.uid
                    ? profileUserId
                    : currentUser.uid;

                await fetchUserData(targetUserId);
                setAuthLoading(false);
            } else {
                navigate('/login');
            }
        });


        return () => unsubscribe();
    }, [navigate, profileUserId]);

    const fetchUserData = async (userId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userDocRef);

            if (!userSnap.exists()) {
                navigate('/login');
                return;
            }

            const profileData = userSnap.data();


            setUserData(profileData);
            setForm({
                name: profileData.name || '',
                displayName: profileData.displayName || '',
                dateOfBirth: profileData.dateOfBirth || '',
                email: profileData.email || '',
                profilePicture: profileData.profilePicture || '',
                bio: profileData.bio || '',
            });

            await fetchUserItems(userId);

        } catch (error) {
            console.error('Error fetching user data: ', error);
        }
    };

    const fetchUserItems = async (userId) => {
        try {
            setLoadingItems(true);
            const itemsRef = collection(db, 'items');
            const q = query(itemsRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const itemsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserItems(itemsData);
        } catch (error) {
            console.error('Error fetching user items: ', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'reclothes-sell');

        try {
            setUploadingImage(true);
            const res = await fetch('https://api.cloudinary.com/v1_1/djlvpxr7a/image/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.secure_url) {
                setForm((prevForm) => ({
                    ...prevForm,
                    profilePicture: data.secure_url,
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await updateProfile(auth.currentUser, {
                    displayName: form.displayName,
                });
                const userDocRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userDocRef, {
                    name: form.name,
                    displayName: form.displayName,
                    dateOfBirth: form.dateOfBirth,
                    bio: form.bio,
                    profilePicture: form.profilePicture,
                })
                setUserData(prevData => ({
                    ...prevData,
                    ...form,
                    email: currentUser.email,
                }));
                setIsEditing(false);
                alert('Profile updated successfully');
            } catch (error) {
                console.error('Error updating profile: ', error.message);
                alert('Failed to update profile: ' + error.message);
            }
        }
    };

    if (!userData) return <p>Loading...</p>

    const availableItems = userItems.filter(item => !item.isSold);
    const soldItems = userItems.filter(item => item.isSold);
    const isOwnProfile = (!profileUserId || profileUserId === auth.currentUser?.uid);


    return (
        <div>
            <h2 className="title-h2">Profile</h2>

            <div className='profilePicture'>
                <img className='profilePic' src={userData.profilePicture || 'https://via.placeholder.com/100'}
                    alt='Profile picture'
                    style={{
                        borderRadius: '50%',
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover'
                    }}
                />
                {isEditing && (
                    <div>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleImageUpload}
                            style={{ display: 'block', margin: '10px auto' }}
                        />
                        {uploadingImage && <p>Uploading profile picture...</p>}
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className = 'editProfile'>
                    <label className='textName'>
                        Username:
                        <input type='text' name='displayName' value={form.displayName} onChange={handleChange} />
                    </label>

                    <label className='textName'>
                        Name:
                        <input type='text' name='name' value={form.name} onChange={handleChange} />
                    </label>
            
                    <label className='dob'>
                        Date of birth:
                        <input type='date' name='dateOfBirth' value={form.dateOfBirth} onChange={handleChange} />
                    </label>

                    <label>
                        Password:
                        <input type='password' name='password' value={form.password} placeholder='New password' onChange={handleChange} />
                    </label>

                    <label>
                        Confirm password:
                        <input type='password' name='password' value={form.confirmPassword} placeholder='Confirm new password' onChange={handleChange} />
                    </label>

                    <label>
                        Bio:
                        <textarea
                            name='bio'
                            value={form.bio}
                            onChange={handleChange}
                            placeholder='Bio (optional)'
                            rows='4'
                            cols='50'
                        ></textarea>
                    </label>

                    <br />
                    <div className='editButtons'>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className='profileInfo'>
                    <div className='displayName'>
                    <p><strong>{userData.displayName || 'Undefined'}</strong></p>
                    </div>
                    <div className='profileDetails'>
                    <p>{userData.name}</p>
                    <p>{userData.bio}</p>
                    {/* <p><strong>Email:</strong>{userData.email}</p>
                    <p><strong>Date of birth:</strong>{userData.dateOfBirth}</p> */}
                    {(!profileUserId || profileUserId === auth.currentUser?.uid) && (
                        <button onClick={() => setIsEditing(true)}>Edit profile</button>)}
                        </div>
                </div>
            )}

            <h2 className='title-h2'>Closet</h2>
            {loadingItems
                ? (
                        <p>Loading closet...</p>
                ) : (
                    <div className='displayItems'>
                        {userItems.length === 0 ? (
                            <p>Your closet is empty 🙃</p>
                        ) : (

                            <div className='items-grid'>
                                {userItems.filter(item => !item.isSold).length === 0 ? (
                                    <p>No items currently for sale.</p>
                                ) : (
                                    <div>
                                        {userItems.filter(item => !item.isSold).map(item => (
                                            <ItemCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                )}

                                {isOwnProfile && (
                                    <>
                                        <h2 className='title-h2'>Sold Items</h2>
                                        {loadingItems ? (
                                            <p>Loading sold items...</p>
                                        ) : (
                                            <div className='items-grid-sold'>
                                                {soldItems.length === 0 ? (
                                                    <p>No items have been sold yet.</p>
                                                ) : (
                                                    soldItems.map(item => (
                                                        <ItemCard key={item.id} item={item} showSoldTag={true} />
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
}

export default Profile;