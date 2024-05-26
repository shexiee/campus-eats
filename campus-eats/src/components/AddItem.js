import "./css/AddItem.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

const AddItem = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [dragOver, setDragOver] = useState(false);
    const [categories, setCategories] = useState({
        food: false,
        drinks: false,
        clothing: false,
        electronics: false,
        chicken: false,
        sisig: false,
        samgyupsal: false,
        "burger steak": false,
        pork: false,
        bbq: false,
        "street food": false,
        desserts: false,
        "milk tea": false,
        coffee: false,
        snacks: false,
        breakfast: false,
    });
    const navigate = useNavigate();

    const increaseQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const decreaseQuantity = () => {
        setQuantity(prevQuantity => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCategoryChange = (category) => {
        setCategories({
            ...categories,
            [category]: !categories[category],
        });
    };

    return (
        <>
            <Navbar />

            <div className="ai-body">
                <div className="ai-content-current">
                    <div className="ai-card-current">
                        <div className="ai-container">
                            <div className="ai-info">
                                <h1>Add New Item</h1>
                                <div className="ai-two">
                                    <div className="ai-field-two">
                                        <div className="ai-label-two">
                                            <h3>Item Name</h3>
                                            <input
                                                type="text"
                                                className="ai-item-name"
                                                value="John"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="ai-field-two">
                                        <div className="ai-label-two">
                                            <h3>Item Description</h3>
                                            <input
                                                type="text"
                                                className="ai-item-desc"
                                                value="Wala ko kabalo"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="ai-two">
                                    <div className="ai-field-two">
                                        <div className="ai-label-two">
                                            <h3>Item Price</h3>
                                            <input
                                                type="text"
                                                className="ai-item-price"
                                                value="P1000"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="ai-field-two">
                                        <div className="ai-shop-categories">
                                            <h3>Shop Categories</h3>
                                            <div className="ai-category-checkboxes">
                                                {Object.keys(categories).map((category, index) => (
                                                    <div
                                                        key={index}
                                                        className={`ai-category-item ${
                                                            categories[category] ? "selected" : ""
                                                        }`}
                                                        onClick={() => handleCategoryChange(category)}
                                                    >
                                                        {category}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ai-two-qty">
                                    <div className="ai-field-two-qty">
                                        <div className="ai-label-two-qty">
                                            <h3>Item Quantity</h3>
                                            <div className="ai-quantity-controls">
                                                <button className="ai-quantity-button" onClick={decreaseQuantity}>
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </button>
                                                <span className="ai-quantity-number">{quantity}</span>
                                                <button className="ai-quantity-button" onClick={increaseQuantity}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ai-buttons">
                                    <button className="ai-cancel-button" onClick={() => navigate('/shop-seller')}>Cancel</button>
                                    <button className="ai-save-button" disabled>Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default AddItem;