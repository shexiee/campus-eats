import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import "./css/AdminDasherLists.css";
import AdminAcceptDasherModal from "./AdminAcceptDasherModal";
import axios from "axios";
import { set } from "firebase/database";

const AdminShopList = () => {
    const { currentUser } = useAuth();
    const [pendingShops, setPendingShops] = useState([]);
    const [currentShops, setCurrentShops] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoogleLink, setSelectedGoogleLink] = useState(null);
    const [selectedShopId, setSelectedShopId] = useState(null); // Add state for selected shopId

    const handleDeclineClick = async (shopId) => {
        if (window.confirm("Are you sure you want to decline this shop?")) {
            try {
                await axios.post('/api/update-shop-status', { shopId, status: 'declined' });
                
            } catch (error) {
                console.error('Error updating shop status:', error);
                alert('Error updating shop status');
            }

            
        }
    };

    const handleAcceptClick = (googleLink, shopId) => {
        console.log("gosdsdfgogleLink", googleLink);
        setSelectedShopId(shopId); // Set the selected shopId to state
        setSelectedGoogleLink(googleLink); // Set the selected shopId to state
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await axios.get('/api/shop-lists');
                const pendingShopsHold = response.data.pendingShops;
                const currentShopsHold = response.data.currentShops;
                console.log("pendingShopsHold", pendingShopsHold);
                console.log("currentShopsHold", currentShopsHold);
                const pendingShopsData = await Promise.all(
                    pendingShopsHold.map(async (shop) => {
                        const pendingShopsDataResponse = await axios.get(`/api/user/${shop.id}`);
                        const pendingShopsData = pendingShopsDataResponse.data;
                        return { ...shop, userData: pendingShopsData }; // Renamed to userData for clarity
                    })
                );
              
                const currentShopsData = await Promise.all(
                    currentShopsHold.map(async (shop) => {
                        const currentShopsDataResponse = await axios.get(`/api/user/${shop.id}`);
                        const currentShopsData = currentShopsDataResponse.data;
                        return { ...shop, userData: currentShopsData }; // Renamed to userData for clarity
                    })
                );

                setPendingShops(pendingShopsData);
                setCurrentShops(currentShopsData);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        fetchShops();
    }, []);

    return (
        <>
            <Navbar />

            <div className="adl-body">
                <div className="adl-title">
                    <h2>Pending Shops</h2>
                </div>
                {pendingShops && pendingShops.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Name</div>
                            <div className="adl-word">Address</div>
                            <div className="adl-word">Description</div>
                            <div className="adl-word">Categories</div>
                            <div className="adl-word">Shop Open Time</div>
                            <div className="adl-word">Shop Close Time</div>
                            <div className="adl-word">Banner</div>
                            <div className="adl-word">Actions</div>
                        </div>

                        <div className="adl-container">
                            {pendingShops.map(shop => (
                                <div key={shop.id} className="adl-box">
                                    <div className="adl-box-content">
                                        <div>{shop.shopName}</div>
                                        <div>{shop.shopAddress}</div>
                                        <div>{shop.shopDesc}</div>
                                        <div>{shop.categories.join(', ')}</div>
                                        <div>{shop.shopOpen}</div>
                                        <div>{shop.shopClose}</div>
                                        <div>
                                            <img src={shop.shopImage} alt="shop banner" className="adl-list-pic" />
                                        </div>
                                        <div className="adl-buttons">
                                            <button className="adl-decline" onClick={() => handleDeclineClick(shop.id)}>Decline</button>
                                            <button className="adl-acceptorder" onClick={() => handleAcceptClick(shop.googleLink, shop.id)}>Accept</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No pending shops</div>
                )}

                <div className="adl-title">
                    <h2>Shops</h2>
                </div>
                {currentShops && currentShops.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Name</div>
                            <div className="adl-word">Address</div>
                            <div className="adl-word">Description</div>
                            <div className="adl-word">Categories</div>
                            <div className="adl-word">Shop Open Time</div>
                            <div className="adl-word">Shop Close Time</div>
                            <div className="adl-word">Delivery Fee</div>
                            <div className="adl-word">Google Maps</div>
                            <div className="adl-word">Status</div>
                        </div>

                        <div className="adl-container">
                            {currentShops.map(shop => (
                                <div key={shop.id} className="adl-box">
                                    <div className="adl-box-content">
                                        <div>{shop.shopName}</div>
                                        <div>{shop.shopAddress}</div>
                                        <div>{shop.shopDesc}</div>
                                        <div>{shop.categories.join(', ')}</div>
                                        <div>{shop.shopOpen}</div>
                                        <div>{shop.shopClose}</div>
                                        <div>₱{shop.deliveryFee.toFixed(2)}</div>
                                        <div>
                                            <a href={shop.googleLink} target="_blank" rel="noopener noreferrer">Link</a>
                                        </div>
                                        <div>{shop.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No current shops</div>
                )}
            </div>
            <AdminAcceptDasherModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} googleLink={selectedGoogleLink} shopId={selectedShopId} />
        </>
    );
};

export default AdminShopList;
