package com.project.canteen.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.project.canteen.entity.MenuItem;
import com.project.canteen.repository.MenuRepository;

@Service
public class MenuService {

    private final MenuRepository menuRepository;

    public MenuService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }


    // Get all menu items
    public List<MenuItem> getAllMenuItems() {
        return menuRepository.findAll();
    }


    // Get one menu item by id
    public MenuItem getMenuItemById(Integer id) {
        return menuRepository.findById(id)
                .orElse(null);
    }


    // Add new menu item
    public MenuItem addMenuItem(MenuItem menuItem) {

        if (menuItem.getName() == null || menuItem.getName().trim().isEmpty()) {
            throw new RuntimeException("Menu name is required");
        }

        if (menuItem.getDescription() == null || menuItem.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is required");
        }

        if (menuItem.getCategory() == null || menuItem.getCategory().trim().isEmpty()) {
            throw new RuntimeException("Category is required");
        }

        if (menuItem.getPrice() == null || menuItem.getPrice().doubleValue() <= 0) {
            throw new RuntimeException("Price must be greater than 0");
        }

        if (menuItem.getImageUrl() == null || menuItem.getImageUrl().trim().isEmpty()) {
            throw new RuntimeException("Image URL is required");
        }
        
        if (menuRepository.existsByNameIgnoreCase(menuItem.getName())) {
            throw new RuntimeException("Menu item already exists");
        }

        return menuRepository.save(menuItem);
    }

	// Update menu item
    public MenuItem updateMenuItem(Integer id, MenuItem menuItem) {

        MenuItem existing = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu Item Not Found"));

        if (menuItem.getName() == null || menuItem.getName().trim().isEmpty()) {
            throw new RuntimeException("Menu name is required");
        }

        if (menuItem.getDescription() == null || menuItem.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is required");
        }

        if (menuItem.getCategory() == null || menuItem.getCategory().trim().isEmpty()) {
            throw new RuntimeException("Category is required");
        }

        if (menuItem.getPrice() == null || menuItem.getPrice().doubleValue() <= 0) {
            throw new RuntimeException("Price must be greater than 0");
        }

        if (menuItem.getImageUrl() == null || menuItem.getImageUrl().trim().isEmpty()) {
            throw new RuntimeException("Image URL is required");
        }

        existing.setName(menuItem.getName());
        existing.setDescription(menuItem.getDescription());
        existing.setCategory(menuItem.getCategory());
        existing.setPrice(menuItem.getPrice());
        existing.setImageUrl(menuItem.getImageUrl());
        existing.setVeg(menuItem.getVeg());
        existing.setBestseller(menuItem.getBestseller());
        existing.setAvailable(menuItem.getAvailable());

        return menuRepository.save(existing);
    }



	// Delete menu item
	public void deleteMenuItem(Integer id) {

	    if (!menuRepository.existsById(id)) {
	        throw new RuntimeException("Menu Item Not Found");
	    }

	    menuRepository.deleteById(id);
	}
	


	public MenuItem updateAvailability(Integer id, Boolean available){

	    MenuItem item = menuRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Menu Item Not Found"));

	    item.setAvailable(available);

	    return menuRepository.save(item);

	}
	

}