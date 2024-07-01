import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./css/Checkout.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const Checkout = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { uid, shopId } = useParams();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobileNum, setMobileNum] = useState("");
    const [deliverTo, setDeliverTo] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [changeFor, setChangeFor] = useState("");
    const [note, setNote] = useState("");
    const [cart, setCart] = useState(null);
    const [shop, setShop] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [waitingForPayment, setWaitingForPayment] = useState(false);
    const [paymentLinkId, setPaymentLinkId] = useState("");
    let pollInterval;

    useEffect(() => {
        setLoading(true);
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/user/${uid}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();
                setFirstName(data.firstname || "");
                setLastName(data.lastname || "");
                setMobileNum(data.phone_number || "");
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchCartData = async () => {
            try {
                const response = await fetch(`/api/cart?uid=${uid}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch cart data");
                }
                const data = await response.json();
                setCart(data);
            } catch (error) {
                console.error("Error fetching cart data:", error);
            }
        };

        fetchUserData();
        fetchCartData();
        setLoading(false);
    }, [currentUser.uid]);

    const handleMouseEnter = (e) => {
        setShowTooltip(true);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    useEffect(() => {
        setLoading(true);
        const fetchShopData = async () => {
            if (shopId) {
                try {
                    const response = await fetch(`/api/shop/${shopId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch shop data');
                    }
                    const data = await response.json();
                    setShop(data);
                } catch (error) {
                    console.error('Error fetching shop data:', error);
                }
            }
        };

        fetchShopData();
        setLoading(false);
    }, [cart]);

    const pollPaymentStatus = async (linkId) => {
        const options = {
            method: 'GET',
            url: `https://api.paymongo.com/v1/links/${linkId}`,
            headers: {
                accept: 'application/json',
                authorization: 'Basic c2tfdGVzdF83SGdhSHFBWThORktEaEVHZ2oxTURxMzU6'
            }
        };

        try {
            const response = await axios.request(options);
            console.log("Payment status:", response.data);
            const paymentStatus = response.data.data.attributes.status;
            console.log("Payment status:", paymentStatus);
            if (paymentStatus === 'paid') {
                setWaitingForPayment(false);
                handleOrderSubmission();
            } else {
                console.log("Payment not yet completed. Retrying...");
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(mobileNum.length !== 10 && mobileNum.startsWith('9')) {
            alert("Please enter a valid mobile number");
            setLoading(false);
            return;
        }
    
        if (paymentMethod === "cash") {
            if (changeFor < cart.totalPrice) {
                alert("Change for must be greater than or equal to the total price");
                setLoading(false);
                return;
            } else {
                handleOrderSubmission();
            }
        } else if (paymentMethod === "gcash") {
            try {
                const response = await fetch("/api/create-gcash-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: cart.totalPrice * 100, // PayMongo expects the amount in cents
                        description: `to ${shop.shopName} payment by ${firstName} ${lastName}`,
                        orderId: currentUser.uid,
                    }),
                });
    
                const data = await response.json();
                console.log("GCash Payment Link:", data.checkout_url); // Log the payment link
                
                if (response.ok) {
                    // Open the GCash payment link in a new tab
                    window.open(data.checkout_url, "_blank");
                    setPaymentLinkId(data.id);
                    setWaitingForPayment(true);
                    setLoading(false);
    
                    // Start polling the payment status
                    pollInterval = setInterval(() => {
                        pollPaymentStatus(data.id);
                    }, 10000);
    
                    // Stop polling when payment is completed or user navigates away
                    return () => clearInterval(pollInterval);
                } else {
                    if (response.status === 400) {
                        alert("An active order already exists for this user");
                        setLoading(false);
                        return;
                    } else {
                        alert(`Error: ${data.error}`);
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error creating GCash payment:", error);
                setLoading(false);
                return;
            }
        }
    };
    

    const handleOrderSubmission = async () => {
        const order = {
            uid: currentUser.uid,
            shopID: cart.shopID,
            firstName,
            lastName,
            mobileNum,
            deliverTo,
            paymentMethod,
            changeFor,
            note,
            items: cart.items, // Include items from the cart
            totalPrice: cart.totalPrice, // Include total price from the cart
        };
        try {
            const response = await fetch("/api/place-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
            });
            
            
            if (!response.ok) {
                if (response.status === 400) {
                    alert("An active order already exists for this user");
                    setLoading(false);
                    return;
                }else {
                    throw new Error("Failed to place order");
                }
                
            }
            const data = await response.json();
            console.log("Order placed:", data);
    
            // If order placed successfully, remove the cart and navigate to orders
            try {
                const removeCartResponse = await fetch('/api/remove-cart', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ uid: currentUser.uid })
                });
    
                if (!removeCartResponse.ok) {
                    alert(`Error: ${removeCartResponse.statusText}`);
                    return;
                }
    
                const removeCartData = await removeCartResponse.json();
                setCart(null);
                clearInterval(pollInterval);
                console.log("interval cleared:");
            } catch (error) {
                console.error('Error removing cart:', error);
            }
            
            navigate('/orders');
            
        } catch (error) {
            console.log("Error placing order:", error);
        }
        
        setLoading(false);
    };
    

    return (
        <>
            <Navbar />
            <div className="co-body">
                <div className="co-content-current">
                    <div className="co-card-current co-card-large">
                        <div className="co-text">
                            <h2>Contact Details</h2>
                            <form onSubmit={handleSubmit} className="co-form">
                                <div className="sa-two">
                                    <div className="sa-field-two">
                                        <div className="sa-label-two">
                                            <h3>Firstname</h3>
                                            <input
                                                type="text"
                                                className="first-name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="sa-field-two">
                                        <div className="sa-label-two">
                                            <h3>Lastname</h3>
                                            <input
                                                type="text"
                                                className="last-name"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="co-field-two">
                                    <div className="sa-label-two">
                                        <h3>Mobile Number</h3>
                                        <div className="gcash-input-container">
                                            <span className="gcash-prefix">+63 </span>
                                            <input
                                                type="number"
                                                className="gcash-num"
                                                value={mobileNum}
                                                onChange={(e) => setMobileNum(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className="sa-two">
                                    <div className="sa-field-two i-field-desc">
                                        <div className="sa-label-two">
                                            
                                            <div className="tooltip-container">
                                                <h3>
                                                    Deliver To
                                                    <FontAwesomeIcon
                                                        icon={faInfoCircle}
                                                        className="info-icon"
                                                        onMouseEnter={handleMouseEnter}
                                                        onMouseLeave={handleMouseLeave}
                                                    />
                                                    
                                                </h3>
                                                {showTooltip && (
                                                    <div className={`tooltip ${showTooltip ? 'beside' : ''}`} style={{ top: tooltipPosition.y, left: tooltipPosition.x }}>
                                                        Example: RTL Building, Room 101
                                                    </div>
                                                )}
                                
                                            </div>
                                            

                                            
                                            <div className="gcash-input-container">
                                                <input
                                                    type="text"
                                                    className="deliver-to"
                                                    value={deliverTo}
                                                    onChange={(e) => setDeliverTo(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sa-field-two i-field-desc">
                                        <div className="co-label-two">
                                            <h3>Delivery Note</h3>
                                            <textarea
                                                className="note"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="payment-method">
                                    <h2>Payment Method</h2>
                                    <div className="payment-options">
                                        <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cash"
                                                checked={paymentMethod === "cash"}
                                                onChange={() => setPaymentMethod("cash")}
                                            />
                                            <div className="payment-card">
                                                Cash on Delivery
                                                {paymentMethod === "cash" && (
                                                    <div className="change-for-input">
                                                        <label>Change for:</label>
                                                        <input
                                                            type="number"
                                                            value={changeFor}
                                                            onChange={(e) => setChangeFor(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        {cart && (cart.totalPrice >100) ? (
                                        <label className={`payment-option ${paymentMethod === 'gcash' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="gcash"
                                                checked={paymentMethod === "gcash"}
                                                onChange={() => setPaymentMethod("gcash")}
                                            />
                                            <div className="payment-card">
                                                Online Payment
                                            </div>
                                        </label>
                                        ): (
                                            <></>
                                            )}
                                    </div>
                                </div>
                                <div className="p-buttons">
                                    <button onClick={()=>navigate('/home')} className="p-logout-button">Cancel</button>
                                    <button type="submit" className="p-save-button" disabled={loading || waitingForPayment}>
                                        {waitingForPayment ? "Waiting for Payment" : "Place Order"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="co-card-current co-card-small">
                    {cart ? (
                            <>
                            <div className="co-order-summary">
                                <h3>Your order from</h3>
                                <div className="co-order-text">
                                        <h4>{shop ? shop.shopName: ''}</h4>
                                        <p>{shop ? shop.shopAddress: ''}</p>
                                </div>
                                {cart.items.map((item, index) => (
                                    <div className="co-order-summary-item" key={index}>
                                        <div className="co-order-summary-item-header">
                                            <p>{item.quantity}x</p>
                                            <p>{item.name}</p>
                                        </div>
                                        <p>₱{item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                                <div className="co-order-summary-total-container">
                                    <div className="co-order-summary-subtotal">
                                        <h4>Subtotal</h4>
                                        <h4>₱{cart.totalPrice.toFixed(2)}</h4>
                                    </div>
                                    <div className="co-order-summary-subtotal">
                                        <h4>Delivery Fee</h4>
                                        
                                        <h4>₱{cart.deliveryFee ? cart.deliveryFee.toFixed(2) : '0.00'}</h4>
                                    </div>
                                    <div className="co-order-summary-total">
                                        <h4>Total</h4>
                                        <h4>₱{(cart.totalPrice + (cart.deliveryFee || 0)).toFixed(2)}</h4>
                                    </div>
                                </div>
                            </div>
                            </>
                        ) : (
                            <div className="co-order-summary">
                            <p>Loading order summary...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;