import React, { useState } from 'react';
import './LoginForm.css'; 
import { FaUser } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import axios from 'axios'; 

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault(); 
        try {
            const response = await axios.post("http://localhost:5000/api/", {
                username: username,
                password: password
            });
            console.log(response.data); 
        } catch (e) {
            console.log("error", e);
        }
    }

    return (
        <div className='wrapper'>
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
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
                <button type="submit">Login</button> {/* Submit button added */}
            </form>
        </div>
    );
}

export default LoginForm;
