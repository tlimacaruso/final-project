import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { Link } from 'react-router-dom';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: '',
        displayName: '',
        dateOfBirth: '',
        email: '',
        profilePicture: '',
    });

    const [userItems, setUserItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);

    const navigate = useNavigate();

    const { userId } = useParams(); // Get userId from URL params if needed
    const [myProfile, setMyProfile] = useState(false);

    useEffect(() => {

        if (userId && userId !== auth.currentUser?.uid) {
            fetchUserData(userId);
            
        }else{
            const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
                if (!currentUser) {
                    navigate('/login');
                };
                fetchUserData(currentUser.uid);
                
            });
            return () => unsubscribe();
        }
    
    }, [navigate]);

    const fetchUserData = async (userId) => {
        const userDocRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userDocRef);
            let profileData = userSnap.data();
            if (userSnap.exists()) {
                profileData = userSnap.data();
            } /* else {
                profileData = {
                    email: currentUser.email,
                    displayName: currentUser.displayName || '',
                    createdAt: new Date(),
                    name: '',
                    dateOfBirth: '',
                    profilePicture: '',
                };
                await setDoc(userDocRef, profileData, { merge: true });
            } */
            
            if (profileData) {

                    setUserData({
                        ...profileData
                    });
                    setForm({
                        name: profileData.name || '',
                        displayName: profileData.displayName || '',
                        dateOfBirth: profileData.dateOfBirth || '',
                        email: profileData.email || '',
                        profilePicture: profileData.profilePicture || '',
                    });

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
                        console.error('Error fetching user items: ? ', error);
                    } finally {
                        setLoadingItems(false);
                    }
                };

                fetchUserItems(userId);

            } else {
                navigate('/login');
            }
    }



    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
                })
                setUserData({
                    ...form,
                    email: currentUser.email,
                    profilePicture: userData.profilePicture,
                });
                setIsEditing(false);
                alert('Profile updated successfully');
            } catch (error) {
                console.error('Error updating profile: ', error.message);
                alert('Failed to update profile: ' + error.message);
            }
        }
    };

    if (!userData) return <p>Loading...</p>

    return (
        <div>
            <h2 className="title-h2">Profile</h2>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                {userData.profilePicture ? (
                    <img src={userData.profilePicture} 
                    alt='Profile picture' 
                    style={{
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover'
                    }}
                    />
                ) : (
                    <img src='https://via.placeholder.com/100' alt='Default Profile' width='100' style={{ borderRadius: '50%' }}/>
                )}

                <button onClick={() => navigate('/upload-profile-picture')}>Change Photo</button> 
            </div>

            {isEditing ? (
                <div>
                    <label>
                        Username:
                        <input type='text' name='displayName' value={form.displayName} onChange={handleChange} />
                    </label>

                    <label>
                        Name:
                        <input type='text' name='name' value={form.name} onChange={handleChange} />
                    </label>
                    <br />
                    <label>
                        Date of birth:
                        <input type='date' name='dateOfBirth' value={form.dateOfBirth} onChange={handleChange} />
                    </label>

                    <br />
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p><strong>Username:</strong>{userData.displayName || 'Undefined'}</p>
                    <p><strong>Name:</strong>{userData.name}</p>
                    <p><strong>Email:</strong>{userData.email}</p>
                    <p><strong>Date of birth:</strong>{userData.dateOfBirth}</p>
                    <button onClick={() => setIsEditing(true)}>Edit profile</button>
                </div>
            )}

            <h2 className='title-h2'>Closet</h2>
            {loadingItems
                ? (
                    <p>Loading closet...</p>
                ) : (
                    <div>
                        {userItems.length === 0 ? (
                            <p>Your closet is empty 🙃</p>
                        ) : (
                            <div>
                                {userItems.map(item => (
                                    <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                                        <h4>{item.name}</h4>
                                        <p>{item.description}</p>
                                        <p>Price: € {item.price}</p>
                                        <p>Condition: {item.condition}</p>
                                        <p>Category: {item.category}</p>
                                        <p>Color: {item.color.join(', ')}</p>
                                        <p>Size: {item.size}</p>
                                        <p>Brand:{item.brand}</p>
                                        {item.images && item.images.map((img, i) => (
                                            <img key={i} src={`https://res.cloudinary.com/djlvpxr7a/image/upload/w_200,h_200,c_fill/${img}`} alt={`Item ${item.name}`} width='200' style={{ marginRight: '10px' }} />
                                        ))}
                                        <Link to={`/details/${item.id}`}>Details</Link>

                                        {/* DIFERENÇA ENTRE EDIT E COMPRAR O DE OUTRA PESSOA */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
}

export default Profile;