package com.project.canteen.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.project.canteen.dto.OrderRequest;
import com.project.canteen.dto.StatusUpdateRequest;
import com.project.canteen.entity.Order;
import com.project.canteen.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order placeOrder(@RequestBody OrderRequest request) {
        return orderService.placeOrder(request);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
    
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Integer id) {

        return orderService.getOrderById(id);

    }
    
    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Integer id,
                              @RequestBody StatusUpdateRequest request) {

        return orderService.updateOrderStatus(id, request.getStatus());

    }
}