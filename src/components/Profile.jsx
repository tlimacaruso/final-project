import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
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
    });

    const [userItems, setUserItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (currentUser) {

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserData({
                        ...data,
                        displayName: currentUser.displayName || data.displayName || '',
                        email: currentUser.email || data.email || ''
                    });
                    setForm({
                        name: data.name || '',
                        displayName: currentUser.displayName || data.displayName || '',
                        dateOfBirth: data.dateOfBirth || '',
                        email: data.email || ''
                    });
                }
                else {
                    setUserData({
                        name: '',
                        displayName: currentUser.displayName || '',
                        dateOfBirth: '',
                        email: currentUser.email || '',
                    });
                    setForm({
                        name: '',
                        displayName: currentUser.displayName || '',
                        dateOfBirth: '',
                        email: currentUser.email || '',
                    });
                    await updateDoc(userDocRef, {
                        email: currentUser.email,
                        displayName: currentUser.displayName || '',
                        createdAt: new Date(),
                    }, { merge: true });
                }

                const fetchUserItems = async () => {
                    try {
                        setLoadingItems(true);
                        const itemsRef = collection(db, 'items');
                        const q = query(itemsRef, where('userId', '==', currentUser.uid));
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

                fetchUserItems();

            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);



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
                    email: currentUser.email
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