    import React, { useEffect, useState } from "react";
    import "./css/Shop.css";
    import { useAuth } from "../context/AuthContext";
    import { useNavigate, useParams } from "react-router-dom";
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faPlus } from '@fortawesome/free-solid-svg-icons';
    import Navbar from "./Navbar";
    import AddToCartModal from "./AddToCartModal";

    const Shop = () => {
        const { currentUser } = useAuth();
        const navigate = useNavigate();
        const { shopId } = useParams(); // Get shopId from URL parameters
        const [shop, setShop] = useState(null);
        const [showModal, setShowModal] = useState(false);
        const [items, setItems] = useState([]);
        const [selectedItem, setSelectedItem] = useState(null); // Add state for selected item

        const fetchShop = async (shopId) => {
            try {
                const response = await fetch(`/api/shop/${shopId}`); // Assuming this is your endpoint for fetching a single shop
                if (!response.ok) {
                    throw new Error('Failed to fetch shop');
                }
                const data = await response.json();
                setShop(data);
            } catch (error) {
                console.error('Error fetching shop:', error);
            }
        };

        const fetchShopItems = async (shopId) => {
            try {
                const response = await fetch(`/api/shop/${shopId}/items`);
                if (!response.ok) {
                    throw new Error('Failed to fetch shop items');
                }
                const data = await response.json();
                setItems(data);
                console.log("items", data);
            } catch (error) {
                console.error('Error fetching shop items:', error);
            }
        };

        useEffect(() => {
            if (!currentUser) {
                navigate('/login');
            } else {
                fetchShop(shopId);
                fetchShopItems(shopId);
            }
        }, [currentUser, shopId]);

        const CloseShowModal = () => {
            setShowModal(false);
        }

        const openModalWithItem = (item) => {
            setSelectedItem(item);
            setShowModal(true);
        }

        if (!shop) {
            return <div>Loading...</div>; // Show a loading state while fetching the shop
        }

        const renderCategories = (categories) => {
            return Object.values(categories).map((category, index) => (
                <div key={index} className="category-container">
                    <h4>{category}</h4>
                </div>
            ));
        };

        return (
            <>
                <Navbar />
                <div className="o-body">
                    <div className="s-container">
                        <div className="s-title-container">
                            <div className="s-photo">
                                <img src={shop.shopImage} alt="store" className="s-photo-image" />
                            </div>
                            <div className="s-title">
                                <h2>{shop.shopName}</h2>
                                <p>{shop.shopAddress}</p>
                                <div className="s-title-subtext">
                                    <h4>Description</h4>
                                    <span className="s-shopdesc-ni"><p>{shop.shopDesc}</p></span>
                                    <div className="s-shopcat"><h4>Category</h4></div>
                                    <div className="s-category">{renderCategories(shop.categories)}</div>
                                    </div>
                                <div className="s-fee">    
                                    <h4>Delivery Fee</h4>
                                    <p>₱{shop.deliveryFee}</p>
                                </div>
                            </div>
                        </div>
                        <div className="s-items-container">
                            <h2>Items</h2>
                            <div className="s-content">
                                {items.map(item => (
                                    <div key={item.id} className="s-card" onClick={() => openModalWithItem(item)}>
                                        <div className="s-img">
                                            <img src={item.imageUrl || '/Assets/Panda.png'} className="s-image-cover" alt="store" />
                                        </div>
                                        <div className="s-text">
                                            <div className="s-subtext">
                                                <p className="s-h3">{item.name}</p>
                                                <p className="s-p">{item.description}</p>
                                            </div>
                                            <h3>₱{item.price.toFixed(2)}</h3>
                                            <div className="s-plus-icon">
                                                <FontAwesomeIcon icon={faPlus} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {showModal && <AddToCartModal item={selectedItem} showModal={showModal} onClose={CloseShowModal} />}
                </div>
            </>
        );
    }

    export default Shop;
