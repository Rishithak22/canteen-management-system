package com.project.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.canteen.entity.MenuItem;

@Repository
public interface MenuRepository extends JpaRepository<MenuItem, Integer> {
	boolean existsByNameIgnoreCase(String name);
}