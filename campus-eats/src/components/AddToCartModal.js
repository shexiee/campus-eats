import React, { useState, useEffect } from "react";
import "./css/AddToCartModal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../context/AuthContext";


const AddToCartModal = ({ showModal, onClose, item }) => {
    const { currentUser } = useAuth();

    const [userQuantity, setUserQuantity] = useState(1);
    const [itemQty, setItemQty] = useState(item.quantity - 1);
    const [totalPrice, setTotalPrice] = useState(item ? item.price : 0);

    useEffect(() => {
        if (item) {
            setTotalPrice(item.price * userQuantity);
        }
    }, [userQuantity, item]);

    const increaseUserQuantity = () => {
        if (itemQty > 0 && itemQty) {
            setUserQuantity(prevUserQuantity => {
                const newQuantity = prevUserQuantity + 1;
                setItemQty(itemQty - 1);
                return newQuantity;
            });
        }
    };

    const decreaseUserQuantity = () => {
        if (itemQty < item.quantity) {
            setUserQuantity(prevUserQuantity => {
                const newUserQuantity = prevUserQuantity > 1 ? prevUserQuantity - 1 : 1;
                if (newUserQuantity < prevUserQuantity && item) {
                    setItemQty(itemQty + 1);
                }
                return newUserQuantity;
            });
        }
    };

    const addToCart = async () => {
        console.log('Adding item to cart:', item.shopID);
        try {
            const response = await fetch('/api/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    itemQty: userQuantity,
                    item: {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: itemQty
                    },
                    totalPrice: totalPrice,
                    userQuantity: userQuantity,
                    uid: currentUser.uid,
                    shopID: item.shopID
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add item to cart');
              }
              onClose();
              window.location.reload();
        } catch (error) {
            console.error('Error adding item to cart:', error);
            alert(error.message); // Display the error message
        }
    };

    return (
        <div className={`shop-modal-overlay ${showModal ? 'show' : ''}`} onClick={onClose}>
            <div className="shop-modal" onClick={e => e.stopPropagation()}>
                <button className="shop-close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                {item && (
                    <>
                        <h1>{item.name}</h1>
                        <div className="item-image">
                            <img src={item.imageUrl || '/Assets/Panda.png'} alt={item.name} className="item-image" />
                        </div>
                        <div className="info">
                            <div className="header">
                                <h3>Description:</h3>
                                <h3>Qty: {itemQty}</h3>
                            </div>
                            <p>{item.description}</p>
                        </div>
                        <div className="price">
                            <h2>₱{totalPrice.toFixed(2)}</h2>
                        </div>
                        <div className="action-controls">
                            <div className="quantity-controls">
                                <button className="quantity-button" onClick={decreaseUserQuantity}>
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>
                                <span className="quantity-number">{userQuantity}</span>
                                <button className="quantity-button" onClick={increaseUserQuantity} disabled={item.quantity === 0}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                            <button className="add-to-cart-button" onClick={addToCart}>Add to Cart</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddToCartModal;
