import {useState} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from '../firebaseConfig';
import{doc, getDoc, setDoc} from 'firebase/firestore';
import {db} from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

function Register(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        dateOfBirth: ''
    });

    const handleChange = (e) =>{
        setForm({ ...form, [e.target.name]: e.target.value});
    };

    const handleRegister = async(e)=>{
        e.preventDefault();

        if (form.password !== form.confirmPassword){
            alert('Passwords do not match!');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid),{
                name: form.name,
                dateOfBirth: form.dateOfBirth,
                email: form.email
            });

            alert("You are successfully signed up!");
            navigate('/');
        } catch (error){
            alert('Error: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2 className="title-h2">Sign up</h2>
            <input type='text' name='name' placeholder='Name' onChange={handleChange} required />
            <input type='date' name='dateOfBirth' onChange={handleChange} required />
            <input type='email' name='email' placeholder='E-mail' onChange={handleChange} required/>
            <input type='password' name='password' placeholder='Password' onChange={handleChange} required/>
            <input type='password' name='confirmPassword' placeholder='Confirm password' onChange={handleChange} required/>
            <button type='submit'>Sign up</button>
        </form>
    );
}

export default Register;