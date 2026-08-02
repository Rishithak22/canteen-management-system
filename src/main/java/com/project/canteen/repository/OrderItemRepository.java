package com.project.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.canteen.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

}