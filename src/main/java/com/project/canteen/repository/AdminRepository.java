package com.project.canteen.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.canteen.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Integer> {

    Optional<Admin> findByUsername(String username);

}