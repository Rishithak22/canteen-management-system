package com.project.canteen.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.canteen.service.AdminService;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        boolean success = adminService.login(username, password);

        if (success) {

            Map<String, String> response = new HashMap<>();
            response.put("message", "Login Successful");

            return ResponseEntity.ok(response);

        } else {

            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid Username or Password");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        }
    }

}