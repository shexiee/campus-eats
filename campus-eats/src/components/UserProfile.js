import React, { useState, useEffect } from "react";
import "./css/userprofile.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./Navbar";
import { auth, db } from "../config/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword  } from "firebase/auth";


const UserProfile = () => {
    const { logout, currentUser, changePassword } = useAuth();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState({});
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [dob, setDob] = useState('');
    const [confirmpwd, setConfirmpwd] = useState('');
    const [pwd, setPwd] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState('Lexianna');
    const [editUsername, setEditUsername] = useState(false);
    const [courseYear, setCourseYear] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [oldPwd, setOldPwd] = useState('');
    const [accountType, setAccountType] = useState('');
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    useEffect(() => {
      const fetchUserData = async () => {
          if (currentUser) {
              try {
                  const response = await fetch(`http://localhost:3000/api/user/${currentUser.uid}`);
                  const data = await response.json();

                  if (response.ok) {
                      setInitialData(data);
                      setFirstName(data.firstname);
                      setLastName(data.lastname);
                      setUsername(data.username);
                      setContactNumber(data.phone_number || '');
                      setDob(data.dob || '');
                      setCourseYear(data.course_yr || '');
                      setSchoolId(data.school_id || '');
                      setAccountType(data.account_type)
                  } else {
                      console.error('Error fetching user data:', data.error);
                  }
              } catch (error) {
                  console.error('Error fetching user data:', error);
              }
          }
      };
      fetchUserData();
  }, [currentUser]);

    const isFormChanged = () => {
        return (
            firstName !== initialData.firstname ||
            lastName !== initialData.lastname ||
            contactNumber !== (initialData.phone_number || '') ||
            dob !== (initialData.dob || '') ||
            courseYear !== (initialData.course_yr || '') ||
            schoolId !== (initialData.school_id || '') ||
            username !== initialData.username ||
            pwd !== '' ||
            confirmpwd !== '' ||
            oldPwd !== ''
        );
    };

    const handleSave = async () => {
      if (pwd && pwd !== confirmpwd) {
          alert("New passwords do not match");
          return;
      }

      if (pwd && !passwordRegex.test(pwd)) {
        alert("New password must have at least 8 characters, one capital letter and one number");
        return;
    }

      try {
        console.log(oldPwd);
            if (pwd) {
                // Reauthenticate user
                const user = auth.currentUser;
                const credential = EmailAuthProvider.credential(currentUser.email, oldPwd);
                
                await reauthenticateWithCredential(user, credential);
                await changePassword(pwd);
                console.log("Password updated successfully");
                setConfirmpwd('');
                setPwd('');
                setOldPwd('');
            }

          // Update other user data in Firestore
          const response = await fetch(`http://localhost:5000/api/user/${currentUser.uid}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  firstname: firstName,
                  lastname: lastName,
                  phone_number: contactNumber,
                  dob: dob,
                  course_yr: courseYear,
                  school_id: schoolId,
                  username: username
              })
          });

          const data = await response.json();
          
            if (response.ok) {
                alert("Profile updated successfully");
                setEditMode(false);
                setEditUsername(false);
                setInitialData({
                    firstname: firstName,
                    lastname: lastName,
                    phone_number: contactNumber,
                    dob: dob,
                    course_yr: courseYear,
                    school_id: schoolId,
                    username: username
                });

          } else {
              console.error("Error updating profile:", data.error);
              alert("Error updating profile: " + data.error);
          }
      } catch (error) {
          console.error("Error updating profile:", error);
          alert("Error updating profile: " + error.message);
      }
  };

    return (
        <>
            <Navbar />

            <div className="p-body">
                <div className="p-content-current">
                    <div className="p-card-current">
                        <div className="p-container">
                            <div className="p-content">
                                <div className="p-img-holder">
                                    <img src='/Assets/Panda.png' alt="food" className="p-img"/>
                                </div>
                                <div className="p-text">
                                    {editUsername ? (
                                        <div className="p-username-edit">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="username-input"
                                            />
                                            <div className="p-edit" onClick={() => setEditUsername(false)}>
                                                <FontAwesomeIcon style={{fontSize: '15px'}} icon={faTimes} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-username">
                                            <h3>{username}</h3>
                                            <div className="p-edit" onClick={() => setEditUsername(true)}>
                                                <FontAwesomeIcon style={{fontSize: '12px'}} icon={faPen} />
                                            </div>
                                        </div>
                                    )}
                                    <h4>{currentUser.email}</h4>
                                </div>
                            </div>
                            <div className="p-info">
                                <div className="p-two">
                                    <div className="p-field-two">
                                        <div className="p-label-two">
                                            <h3>First Name</h3>
                                            <input
                                                type="text"
                                                className="firstname"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-field-two">
                                        <div className="p-label-two">
                                            <h3>Last Name</h3>
                                            <input
                                                type="text"
                                                className="lastname"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-two">
                                    <div className="p-field-two">
                                        <div className="p-label-two">
                                            <h3>Contact Number</h3>
                                            <input
                                                type="text"
                                                className="contactnumber"
                                                value={contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-field-two">
                                        <div className="p-label-two">
                                            <h3>Date of Birth</h3>
                                            <input
                                                type="date"
                                                className="dateofbirth"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-two">
                                    <div className="p-field-two">
                                        <div className="p-label-two">
                                            <h3>Course & Year (e.g. BSIT-2)</h3> 
                                            <input
                                                type="text"
                                                className="courseyear"
                                                value={courseYear}
                                                onChange={(e) => setCourseYear(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-field-two">
                                        <div className="p-label-two">
                                            <h3>School ID</h3>
                                            <input
                                                type="text"
                                                className="schoolid"
                                                value={schoolId}
                                                onChange={(e) => setSchoolId(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="p-two">
                                    {editMode && (
                                      <div className={editMode ? "p-field-two" : "p-field"}>
                                        <div className={editMode ? "p-label-two" : "p-label"}>
                                            <div className="p-label-icon">
                                                <h3>Old Password</h3>
                                                    <div className="p-edit" onClick={() => setEditMode(false)}>
                                                        <FontAwesomeIcon style={{fontSize: '15px'}} icon={faTimes} />
                                                        <h4>Cancel</h4>
                                                    </div>
                                            </div>
                                            {editMode && (
                                                <input
                                                    type="password"
                                                    className="password"
                                                    value={oldPwd}
                                                    onChange={(e) => setOldPwd(e.target.value)}
                                                />
                                            )}
                                        </div>
                                      </div>
                                    )}
                                    <div className={editMode ? "p-field-two" : "p-field"}>
                                        <div className={editMode ? "p-label-two" : "p-label"}>
                                            <div className="p-label-icon">
                                              {editMode && (
                                                <>
                                                <h3>New Password</h3>
                                                </>
                                                )}
                                                
                                                {!editMode && (
                                                  <>
                                                  <h3>Password</h3>
                                                    <div className="p-edit" onClick={() => setEditMode(true)}>
                                                        <FontAwesomeIcon style={{fontSize: '12px'}} icon={faPen} />
                                                        <h4>Edit</h4>
                                                    </div>
                                                    </>
                                                )}
                                            </div>
                                            {editMode && (
                                                <input
                                                    type="password"
                                                    className="password"
                                                    value={pwd}
                                                    onChange={(e) => setPwd(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {editMode && (
                                        <>
                                            <div className="p-field-two">
                                                <div className="p-label-two">
                                                    <h3>Confirm New Password</h3>
                                                    <input
                                                        type="password"
                                                        className="confirmpwd"
                                                        value={confirmpwd}
                                                        onChange={(e) => setConfirmpwd(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                    
                                <div className="p-buttons">
                                    <button className="p-logout-button" onClick={logout}>Logout</button>
                                    <button className="p-save-button" onClick={handleSave} disabled={!isFormChanged()}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                    <div className="p-content-current p-content-current-small">
                        <div className="p-card-current">
                            <div className="p-upgrade-container">
                                <div className="p-content">
                                    <div className="p-upgrade-text">
                                        <h3>Account Type</h3>
                                        <h4>{accountType ? accountType : ''}</h4>
                                    </div>
                                </div>
                            {accountType === 'shop' ? (
                                <div className="p-info">
                                    <div className="p-upgrade-buttons">
                                        <button onClick={() => navigate('/shop-update')} className="p-upgrade-button">Edit Shop</button>
                                    </div>
                                </div>
                            ): accountType === 'dasher' ? (
                                <div className="p-info">
                                    <div className="p-upgrade-buttons">
                                        <button onClick={() => navigate('/dasher-update')} className="p-upgrade-button">Edit Dasher Profile</button>
                                    </div>
                                </div>
                            ): accountType === 'admin' ? (
                                <>

                                </>
                            ): (
                        
                                <>
                                <div className="p-info">
                                    <div className="p-upgrade-buttons">
                                        <button onClick={() => navigate('/dasher-application')} className="p-upgrade-button">Be a Dasher</button>
                                        <button onClick={() => navigate('/shop-application')} className="p-upgrade-button">Add a Shop</button>
                                    </div>
                                </div>
                                </>
                                 
                            )}
                            </div>
                        </div>
                    </div>
                
            </div>
        </>
    );
};

export default UserProfile;
