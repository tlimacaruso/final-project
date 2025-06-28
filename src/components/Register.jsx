import {useState} from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from '../firebaseConfig';
import{doc, setDoc} from 'firebase/firestore';
import {db} from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

function Register(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        name: '',
        dateOfBirth: '',
        profilePicture: '',
        bio: ''
    });
    
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [error, setError] = useState(null);


    const handleImageUpload = async (e) => {
        setIsLoadingImage(true);
        setError(null);
        const file = e.target.files[0];

       if(!file) {
        setIsLoadingImage(false);
        return;
       }

       const formData = new FormData();
       formData.append('file', file);
       formData.append('upload_preset', 'reclothes-sell');
       formData.append('folder', 'reclothes/app');

       try{
        const res = await fetch('https://api.cloudinary.com/v1_1/djlvpxr7a/image/upload', {
            method: 'POST',
            body: formData,
        });

        if(!res.ok) {
            const errorText = await res.text();
            throw new Error(`Image upload failed: ${res.status} ${res.statusText} ${errorText}`);
        }

        const data = await res.json();
        setForm(prev => ({... prev, profilePicture:data.secure_url}));
        console.log('Image uploaded successfully:', data.secure_url);
    } catch (error) {
        console.error('Error uploading image:', error);
        setError('Image upload failed. Please try again.');
        setForm(prev => ({...prev, profilePicture: ''}));
    } finally {
        setIsLoadingImage(false);
       }
    };


    const handleChange = (e) =>{
        setForm({ ...form, [e.target.name]: e.target.value});
    };

    const handleRegister = async(e)=>{
        e.preventDefault();

        if (form.password !== form.confirmPassword){
            alert('Passwords do not match!');
            return;
        }
        if (isLoadingImage) {
            alert('Please wait for images to finish uploading.');
            return;
        }

        if (!form.profilePicture) {
            setError('Please upload a profile picture.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: form.name,
                displayName: form.displayName,
                dateOfBirth: form.dateOfBirth,
                email: form.email,
                profilePicture: form.profilePicture
            });

            alert("You are successfully signed up!");
            navigate('/');
        } catch (error) {
            console.error('Error during registration:', error);
            setError('Registration failed. Please try again.' + error.message);
        }
    }


    return (
        <form onSubmit={handleRegister}>
            <h2 className="title-h2">Sign up</h2>
            <input type='text' name='name' placeholder='Name' onChange={handleChange} required />
            <input type= 'text' name= 'displayName' placeholder='Username' onChange={handleChange} required/>
            <input type='date' name='dateOfBirth' onChange={handleChange} required />
            <input type='email' name='email' placeholder='E-mail' onChange={handleChange} required/>
            <input type='password' name='password' placeholder='Password' onChange={handleChange} required/>
            <input type='password' name='confirmPassword' placeholder='Confirm password' onChange={handleChange} required/>
            <textarea type='text' name='bio' placeholder='Bio (optional)' onChange={handleChange} rows='4' cols='50'></textarea>
            
            <div>
                <label htmlFor='profilePicture'>Profile Picture:</label>
                <input 
                type='file' 
                accept="image/*" 
                onChange={handleImageUpload} 
                />
                {isLoadingImage && <p>Uploading profile picture...</p>}
                {form.profilePicture && !isLoadingImage && (
                    <div>
                        <p>Profile picture uploaded!</p>
                        <img src={form.profilePicture} alt='Profile picture preview' style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                    </div>
                )}
                {error && <p style={{color: 'red'}}>{error}</p>}
            </div>
            <button type='submit' disabled={isLoadingImage}>
                    {isLoadingImage ? 'Uploading...' : 'Sign up'}
            </button>
            
        </form>
    );
}

export default Register;