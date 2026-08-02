package com.project.canteen.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.canteen.dto.OrderItemRequest;
import com.project.canteen.dto.OrderRequest;
import com.project.canteen.entity.MenuItem;
import com.project.canteen.entity.Order;
import com.project.canteen.entity.OrderItem;
import com.project.canteen.repository.MenuRepository;
import com.project.canteen.repository.OrderItemRepository;
import com.project.canteen.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuRepository menuRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        MenuRepository menuRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.menuRepository = menuRepository;
    }

    public Order placeOrder(OrderRequest request) {

        Order order = new Order();

        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");
        order.setCustomerName(request.getCustomerName());

        order.setMobileNumber(request.getMobileNumber());

        order.setEmail(request.getEmail());

        order.setPickupLocation(request.getPickupLocation());

        order.setPaymentMode(request.getPaymentMode());

        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            MenuItem menuItem = menuRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu Item Not Found"));

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);

            orderItem.setQuantity(itemRequest.getQuantity());

            orderItem.setPrice(menuItem.getPrice());

            BigDecimal subtotal =
                    menuItem.getPrice().multiply(
                            BigDecimal.valueOf(itemRequest.getQuantity()));

            orderItem.setSubtotal(subtotal);

            total = total.add(subtotal);

            orderItemRepository.save(orderItem);
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

	public Order getOrderById(Integer id) {
		return orderRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Order Not Found"));

	}
	
	public Order updateOrderStatus(Integer id, String status) {

	    Order order = orderRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Order Not Found"));

	    order.setStatus(status);

	    return orderRepository.save(order);

	}
    


}