import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUsername as setReduxUsername } from '../actions'; // Ensure the correct path to your actions file

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            console.log('Login details:', { username, password });
            const response = await axios.post("http://localhost:5000/api", {
                username: username,
                password: password
            });

            if (response.status === 200 && response.data.redirectUrl) {
                console.log(response.data.redirectUrl);
                localStorage.setItem('username', username); // Optionally store in localStorage
                dispatch(setReduxUsername(username)); // Dispatch the setUsername action
                navigate(response.data.redirectUrl);
            } else {
                console.log(response.data);
            }
        } catch (e) {
            if (e.response && e.response.status === 404) {
                setErrorMessage('User does not exist');
            } else if (e.response && e.response.status === 401) {
                setErrorMessage('Invalid password');
            } else {
                console.log("error", e);
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/register", {
                username: username,
                password: password
            });

            if (response.status === 201) {
                setErrorMessage('User created successfully. Please log in.');
                setIsSignUp(false);
            } else {
                console.log(response.data);
            }
        } catch (e) {
            console.log("error", e);
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
                <div className="inputbox">
                    <input
                        type="text"
                        placeholder='Username'
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <FaUser />
                </div>
                <div className="inputbox">
                    <input
                        type="password"
                        placeholder='Password'
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <MdOutlinePassword />
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
                <div className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
