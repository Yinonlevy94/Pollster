import React from 'react';
import './LoginForm.css'; 
import { FaUser } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";



function LoginForm() {
    return (
        <div className='wrapper'>
            <form action="">
                <h1>Login</h1>
                <div className="inputbox">
                    <input type="text" placeholder='Username' required />
                    <FaUser />
                </div>
                <div className="inputbox">
                    <input type="password" placeholder='Password' required />
                    <MdOutlinePassword />
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
