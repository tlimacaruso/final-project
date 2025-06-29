import {doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore";
import {db} from "../firebaseConfig";

export const getUserWishlist = async (userId) => {
    if (!userId) return [];

    try{
        const docRef = doc(db, 'userWishlists', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().itemIds || [];
        } else {
            await setDoc(docRef, { itemIds: [] });
            return [];
        }
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return [];
    }
};

export const addToWishlist = async (userId, itemId) => {
    if (!userId || !itemId) return;

    try {
        const docRef = doc(db, 'userWishlists', userId);
        await updateDoc(docRef, {
            itemIds: arrayUnion(itemId)
        });
        console.log("Item added to wishlist successfully!");
    } catch (error) {
        if (error.code === 'not found') {
            await setDoc(docRef, { items: [itemId] });
            console.log("Wishlist created and item added successfully!");
        } else {
            console.error("Error adding item to wishlist:", error);
        }
    }
};

export const removeFromWishlist = async (userId, itemId) => {
    if (!userId || !itemId) return;

    try {
        const docRef = doc(db, 'userWishlists', userId);
        await updateDoc(docRef, {
            itemIds: arrayRemove(itemId)
        });
        console.log("Item removed from wishlist successfully!");
    } catch (error) {
        console.error("Error removing item from wishlist:", error);
    }
};


