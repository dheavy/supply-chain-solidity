// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable {

    enum SupplyChainSteps {
        Created,
        Paid,
        Delivered
    }

    struct SupplyChainItem {
        ItemManager.SupplyChainSteps step;
        Item item;
        string identifier;
    }

    mapping(uint => SupplyChainItem) public items;
    uint index;

    event SupplyChainStep(uint indexed itemIndex, uint indexed step, address _address);

    function createItem(string memory _identifier, uint _priceInWei) public onlyOwner {
        Item item = new Item(this, _priceInWei, index);
        items[index].item = item;
        items[index].step = SupplyChainSteps.Created;
        items[index].identifier = _identifier;

        emit SupplyChainStep(index, uint(items[index].step), address(item));

        index++;
    }

    function pay(uint _index) public payable onlyOwner {
        Item item = items[_index].item;
        require(address(item) == msg.sender, "Items are sole responsible of updating themselves");
        require(item.priceInWei() == msg.value, "Not fully paid");
        require(items[_index].step == SupplyChainSteps.Created, "Item is further in the supply chain");

        items[_index].step = SupplyChainSteps.Paid;

        emit SupplyChainStep(_index, uint(items[_index].step), address(item));
    }

    function deliver(uint _index) public {
        require(items[_index].step == SupplyChainSteps.Created, "Item is further down the supply chain");
        items[_index].step = SupplyChainSteps.Delivered;

        emit SupplyChainStep(_index, uint(items[_index].step), address(items[_index].item));
    }
}
