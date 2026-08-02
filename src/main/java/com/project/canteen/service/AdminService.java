package com.project.canteen.service;

import org.springframework.stereotype.Service;

import com.project.canteen.entity.Admin;
import com.project.canteen.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public boolean login(String username, String password) {

        Admin admin = adminRepository.findByUsername(username)
                .orElse(null);

        if (admin == null) {
            return false;
        }

        return admin.getPassword().equals(password);
    }

}