package com.project.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.canteen.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Integer> {

}