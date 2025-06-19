import React, {useState, useEffect} from 'react';
import {auth, db} from '../firebaseConfig';
import { doc, getDoc, updateDoc} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm]= useState({
        name: '',
        dateOfBirth: '', 
        email: '',
    });
    const navigate = useNavigate();

    useEffect(() =>{
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) =>{
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDoc);
            if (currentUser) {

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserData(data);
                    setForm({
                        name: data.name || '',
                        dateOfBirth: data.dateOfBirth || '',
                        email: data.email || ''
                    });
                }
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    },[]);



    const handleChange = (e) => {
        setForm({... form, [e.target.name]: e.target.value});
    };

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try{
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    name: form.name,
                    dateOfBirth: form.dateOfBirth,
                    email: form.email
                });
                setUserData(form);
                setIsEditing(false);
                alert('Profile updated successfully');
            } catch (error) {
                console.error('Error updating profile: ', error.message);
            }
        }
    };

    if (!userData) return <p>Loading...</p>

    return(
        <div>
            <h2 className="title-h2">Profile</h2>

            {isEditing ? (
                <div>
                    <label>
                        Name: 
                        <input type='text' name='name' value={form.name} onChange={handleChange} />
                    </label>
                    <br/>
                    <label>
                        Date of birth:
                        <input type='date' name='dateOfBirth' value={form.dateOfBirth} onChange={handleChange}/>
                    </label>
                    <br/>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={()=> setIsEditing(false)}>Cancel</button>
                </div>
            ): (
                <div>
                    <p><strong>Name:</strong>{userData.name}</p>
                    <p><strong>Email:</strong>{userData.email}</p>
                    <p><strong>Date of birth:</strong>{userData.dateOfBirth}</p>
                    <button onClick={()=>setIsEditing(true)}>Edit profile</button>
                </div>
            )}
        </div>
    );
  }
  
  export default Profile;