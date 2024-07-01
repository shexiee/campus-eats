import React, { useState } from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "axios";

const AdminAcceptDasherModal = ({ isOpen, closeModal, googleLink, shopId }) => {
    const [deliveryFee, setDeliveryFee] = useState("");

    if (!isOpen) return null;

    //put limit on delivery fee

    const confirmAccept = async () => {
        // Implement your accept logic here
        console.log("Delivery Fee:", deliveryFee);
        console.log("Shop ID:", shopId);
        // closeModal();
        if(deliveryFee === ""){
            alert("Please enter a delivery fee");
            return;
        }

        try {
            await axios.post('/api/update-shop-df', { shopId, deliveryFee });
        } catch (error) {
            console.error('Error updating shop df:', error);
            alert('Error updating shop df');
        }

        try {
            await axios.post('/api/update-shop-status', { shopId, status: 'active' });
            
        } catch (error) {
            console.error('Error updating shop df:', error);
            alert('Error updating shop df');
        }

        try {
            console.log("shopId", shopId)
            await axios.post('/api/update-account-type', { uid: shopId, account_type: 'shop'});
            alert('account type updated successfully');
            window.location.reload()
            
        
        }catch(error){
            console.error('Error updating account type:', error);
            alert('Error updating account type');
        
        }

    };

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2></h2>
                <div className="aadm-input-container">
                    <h4>
                        <a href={googleLink} target="_blank" rel="noopener noreferrer">Google Maps Link</a>
                    </h4>
                </div>
                <div className="aadm-input-container">
                    <label htmlFor="deliveryFee">Delivery Fee:</label>
                    <input
                        type="number"
                        id="deliveryFee"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(e.target.value)}
                    />
                </div>
                
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={closeModal}>Cancel</button>
                    <button className="aadm-confirm" onClick={() => confirmAccept()}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default AdminAcceptDasherModal;
