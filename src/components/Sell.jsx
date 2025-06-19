import React, {useState} from "react";

function Sell() {

    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        price: '',
        condition: '',
    });

    return (
        <div>
            <div className="title-h2">Upload item</div>
            <br/>
            <p>Welcome to the selling page! Upload your clothing items describing them in a few easy steps!</p>
            <form onSubmit={handleSubmit}>
                <h3>What are you selling?</h3>
                <input type="text" placeholder="Item name" value={itemData.name} onChange={handleChange}required />
                <h3>Now describe your item:</h3>
                <input typt="text" placeholder= "Description" value= {itemData.description} required />
                <h3>How much is it?</h3>
                <input type="number" placeholder="Price" value={itemData.price} required>€</input>
                <h3>Is it in good condition?</h3>
                <p>Please include pictures of any imperfections or usage marks</p>
                <label><input type="radius" name='condition' value='newTags'>New with tags</input>All tags, original box and everything that came with it</label>
                <label><input type="radius" name='condition' value='newNoTags'>New without tags</input>Never used it, but I took out the tags</label>
                <label><input type="radius" name='condition' value='great'>Great</input>Used, but perfect!</label>
                <label><input type="radius" name='condition' value='good'>Good</input>It's a little used, but looks great</label>
                <label><input type="radius" name='condition' value='okay'>Okay</input>Very preloved, but it's still good!</label>
                <h3>What type of item is it?</h3>
                
            </form>
        </div>
    );
}

export default Sell;