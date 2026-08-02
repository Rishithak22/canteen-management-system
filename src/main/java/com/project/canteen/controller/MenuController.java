package com.project.canteen.controller;


import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.canteen.entity.MenuItem;
import com.project.canteen.service.MenuService;

@RestController
@RequestMapping("/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }


    // Get all menu items
    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuService.getAllMenuItems();
    }


    // Get menu item by id
    @GetMapping("/{id}")
    public MenuItem getMenuItemById(@PathVariable Integer id) {
        return menuService.getMenuItemById(id);
    }


    // Add new menu item
    @PostMapping
    public MenuItem addMenuItem(@RequestBody MenuItem menuItem) {
        return menuService.addMenuItem(menuItem);
    }
    
 // Update menu item
    @PutMapping("/{id}")
    public MenuItem updateMenuItem(@PathVariable Integer id,
                                   @RequestBody MenuItem menuItem) {

        return menuService.updateMenuItem(id, menuItem);

    }

    // Delete menu item
    @DeleteMapping("/{id}")
    public void deleteMenuItem(@PathVariable Integer id) {

        menuService.deleteMenuItem(id);

    }
    @PatchMapping("/{id}/availability")
    public MenuItem updateAvailability(
            @PathVariable Integer id,
            @RequestParam Boolean available){

        return menuService.updateAvailability(id, available);

    }
    
}
