import React, { useEffect, useState } from "react";
import "./css/ShopSeller.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faPen} from '@fortawesome/free-solid-svg-icons';
import Navbar from "./Navbar";
import AddToCartModal from "./AddToCartModal";

const ShopSeller = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const CloseShowModal = () => {
        setShowModal(false);
    }

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser]);

    return (
        <>
            <Navbar />
            <div className="sso-body">
                <div className="sss-container">
                    <div className="sss-title-container">
                        <div className="sss-photo">
                            <img src={'/Assets/Panda.png'} alt="store" className="sss-photo-image" />
                        </div>
                        <div className="sss-title">
                            <h2>Sisig ni Tatay</h2>
                            <p>Skina 3rd Street</p>
                            <div className="sss-title-subtext">
                                <p>Category</p>
                                <h4>Chicken</h4>
                                <p>Delivery Fee</p>
                                <h4>$20.00</h4>
                                <p>Reviews</p>
                                <h4>4.7 (100+)</h4>
                                <div className="sss-edit-shop" onClick={() => navigate('/shop-edit-shop')}>
                                    <FontAwesomeIcon icon={faPen}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ss-containes">
                        <div className="ss-header">
                            <h2>Items</h2>
                            <div className="ss-add-item" onClick={() => navigate('/shop-add-item')}>
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                        </div>
                    <div className="ss-item-overall-container">
                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => navigate('/shop-edit-item')}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => navigate('/shop-edit-item')}>
                                                <FontAwesomeIcon style={{fontSize: '15px'}} icon={faPen} />
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => setShowModal(!showModal)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => setShowModal(!showModal)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => setShowModal(!showModal)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => setShowModal(!showModal)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => setShowModal(!showModal)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sss-items-container">
                            <div className="sss-content">
                                <div className="sss-card">
                                    <div className="sss-img">
                                        <img src={'/Assets/Panda.png'} className="sss-image-cover" alt="store" />
                                    </div>
                                    <div className="sss-text">
                                        <div className="sss-subtext">
                                            <p className="sss-h3">Jabe ni Xianna</p>
                                            <p className="sss-p">Fried Chicken</p>
                                        </div>
                                        <h3>$10.00</h3>
                                        <div className="sss-plus-icon" onClick={() => setShowModal(!showModal)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                       
                    </div>

                    </div>
                    
                </div>
                {showModal && <AddToCartModal showModal={showModal} onClose={CloseShowModal} />}
            </div>
        </>
    );
}

export default ShopSeller;
