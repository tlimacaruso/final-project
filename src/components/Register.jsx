import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import '../App.css';
import './Register.css';

function Register() {
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
    const [passwordValidation, setPasswordValidation] = useState({ isValid: false });
    const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({ isValid: false });
    const [ageError, setAgeError] = useState('');

    const MIN_AGE = 18;

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    const validateAge = (dateOfBirth) => {
        if (!dateOfBirth) return false;
        
        const age = calculateAge(dateOfBirth);
        
        if (age < MIN_AGE) {
            setAgeError(`You have to be at least ${MIN_AGE} years old to sign up.`);
            return false;
        }
        
        setAgeError('');
        return true;
    };

    const getMaxDate = () => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
        return maxDate.toISOString().split('T')[0];
    };


    const handleImageUpload = async (e) => {
        setIsLoadingImage(true);
        setError(null);
        const file = e.target.files[0];

        if (!file) {
            setIsLoadingImage(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'reclothes-sell');
        formData.append('folder', 'reclothes/app');

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/djlvpxr7a/image/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Image upload failed: ${res.status} ${res.statusText} ${errorText}`);
            }

            const data = await res.json();
            setForm(prev => ({ ...prev, profilePicture: data.secure_url }));
            console.log('Image uploaded successfully:', data.secure_url);
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Image upload failed. Please try again.');
            setForm(prev => ({ ...prev, profilePicture: '' }));
        } finally {
            setIsLoadingImage(false);
        }
    };


    const handleChange = (e) => {
        const {name, value} = e.target;
        if (name === 'dateOfBirth') {
            validateAge(value);
        }
        setForm({ ...form, [name]: value });
    };

    const handlePasswordChange = (value) => {
        setForm(prev => ({ ...prev, confirmPassword: value }));
    };

    const handleConfirmPasswordChange = (value) => {
        setForm(prev => ({ ...prev, confirmPassword: value }))
    };

    const handlePasswordValidationChange = (validation) => {
        setPasswordValidation(validation);
    };

    const handleConfirmPasswordValidationChange = (validation) => {
        const passwordsMatch = form.password === form.confirmPassword;
        setConfirmPasswordValidation({
            ...validation,
            isValid: validation.isValid && passwordsMatch,
            passwordsMatch
        });
    };


    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateAge(form.dateOfBirth)) {
            return;
        }

        if (form.password !== form.confirmPassword) {
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
                profilePicture: form.profilePicture,
                bio: form.bio || '',
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
            <h5>New here? Create an account.</h5>
            <input type='text' name='name' placeholder='Name' onChange={handleChange} required />
            <input type='text' name='displayName' placeholder='Username' onChange={handleChange} required />
            <input type='date' name='dateOfBirth' onChange={handleChange} required />
            <input type='email' name='email' placeholder='E-mail' onChange={handleChange} required />

            <PasswordInput
                value={form.password}
                onChange={handlePasswordChange}
                onValidationChange={handlePasswordValidationChange}
                placeholder="Palavra-passe"
                showStrength={true}
                showRequirements={true}
            />


            <PasswordInput
                value={form.confirmPassword}
                onChange={handleConfirmPasswordChange}
                onValidationChange={handleConfirmPasswordValidationChange}
                placeholder="Confirmar palavra-passe"
                showStrength={false}
                showRequirements={false}
            />


            {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                    As palavras-passe não coincidem
                </div>
            )}

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
                        <img src={form.profilePicture} alt='Profile picture preview' style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                    </div>
                )}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <button className='regBtn' type='submit' disabled={isLoadingImage}>
                {isLoadingImage ? 'Uploading...' : 'Sign up'}
            </button>
        </form>
    );
}

export default Register;